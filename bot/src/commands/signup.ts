import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
    TextChannel
} from 'discord.js';
import Config from '../config';
import Cup from '../models/cup';
import { IUser } from '../models/user';
import getCurrentUser from '../utils/get-interaction-user';
import getDiscordTag from "../utils/discord-tag";
import Command from './command';
import signale from 'signale';




export default class SignupCommand extends Command {
    _name = 'signup';
    _description = 'Signup to a specific cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const currentUser = await getCurrentUser(interaction);

        if (!currentUser)
            return await interaction.reply(
                { content: `You need to /enroll first`, ephemeral: true }
            );

        if (!currentUser.epicId || !currentUser.epicName)
            return await interaction.reply(
                { content: `You need to link your Epic account first! use /link-epic first`, ephemeral: true }
            );

        const { values: [value] } = interaction;

        const cup = await Cup.findOne({ _id: value }).populate('challengers');

        const found = [...cup.challengers].find(
            (u: IUser) => u._id.toString() === currentUser._id.toString()
        );
        if (!!found)
            return await interaction.reply({ content: 'You are already signed up!', ephemeral: true });

        await Cup.updateOne(
            { _id: cup._id },
            { $push: { challengers: currentUser._id } }
        );

        const cm = await this.getCupManager(cup._id);

	signale.debug({currentUser});
        const discordTag = getDiscordTag(currentUser.discordId);

        await cm.announceMessage(`${discordTag} signed up for the cup **${cup.title}**`);

        return await interaction.reply(
            { content: `Successfully signed up for **${cup.title}**`, ephemeral: true }
        );
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
                    ...cups.map((cup) => ({
                        label: cup.title,
                        description: `Signup to '${cup.title}'`,
                        value: cup._id.toString(),
                    })),
                ])
        );

        await interaction.reply({
            content: 'Please choose a cup',
            components: [row],
            ephemeral: true,
        });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}
