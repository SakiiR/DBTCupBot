import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseGuildTextChannel, CommandInteraction, SelectMenuInteraction } from "discord.js";
import Serializer from '../utils/serialize';
import Command from './command';

import CupManager, { MatchChannelTopic } from '../cup/cup-manager';
import Cup from '../models/cup';
import signale from 'signale';


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

        const cup = await Cup.findOne({ _id: matchChannelTopic.cupId });
        if (!cup) {
            return await interaction.reply(`The channel topic might be invalid, please contact admins`);
        }

        const cupManager = new CupManager(this.client, cup);

        await cupManager.reportMatchScore(matchChannelTopic.match);

        return await interaction.reply('Match score reported ! thanks');
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}