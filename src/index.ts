require('dotenv').config();

import 'reflect-metadata';

import Config from './config';

import signale from 'signale';
import DiscordClient from './discord/client';

import mongoose from 'mongoose';
import User from './models/user';
import DatabaseFixtures from './data/data';
import App from './api/app';

async function connectMongo() {
    const url = Config.mongo_url;

    try {
        signale.info('Connecting to mongodb ...');
        await mongoose.connect(url);
        signale.success(`Connected to '${url}'`);
    } catch (e) {
        signale.error(`Failed to connect to '${url}'`);
        signale.fatal(e);
    }
}

async function getDiscordIdByTag(
    client: DiscordClient,
    tag: string
): Promise<string> {
    const guild = await client
        .getClient()
        .guilds.fetch(Config.discord_guild_id);
    const [name] = tag.split('#');
    const guildMember = await guild.members.fetch({
        query: name,
        limit: 1,
    });
    const member = guildMember.first();
    const discordId = member?.user?.id;

    return discordId;
}

async function fixtures(client: DiscordClient) {
    for (const discordTag of Config.admin_tags) {
        const user = new User();

        const discordId = await getDiscordIdByTag(client, discordTag);

        user.discordId = discordId;
        user.discordTag = discordTag;

        user.admin = true;
        user.rating = 0;

        try {
            await user.save();
        } catch (e) {
            if (e.code === 11000) {
                signale.warn(
                    `Could not create admin user ${discordTag}: already exists`
                );
            } else signale.fatal(e);
        }
    }
}

async function main() {
    signale.info('Configuration: ');
    console.log(Config);

    await connectMongo();

    const client = new DiscordClient(
        Config.discord_token,
        Config.discord_client_id,
        Config.discord_guild_id
    );

    await client.start();

    await fixtures(client);

    if (Config.fill_database) {
        await DatabaseFixtures.fill();
    }

    signale.success('Bot started');

    const app = new App();

    await app.start();
}

main();
