import { Client } from "discord.js";

export default class Command {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}