import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from 'discord.js';
import signale from 'signale';
import User from '../models/user';
import DiaboticalService from '../services/diabotical';
import Command from './command';

export default class LinkEpicCommand extends Command {
    _name = 'link-epic';
    _description = 'Link your epic game account';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
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
        user.rating = (await DiaboticalService.getUserRating(epicId) || 0);


        await user.save();

        await interaction.reply("Your epicId has been register'd successfully");
    }

    async register() {
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
