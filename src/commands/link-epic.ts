import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from 'discord.js';
import User from '../models/user';
import DiaboticalService from '../services/diabotical';

export default class LinkEpicCommand {
    static _name = 'link-epic';
    static _description = 'Link your epic game account';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    static async onCommandInteraction(interaction: CommandInteraction) {
        const epicId = interaction.options.getString('epic-id');
        const { username, discriminator } = interaction.user;
        const discordTag = `${username}#${discriminator}`;

        const user = await User.findOne({ discordTag });
        if (!user) return await interaction.reply(`Please, enroll first`);

        // Validate Epic ID
        const epicUser = await DiaboticalService.getUser(epicId);
        if (!epicUser) return await interaction.reply(`Invalid Epic ID`);

        user.epicId = epicId;
        user.epicName = epicUser.name;

        await user.save();

        await interaction.reply("Your epicId has been register'd successfully");
    }

    static async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description)
            .addStringOption((option) =>
                option
                    .setName('epic-id')
                    .setDescription('Your Epic Games identifier')
                    .setRequired(true)
            );
    }
}
