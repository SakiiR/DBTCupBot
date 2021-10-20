import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
} from 'discord.js';
import enforceAdmin from '../utils/enforce-admin-interaction';
import getCurrentUser from '../utils/get-interaction-user';

import Cup from '../models/cup';
import Command from './command';

export default class ListPlayersCommand extends Command {
    _name = 'list-players';
    _description = 'List the challengers registered for a specific cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const { values } = interaction;

        const [value] = values;

        const cup = await Cup.findOne({ _id: value }).populate('challengers');
        if (!cup) return await interaction.reply({ content: "Could not find cup", ephemeral: true });

        const str = cup.challengers.map(
            (c) => {
                const [discordName] = c.discordTag.split('#');
                const { epicName } = c;
                return `• ${discordName} / ${epicName}`;
            }
        ).join('\n');


        return await interaction.reply({ content: str, ephemeral: true });
    }

    async onCommandInteraction(interaction: CommandInteraction) {
        const cups = await Cup.find({
            over: false,
            started: false
        });

        if (cups.length === 0) {
            return await interaction.reply({ content: 'There are no cups available!', ephemeral: true });
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(this._name)
                .setPlaceholder('No cup selected')
                .addOptions([
                    ...cups.map(cup => ({
                        label: cup.title,
                        description: `List players of '${cup.title}'`,
                        value: cup._id.toString(),
                    })),
                ])
        );

        await interaction.reply({ content: 'Please choose a cup', ephemeral: true, components: [row] });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}
