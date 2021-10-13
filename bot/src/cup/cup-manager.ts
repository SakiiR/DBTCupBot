import { BracketsManager, JsonDatabase } from 'brackets-manager';
import {
    Match as BracketMatch,
    Seeding,
    Status as MatchStatus,
} from 'brackets-model';
import {
    CategoryChannel,
    Channel,
    ChannelData,
    Client,
    GuildChannel,
    Interaction,
    Message,
    MessageActionRow,
    MessageSelectMenu,
    NewsChannel,
    Permissions,
    SelectMenuInteraction,
    StageChannel,
    StoreChannel,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import signale from 'signale';
import Config from '../config';
import Cup, { ICup } from '../models/cup';
import User, { IUser } from '../models/user';
import DiaboticalService from '../services/diabotical';
import getDiscordTag from '../utils/discord-tag';
import getMatchChannelWelcomeMessage from '../utils/match-channel-welcome';
import Serializer from '../utils/serialize';
import BO1 from './pick-ban/bo1';
import BO3 from './pick-ban/bo3';
import { PickBan, Player } from './pick-ban/pick-ban';

import Match from '../models/match';
import getStoragePath from '../utils/storage-path';
import fs from 'fs/promises';
import { isThatAWin } from '../utils/is-that-a-win';

interface RegisterChannelResponse {
    channel?: TextChannel | null;
    highSeedPlayer: IUser;
    lowSeedPlayer: IUser;
}

export interface MatchChannelTopic {
    match?: BracketMatch;
    cupId?: string;
}

export default class CupManager {
    private client: Client;
    private cup: ICup;

    constructor(client: Client, cup: ICup) {
        this.client = client;
        this.cup = cup;
    }

    private getStoragePath(): string {
        return getStoragePath(this.cup);
    }

    public getManager(): BracketsManager {
        return new BracketsManager(new JsonDatabase(this.getStoragePath()));
    }

    private async archiveCup(): Promise<void> {
        const storagePath = this.getStoragePath();


        const data = await fs.readFile(storagePath, "utf-8");
        await fs.writeFile(storagePath.replace('.json', '.json.bak'), data);

        await fs.unlink(storagePath);
    }

    public async getUserByParticipantId(id: number): Promise<IUser | null> {
        const manager = this.getManager();

        const participants = await manager.storage.select('participant');
        const participant = participants.find((p) => p.id === id);

        if (!participant) return null;

        const { name: epicName } = participant;

        return await User.findOne({ epicName });
    }

    public async forceMatchScore(match: BracketMatch, leftScore: number, rightScore: number): Promise<boolean> {
        const manager = this.getManager();

        const matchUpdate = {
            id: match.id,
            status: MatchStatus.Completed,
            opponent1: {
                id: match.opponent1.id,
                score: leftScore,
                result: leftScore > rightScore ? 'win' : 'loss',
            },
            opponent2: {
                id: match.opponent2.id,
                score: rightScore,
                result: leftScore < rightScore ? 'win' : 'loss',
            },
        };

        await manager.update.match({ ...(matchUpdate as BracketMatch) });

        signale.debug({ msg: "Updating match", matchUpdate });

        // don't await this ;) We need to quicly answer to the interaction! 
        this.createChannels();


        return true;
    }

    public async reportMatchScore(match: BracketMatch): Promise<boolean> {
        const matchToBePlayed = match.child_count;
        const op1User = await this.getUserByParticipantId(match.opponent1.id);
        const op2User = await this.getUserByParticipantId(match.opponent2.id);

        const maps = await DiaboticalService.getLastMatches(
            op1User.epicId,
            matchToBePlayed
        );

        const m = new Match();

        m.bracketMatchData = match;
        m.maps = maps;
        m.highSeedPlayer = op1User;
        m.lowSeedPlayer = op2User;

        await m.save();

        const cup = await Cup.findOne({ _id: this.cup._id });

        cup.matches = [...cup.matches, m._id];

        await cup.save();

        const manager = this.getManager();

        let op1Score = 0;
        let op2Score = 0;


        // Compute score
        for (const map of maps) {
            let op1TeamId = -1;
            let op2TeamId = -1;
            const [client1, client2] = map.clients;
            const { teams } = map;
            const { user_id: client1Id, name: client1Username, team_idx: client1TeamId } = client1;
            const { user_id: client2Id, name: client2Username, team_idx: client2TeamId } = client2;

            const errMsg = `Failed to report match: the match retrievied is not '${op1User.epicName}' vs '${op2User.epicName}' but '${client1Username}' vs '${client2Username}' (${map.match_id})`;


            // Check that the current map contains the proper players
            signale.debug({ op: [op1User.epicName, op2User.epicName], client: [client1Username, client2Username] });
            if ([op1User.epicId, op2User.epicId].indexOf(client1Id) === -1) {
                signale.warn(errMsg);
                return false;
            }

            // Check that the current map contains the proper players
            if ([op1User.epicId, op2User.epicId].indexOf(client2Id) === -1) {
                signale.warn(errMsg);
                return false;
            }

            if (map.match_mode !== "duel") {
                signale.warn(`Failed to report match: Invalid match mode ${map.match_mode} (${map.match_id})`);
                return false;
            }


            if (op1User.epicId === client1Id) {
                op1TeamId = client1TeamId;
                op2TeamId = client2TeamId;
            }

            if (op1User.epicId === client2Id) {
                op1TeamId = client2TeamId;
                op2TeamId = client1TeamId;
            }

            // If it is BO1, just write the BO1 score
            if (maps.length === 1) {
                op1Score = teams[op1TeamId].score;
                op2Score = teams[op2TeamId].score;
                break;
            }

            const score1 = teams[op1TeamId].score;
            const score2 = teams[op2TeamId].score;

            if (score1 > score2) op1Score++;
            if (score2 > score1) op2Score++;

            if (isThatAWin(op1Score, op2Score, matchToBePlayed)) {
                signale.debug(`It's a win ${op1Score}-${op2Score} Best of ${matchToBePlayed}`)
                break;
            }
        }

        const matchUpdate = {
            id: match.id,
            status: MatchStatus.Completed,
            opponent1: {
                id: match.opponent1.id,
                score: op1Score,
                result: op1Score > op2Score ? 'win' : 'loss',
            },
            opponent2: {
                id: match.opponent2.id,
                score: op2Score,
                result: op1Score < op2Score ? 'win' : 'loss',
            },
        };

        await manager.update.match({ ...(matchUpdate as BracketMatch) });

        signale.debug({ msg: "Updating match", matchUpdate });

        // don't await this ;) We need to quicly answer to the interaction! 
        this.createChannels();

        return true;
    }

    public async createChannel(
        match: BracketMatch
    ): Promise<RegisterChannelResponse> {
        const guild = await this.client.guilds.fetch(Config.discord_guild_id);
        const everyoneRole = guild.roles.everyone.id;
        const manager = this.getManager();
        const rounds = await manager.storage.select('round');
        const participants = await manager.storage.select('participant');

        const op1User = await this.getUserByParticipantId(match.opponent1.id);
        const {
            discordTag: op1DiscordTag,
            discordId: op1DiscordId,
            epicName: op1EpicName,
        } = op1User;

        const op2User = await this.getUserByParticipantId(match.opponent2.id);
        const {
            discordTag: op2DiscordTag,
            discordId: op2DiscordId,
            epicName: op2EpicName,
        } = op2User;

        const op1DiscordMember = await guild.members.fetch(op1DiscordId);
        const op2DiscordMember = await guild.members.fetch(op2DiscordId);

        // retrieve the list of all participants as DatabaseUser ( containing ranks )
        const users = await User.find({
            epicName: {
                $in: [...participants.map((p) => p.name)],
            },
        });

        const orderedUsers = users
            .map((u) => u.toObject())
            .sort((a, b) => b.rating - a.rating)
            .map((u) => u.epicName);

        const op1Index = orderedUsers.indexOf(op1EpicName);
        const op2Index = orderedUsers.indexOf(op2EpicName);

        const highSeedPlayer = op1Index < op2Index ? op1User : op2User;
        const lowSeedPlayer = op1Index > op2Index ? op1User : op2User;

        const finalRoundId = rounds.length - 1;

        // Computes Best Of
        // is looser bracket
        match.child_count = 3;
        if (match.group_id === 1) {
            if (match.round_id !== finalRoundId) match.child_count = 1;
        }

        signale.debug(
            `Creating channel for ${highSeedPlayer.epicName} vs ${lowSeedPlayer.epicName}`
        );

        // Eventually add new groups ( by name in the config, e.q: Twitchers, Admins etc)
        const defaultPermissions = [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
        ];
        const permissionOverwrites = [
            {
                id: everyoneRole,
                deny: [...defaultPermissions],
            },
            ...[op1DiscordMember, op2DiscordMember].map((id) => ({
                id,
                allow: [...defaultPermissions],
            })),
        ];

        const channelName = `${match.id} ${highSeedPlayer.epicName} vs ${lowSeedPlayer.epicName}`;
        const topic = Serializer.serialize<MatchChannelTopic>({
            match,
            cupId: this.cup._id,
        });

        const existingChannels = await guild.channels.fetch();

        const matchIdToken = `${match.id}-`
        const found = existingChannels.find((c) => c.name.substring(0, matchIdToken.length) === matchIdToken);


        if (!!found) {
            signale.debug(`The channel is already created: ${channelName}`);
            return { channel: null, highSeedPlayer, lowSeedPlayer };
        }

        const channel = await guild.channels.create(channelName, {
            topic,
            permissionOverwrites,
        });

        // save back the modified match
        await manager.storage.update('match', match.id, { ...match });

        await channel.send(
            await getMatchChannelWelcomeMessage(
                this.cup,
                highSeedPlayer,
                lowSeedPlayer,
                match
            )
        );

        return { channel, highSeedPlayer, lowSeedPlayer };
    }

    public async registerPickBan(
        channel: TextChannel | null,
        match: BracketMatch,
        highSeedPlayer: IUser,
        lowSeedPlayer: IUser
    ): Promise<void> {

        if (!channel) return;

        let bo =
            match.child_count === 1
                ? new BO1([...this.cup.maps]) // Actually do a copy of this because we want to compare in the getMapListMessage function, And we don't want the BO class to modify it
                : new BO3([...this.cup.maps]);

        const $this = this;

        function getMapListMessage(maps: string[]): string {
            let msg = '';

            const otherMaps = [...$this.cup.maps].filter(
                (m) => maps.indexOf(m) === -1
            );

            msg += `Map list: \n`;
            msg += '```';

            for (const map of maps) {
                msg += `• ${map}\n`;
            }

            for (const map of otherMaps) {
                msg += `• ~~${map}~~\n`;
            }

            msg += '```';

            return msg;
        }

        const mapListMessage = await channel.send(
            getMapListMessage(bo.remainingMaps())
        );

        async function buildMapPrompt(): Promise<Message> {
            const step = bo.whoPickBan();
            const player =
                step.player == Player.PlayerOne
                    ? highSeedPlayer
                    : lowSeedPlayer;
            const pickBan = step.pickBan === PickBan.Pick ? 'pick' : 'ban';
            const msg = `Please ${getDiscordTag(
                player.discordId
            )}, choose a map to **${pickBan}**`;

            const row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('pickban')
                    .setPlaceholder(`Choose a map`)
                    .addOptions(
                        bo.remainingMaps().map((m) => ({ label: m, value: m }))
                    )
            );

            const promptPickBan = await channel.send({
                content: msg,
                components: [row],
            });

            return promptPickBan;
        }

        let message = await buildMapPrompt();

        const collector = channel.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            time: 60000000,
        });

        let history = `Initial map list: ${this.cup.maps.join(', ')}\n`;

        collector.on('collect', async (interaction: SelectMenuInteraction) => {
            const step = bo.whoPickBan();
            const player =
                step.player == Player.PlayerOne
                    ? highSeedPlayer
                    : lowSeedPlayer;

            if (interaction.user.id !== player.discordId) {
                // Its fine if its SakiiR
                if (Config.admin_tags.indexOf(interaction.user.tag) === -1) {
                    await interaction.reply({
                        content: `Wait for your turn!`,
                        ephemeral: true,
                    });
                    return;
                }
            }

            if (message.deletable) {
                await message.delete();
            }

            const [selectedMap] = interaction.values;

            if (step.pickBan === PickBan.Pick) {
                bo.pick(selectedMap);
                history += `${player.epicName.padEnd(
                    20,
                    ' '
                )}: +${selectedMap}\n`;
            }

            if (step.pickBan === PickBan.Ban) {
                bo.ban(selectedMap);
                history += `${player.epicName.padEnd(
                    20,
                    ' '
                )}: -${selectedMap}\n`;
            }

            let answer = '';

            // answer += `You choose ${selectedMap}\n`;

            if (bo.finished()) {
                answer += `Ready to go =)\n\n`;
                answer += `Your maps are **${bo.get()}**\n`;
                answer += `HF GL !\n`;
                answer += `\n\n`;
                answer += `Map vote history:\n`;
                answer += `\`\`\`\n`;
                answer += history;
                answer += `\`\`\`\n`;

                if (mapListMessage.deletable) await mapListMessage.delete();
            } else {
                await mapListMessage.edit(
                    getMapListMessage(bo.remainingMaps())
                );
                message = await buildMapPrompt();
            }

            if (answer) await interaction.reply(answer);
        });

    }

    public async hasChannel(match: BracketMatch): Promise<boolean> {
        const guild = await this.client.guilds.fetch(Config.discord_guild_id);

        const channels = await guild.channels.fetch();

        const found = channels.find((c) => {
            const [idStr] = c.name.split(' ');
            return idStr === match.id.toString();
        });

        return !!found;
    }

    public async createChannels() {
        const manager = this.getManager();

        const matches = await manager.storage.select('match');

        for (const match of matches) {
            if (match.status === MatchStatus.Ready) {
                // Create channels and message/command handler etc etc
                if (!(await this.hasChannel(match))) {
                    const { channel, highSeedPlayer, lowSeedPlayer } =
                        await this.createChannel(match);

                    await this.registerPickBan(
                        channel,
                        match,
                        highSeedPlayer,
                        lowSeedPlayer
                    );
                }
            }
        }
    }

    private async getSeeding(): Promise<Seeding> {
        const sortedByRankPos = [...this.cup.challengers].sort(
            (a: IUser, b: IUser) => b.rating - b.rating
        );

        const powerOfTwo = (num: number) => Math.log2(num) % 1 === 0;
        while (!powerOfTwo(sortedByRankPos.length)) {
            sortedByRankPos.push(null);
        }

        const seeding: Seeding = sortedByRankPos.map((u: IUser | null) =>
            u ? u.epicName : null
        ) as Seeding;

        return seeding;
    }

    public async start() {
        if (!this.cup) {
            signale.fatal(`Starting cup failure: cup is null`);
            return;
        }

        try {
            await this.archiveCup();
        } catch (e) {
            signale.fatal(e);
        }

        signale.debug(`Starting cup ${this.cup.title}`);

        const manager = this.getManager();

        const seeding = await this.getSeeding();

        signale.debug({ seeding });

        await manager.create({
            name: this.cup.title,
            tournamentId: 0,
            type: 'double_elimination',
            seeding,
            settings: { seedOrdering: ['natural'], grandFinal: 'simple' },
        });

        signale.debug(`Cup created, creating channels ...`);

        await this.createChannels();
    }
}