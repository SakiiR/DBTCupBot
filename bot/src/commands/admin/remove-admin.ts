import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
} from 'discord.js';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import getCurrentUser from '../../utils/get-interaction-user';

import signale from "signale";

import User from '../../models/user';
import Command from '../command';

export default class RemoveAdminCommand extends Command {
    _name = 'remove-admin';
    _description = 'Removes an admin';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        const discordTags = interaction.values;

        signale.debug(`Removing from the admin group: ${discordTags.join(', ')}`);

        await User.updateMany({ discordTag: { $in: discordTags } }, { $set: { admin: false } });

        await interaction.reply({ content: `Removed from the admin group: ${discordTags.join(', ')}`, ephemeral: true });

    }

    async onCommandInteraction(interaction: CommandInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        const currentUser = await getCurrentUser(interaction);

        const adminUsers = await User.find({
            admin: true,
            _id: { $ne: currentUser._id },
        });

        if (adminUsers.length === 0) {
            return await interaction.reply({ content: 'There are no other admins than you!', ephemeral: true });
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(this._name)
                .setPlaceholder('No user selected')
                .addOptions([
                    ...adminUsers.map((u) => ({
                        label: u.discordTag,
                        description: `Remove ${u.discordTag}`,
                        value: u.discordTag,
                    })),
                ])
        );

        await interaction.reply({ content: 'Ok!', ephemeral: true, components: [row] });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}
