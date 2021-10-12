import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import User from '../models/user';
import Command from './command';


export default class EnrollCommand extends Command {
    _name = 'enroll';
    _description = 'Enroll the user into the system';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        const { username, discriminator, id: discordId } = interaction.user;
        const discordTag = `${username}#${discriminator}`;

        const user = await User.findOne({ discordTag });
        if (!!user)
            return await interaction.reply(`You are already enroll'd into the system`);

        const newUser = new User({ discordTag, discordId, rating: 0, admin: false });
        await newUser.save();

        return await interaction.reply(`You have been enroll'd into the system`);
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}