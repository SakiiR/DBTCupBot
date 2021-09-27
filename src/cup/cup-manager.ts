import { BracketsManager, JsonDatabase } from 'brackets-manager';
import { Status as MatchStatus, Match } from "brackets-model";
import { Client } from 'discord.js';
import signale from 'signale';
import { ICup } from '../models/cup';

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

    public async start() {
        signale.info(`Starting cup ${this.cup.title}`);

        const participants = this.cup.challengers.map((u) => u.discordId);

        const manager = this.getManager();

        await manager.create({
            name: this.cup.title,
            tournamentId: 0,
            type: 'double_elimination',
            seeding: [
                // ...participants,
                ...["SakiiR", "Chamo", "Kanza", "Gpp", "Lyst", "headbang3r", null, null]
            ],
            settings: { seedOrdering: ['natural'], grandFinal: 'simple' },
        });

        const matches = await manager.storage.select('match');

        for (const match of matches) {
            if (match.status === MatchStatus.Ready) {
                // Create channels and message/command handler etc etc
            }
        }

        console.log({ match: await manager.storage.select('match') });
    }
}
