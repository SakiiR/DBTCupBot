require('dotenv').config();

import Config from './config';

import signale from 'signale';
import DiscordClient from './discord/client';

import mongoose from "mongoose";
import User from './models/user';

async function connectMongo() {
    const url = Config.mongo_url;

    try {
        signale.info("Connecting to mongodb ...");
        await mongoose.connect(url);
        signale.success(`Connected to '${url}'`);

    } catch (e) {
        signale.error(`Failed to connect to '${url}'`);
        signale.fatal(e);
    }

}

async function fixtures() {
    for (const discordTag of Config.admin_tags) {
        const user = new User();

        user.discordTag = discordTag;
        user.admin = true;
        user.rating = 0;

        try {
            await user.save();
        } catch (e) {
            if (e.code === 11000) {
                signale.warn(`Could not create admin user ${discordTag}: already exists`);
            } else signale.fatal(e);
        }
    }
}

async function main() {
    signale.info("Configuration: ");
    console.log(Config);

    await connectMongo();

    await fixtures();

    const client = new DiscordClient(Config.discord_token, Config.discord_client_id, Config.discord_guild_id);


    await client.start();

    signale.success("Bot started");
}

main();
