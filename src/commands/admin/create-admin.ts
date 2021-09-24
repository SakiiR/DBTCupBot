import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from 'discord.js';
import signale from 'signale';

import User from '../../models/user';
import enforceAdmin from '../../utils/enforce-admin-interaction';

export default class CreateAdminCommand {
    static _name = 'create-admin';
    static _description = 'Add a new admin to the database';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    static async onCommandInteraction(interaction: CommandInteraction) {
        if (!await enforceAdmin(interaction)) {
            return await interaction.reply('You are not an admin');
        }

        const discordTag = interaction.options.getString('discord-tag');
        const found = await User.findOne({ discordTag });

        signale.info(`create-admin(discordTag: ${discordTag})`);

        if (!found) {
            const newAdmin = new User({ discordTag, rating: 0, admin: true });

            await newAdmin.save();
            await interaction.reply('The user was not found so I created it');
            return;
        }

        await User.updateOne({ discordTag }, { admin: true });

        await interaction.reply(`\`${discordTag}\` is now admin`);
    }

    static async register() {
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
                    const [name,] = discordTag.split('#');

                    opt.addChoice(name, discordTag);
                }

                return opt;
            });
    }
}
