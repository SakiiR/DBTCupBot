import { Client } from "discord.js";

export default class Command {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}