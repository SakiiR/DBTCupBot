import { BracketsManager, JsonDatabase } from 'brackets-manager';
import { Match, Seeding, Status as MatchStatus } from 'brackets-model';
import { Channel, Client, Permissions } from 'discord.js';
import signale from 'signale';
import Config from '../config';
import { ICup } from '../models/cup';
import User, { IUser } from '../models/user';
import getMatchChannelWelcomeMessage from '../utils/match-channel-welcome';
import Serializer from '../utils/serialize';

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

    public async createChannel(match: Match): Promise<Channel> {
        const guild = await this.client.guilds.fetch(Config.discord_guild_id);
        const everyoneRole = guild.roles.everyone.id;

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

        signale.debug(
            `Creating channel for ${op1DiscordTag} vs ${op2DiscordTag}`
        );


        // Eventually add new groups ( by name in the config, e.q: Twitchers, Admins etc)
        const defaultPermissions = [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES];
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

        const channelName = `${op1EpicName} vs ${op2EpicName}`;
        const reason = Serializer.serialize<Match>(match);
        const channel = await guild.channels.create(channelName, {
            reason,
            permissionOverwrites,
        });

        await channel.send(await getMatchChannelWelcomeMessage(this.cup.title, op1User, op2User, match));

        // TODO: register channel handler
        // /report
        // /force-score
        // map vote commands

        return channel;
    }

    public async createChannels() {
        const manager = this.getManager();


        const matches = await manager.storage.select('match');

        for (const match of matches) {
            if (match.status === MatchStatus.Ready) {
                // Create channels and message/command handler etc etc
                await this.createChannel(match);
            }
        }
    }

    private async getSeeding(): Promise<Seeding> {


        const sortedByRankPos = [...this.cup.challengers].sort((a: IUser, b: IUser) => b.rating - b.rating);


        const powerOfTwo = (num: number) => Math.log2(num) % 1 === 0;
        while (!powerOfTwo(sortedByRankPos.length)) {
            sortedByRankPos.push(null);
        }


        const seeding: Seeding = sortedByRankPos.map((u: IUser | null) => u ? u.epicName : null) as Seeding;

        return seeding
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
