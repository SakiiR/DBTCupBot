import { BracketsManager, JsonDatabase } from 'brackets-manager';
import { Match, Seeding, Status as MatchStatus } from 'brackets-model';
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
import { ICup } from '../models/cup';
import User, { IUser } from '../models/user';
import getMatchChannelWelcomeMessage from '../utils/match-channel-welcome';
import Serializer from '../utils/serialize';
import BO1 from './pick-ban/bo1';
import BO3 from './pick-ban/bo3';
import { PickBan, Player } from './pick-ban/pick-ban';

interface RegisterChannelResponse {
    channel: TextChannel
    highSeedPlayer: IUser
    lowSeedPlayer: IUser
}

export default class CupManager {
    private client: Client;
    private cup: ICup;

    constructor(client: Client, cup: ICup) {
        this.client = client;
        this.cup = cup;
    }

    private getStoragePath(): string {
        return `cup-${this.cup._id.toString()}.json`;
    }

    public getManager(): BracketsManager {
        return new BracketsManager(new JsonDatabase(this.getStoragePath()));
    }

    public async getUserByParticipantId(id: number): Promise<IUser | null> {
        const manager = this.getManager();

        const participants = await manager.storage.select('participant');
        const participant = participants.find((p) => p.id === id);

        if (!participant) return null;

        const { name: epicName } = participant;

        return await User.findOne({ epicName });
    }


    public async createChannel(match: Match): Promise<RegisterChannelResponse> {
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
        const topic = Serializer.serialize<Match>(match);
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

        // TODO: register channel handler
        // /report
        // /force-score
        // map vote commands

        return { channel, highSeedPlayer, lowSeedPlayer };
    }

    public async registerPickBan(
        channel: TextChannel,
        match: Match,
        highSeedPlayer: IUser,
        lowSeedPlayer: IUser
    ): Promise<void> {
        let bo = match.child_count === 1 ? new BO1(this.cup.maps) : new BO3(this.cup.maps);

        function getMapListMessage(maps: string[]): string {
            let msg = '';

            msg += `Map list: \n`;
            msg += '```'
            for (const map of maps) {
                msg += `• ${map}\n`
            }
            msg += '```'

            return msg;
        }

        const mapListMessage = await channel.send(getMapListMessage(bo.remainingMaps()));


        async function buildMapPrompt(): Promise<Message> {
            const step = bo.whoPickBan();
            const player = step.player == Player.PlayerOne ? highSeedPlayer : lowSeedPlayer;
            const pickBan = step.pickBan === PickBan.Pick ? 'pick' : 'ban';
            const msg = `Please ${player.discordTag}, choose a map to ${pickBan}`;

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('pickban')
                        .setPlaceholder(msg)
                        .addOptions(bo.remainingMaps().map(m => ({ label: m, value: m })))
                );

            const promptPickBan = await channel.send({
                content: msg,
                components: [row]
            })

            return promptPickBan;
        }

        let message = await buildMapPrompt();

        const collector = channel.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 60000000 });

        collector.on('collect', async (interaction: SelectMenuInteraction) => {
            const step = bo.whoPickBan();
            const player = step.player == Player.PlayerOne ? highSeedPlayer : lowSeedPlayer;

            if (interaction.user.id !== player.discordId) {
                await interaction.reply({ content: `Wait for your turn!`, ephemeral: true });
                return;
            }


            const [selectedMap] = interaction.values;

            if (step.pickBan === PickBan.Pick) {
                bo.pick(selectedMap);
            }

            if (step.pickBan === PickBan.Ban) {
                bo.ban(selectedMap)
            }

            let answer = ''

            answer += `You choose ${selectedMap}\n`;


            if (bo.finished()) {
                answer += `Ready to go !!`;
                answer += `Your maps are **${bo.get()}**\n`;
            } else {
                await mapListMessage.edit(getMapListMessage(bo.remainingMaps()));
                message = await buildMapPrompt();
            }


            await interaction.reply(answer);

        });


        signale.debug("end of loop");

    }

    public async hasChannel(match: Match): Promise<boolean> {
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
                    const { channel, highSeedPlayer, lowSeedPlayer } = await this.createChannel(match);

                    await this.registerPickBan(channel, match, highSeedPlayer, lowSeedPlayer);
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
        signale.info(`Starting cup ${this.cup.title}`);

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

        await this.createChannels();
    }
}
