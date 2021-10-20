import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from 'discord.js';
import signale from 'signale';

import User from '../../models/user';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Command from '../command';

export default class CreateAdminCommand extends Command {
    _name = 'create-admin';
    _description = 'Add a new admin to the database';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        const discordTag = interaction.options.getString('discord-tag');
        const found = await User.findOne({ discordTag });

        signale.info(`create-admin(discordTag: ${discordTag})`);

        if (!found) {
            const newAdmin = new User({ discordTag, rating: 0, admin: true });

            await newAdmin.save();
            await interaction.reply({ content: 'The user was not found so I created it', ephemeral: true });
            return;
        }

        await User.updateOne({ discordTag }, { admin: true });

        await interaction.reply({ content: `\`${discordTag}\` is now admin`, ephemeral: true });
    }

    async register() {
        const users = await User.find({ admin: false });
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description)
            .addStringOption((option) => {
                const opt = option
                    .setName('discord-tag')
                    .setDescription('The discord tag of the user to promote')
                    .setRequired(true);

                // Autocompletion
                for (const user of users) {
                    const { discordTag } = user;
                    const [name] = discordTag.split('#');

                    opt.addChoice(name, discordTag);
                }

                return opt;
            });
    }
}
