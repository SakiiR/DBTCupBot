import { Client } from "discord.js";
import Config from "../config";

export default async function cleanChannels(client: Client): Promise<void> {
    const guild = await client.guilds.fetch(Config.discord_guild_id);

    guild.channels.cache.filter((c) => c.name.indexOf('-vs-') !== -1).map(c => {
        c.delete();
    });
}