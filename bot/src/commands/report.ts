import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseGuildTextChannel, CommandInteraction, SelectMenuInteraction } from "discord.js";
import Serializer from '../utils/serialize';
import Command from './command';

import CupManager, { MatchChannelTopic } from '../cup/cup-manager';
import Cup from '../models/cup';
import sleep from '../utils/sleep';
import Config from '../config';


/**
 * Example command
 */
export default class ReportCommand extends Command {
    _name = 'report';
    _description = 'Report match score';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        const channel = interaction.channel as BaseGuildTextChannel;
        const matchChannelTopic = Serializer.deserialize<MatchChannelTopic>(channel.topic);

        if (!matchChannelTopic)
            return await interaction.reply({ content: `The channel topic might be invalid, please contact admins`, ephemeral: true });



        const cup = await Cup.findOne({ _id: matchChannelTopic.cupId });
        if (!cup)
            return await interaction.reply({ content: `The channel topic might be invalid, please contact admins`, ephemeral: true });


        const cupManager = await this.getCupManager(cup._id);

        await interaction.deferReply();

        const res = await cupManager.reportMatchScore(matchChannelTopic.match);
        if (!res) {
            return await interaction.editReply('Cannot report match score, contact admin');
        }


        await interaction.editReply('Match score reported ! thanks');

        await sleep(Config.timeBeforeDeletingChannel);

        if (channel.deletable) await channel.delete();
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}