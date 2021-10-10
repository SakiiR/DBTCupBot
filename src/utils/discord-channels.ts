
import { Client } from 'discord.js';
import Config from '../config';

/**
 * Returns the discord channel is by name
 * 
 * @param client 
 * @param name 
 */
export default async function getChannelByName(client: Client, name: string): Promise<string | null> {
    const guild = await client.guilds.fetch(Config.discord_guild_id);

    const channels = await guild.channels.fetch();
    const found = await channels.find(c => c.name === name);

    if (!!found) return found.id;

    return null;
}