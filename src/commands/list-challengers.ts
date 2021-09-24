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

export default class ListPlayersCommand {
    static _name = 'list-players';
    static _description = 'List the challengers registered for a specific cup';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const { values } = interaction;

        const [value] = values;

        const cup = await Cup.findOne({ _id: value }).populate('challengers');

        const str = cup.challengers.map(
            (c) => {
                const [discordName] = c.discordTag.split('#');
                const { epicName } = c;
                return `• ${discordName} / ${epicName}`;
            }
        ).join('\n');


        return await interaction.reply(str);
    }

    static async onCommandInteraction(interaction: CommandInteraction) {
        const cups = await Cup.find({
            over: false,
        });

        if (cups.length === 0) {
            return await interaction.reply('There are no cups available!');
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

        await interaction.reply({ content: 'Please choose a cup', components: [row] });
    }

    static async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}
