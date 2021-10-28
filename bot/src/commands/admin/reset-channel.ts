import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseGuildTextChannel, CommandInteraction, SelectMenuInteraction } from "discord.js";
import Config from '../../config';
import CupManager, { MatchChannelTopic } from '../../cup/cup-manager';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Serializer from '../../utils/serialize';
import Command from '../command';
import Cup from "../../models/cup";
import sleep from '../../utils/sleep';


export default class ResetChannelsCommand extends Command {
    _name = 'reset-channel';
    _description = 'Recreate the current channel with the pick/ban etc';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        const channel = interaction.channel as BaseGuildTextChannel;
        const matchChannelTopic = Serializer.deserialize<MatchChannelTopic>(channel.topic);

        if (!matchChannelTopic)
            return await interaction.reply({ content: `The channel topic might be invalid`, ephemeral: true });

        // So first, we remove the channel, and then we all createChannels from the cup manager

        const cup = await Cup.findOne({ _id: matchChannelTopic.cupId });
        if (!cup)
            return await interaction.reply({ content: `The channel topic might be invalid: can't find cup`, ephemeral: true });

        await channel.delete();

        await sleep(10e3);

        const cm = new CupManager(this.client, cup);
        await cm.createChannels();
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}