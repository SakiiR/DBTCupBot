import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
} from 'discord.js';
import enforceAdmin from '../utils/enforce-admin-interaction';
import getCurrentUser from '../utils/get-interaction-user';

import signale from "signale";

import { IUser } from '../models/user';
import Cup from '../models/cup';
import LinkEpicCommand from './link-epic';

export default class SignupCommand {
    static _name = 'signup';
    static _description = 'Signup to a specific cup';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const currentUser = await getCurrentUser(interaction);

        if (!currentUser.epicId) return await interaction.reply(`You need to link your Epic account first! use /${LinkEpicCommand._name} first`);

        const { values } = interaction;

        const [value] = values;

        const cup = await Cup.findOne({ _id: value }).populate('challengers');

        const found = [...cup.challengers].find((u: IUser) => u._id.toString() === currentUser._id.toString());
        if (!!found) return await interaction.reply('You are already signed up!');

        await Cup.updateOne({ _id: cup._id }, { $push: { challengers: currentUser._id } });

        return await interaction.reply(`Successfully signed up for **${cup.title}**`)
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
                        description: `Signup to '${cup.title}'`,
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
