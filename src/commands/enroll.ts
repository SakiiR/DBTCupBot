import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import User from '../models/user';


export default class EnrollCommand {
    static _name = 'enroll';
    static _description = 'Enroll the user into the system';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    static async onCommandInteraction(interaction: CommandInteraction) {
        const { username, discriminator } = interaction.user;
        const discordTag = `${username}#${discriminator}`;

        const user = await User.findOne({ discordTag });
        if (!!user)
            return await interaction.reply(`You are already enroll'd into the system`);

        const newUser = new User({ discordTag, rating: 0, admin: false });
        await newUser.save();

        return await interaction.reply(`You have been enroll'd into the system`);
    }

    static async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}