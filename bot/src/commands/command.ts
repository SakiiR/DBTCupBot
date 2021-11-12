import { Client } from "discord.js";
import CupManager from "../cup/cup-manager";
import Cup from "../models/cup";

export default class Command {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async getCupManager(cupId: string): Promise<CupManager | null> {
        const cup = await Cup.findOne({ _id: cupId });

        if (!cup) return null;

        const cupManager = new CupManager(this.client, cup);

        return cupManager;
    }
}