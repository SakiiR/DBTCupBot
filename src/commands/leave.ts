import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
} from 'discord.js';
import getCurrentUser from '../utils/get-interaction-user';


import { IUser } from '../models/user';
import Cup from '../models/cup';
import Command from './command';

export default class LeaveCommand extends Command {
    _name = 'leave';
    _description = 'Leave a specific cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const currentUser = await getCurrentUser(interaction);


        const { values } = interaction;

        const [value] = values;

        const cup = await Cup.findOne({ _id: value }).populate('challengers');

        if (cup.started && !cup.over) return await interaction.reply('Cup has already started!');

        const found = [...cup.challengers].find(
            (u: IUser) => u._id.toString() === currentUser._id.toString()
        );
        if (!found)
            return await interaction.reply('You are not playing this cup');

        await Cup.updateOne(
            { _id: cup._id },
            { $pull: { challengers: currentUser._id } }
        );

        return await interaction.reply(
            `Successfully left  **${cup.title}**`
        );
    }

    async onCommandInteraction(interaction: CommandInteraction) {
        const cups = await Cup.find({
            over: false,
            started: false
        });

        if (cups.length === 0) {
            return await interaction.reply('There are no cups available!');
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(this._name)
                .setPlaceholder('No cup selected')
                .addOptions([
                    ...cups.map((cup) => ({
                        label: cup.title,
                        description: `Leave '${cup.title}'`,
                        value: cup._id.toString(),
                    })),
                ])
        );

        await interaction.reply({
            content: 'Please choose a cup to leave',
            components: [row],
        });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}
