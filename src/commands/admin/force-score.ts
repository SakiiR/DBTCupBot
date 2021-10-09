import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseGuildTextChannel, CommandInteraction, SelectMenuInteraction } from "discord.js";
import CupManager, { MatchChannelTopic } from '../../cup/cup-manager';
import Cup from "../../models/cup";
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Serializer from '../../utils/serialize';
import Command from '../command';


/**
 * Example command
 */
export default class ForceScoreCommand extends Command {
    _name = 'force-score';
    _description = 'Force the score of a match';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply('You are not an admin');
        }

        const scoreString = interaction.options.getString('score');

        const scoreTokens = scoreString.split('-');

        const malformedScoreError = `Invalid score provided: ${scoreString}`;

        if (scoreTokens.length !== 2) return await interaction.reply(malformedScoreError);

        let [leftScore, rightScore] = scoreTokens.map(c => parseInt(c));



        const channel = interaction.channel as BaseGuildTextChannel;
        const matchChannelTopic = Serializer.deserialize<MatchChannelTopic>(channel.topic);

        const cup = await Cup.findOne({ _id: matchChannelTopic.cupId });
        if (!cup)
            return await interaction.reply(`The channel topic might be invalid, please contact admins`);


        const cupManager = new CupManager(this.client, cup);

        const res = await cupManager.forceMatchScore(matchChannelTopic.match, leftScore, rightScore);
        if (!res)
            return await interaction.reply(`Failed to force score ...`);


        if (channel.deletable) channel.delete();

        return await interaction.reply(`Score reported !`);

    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description)
            .addStringOption((option) =>
                option
                    .setName('score')
                    .setDescription('The score you want to force (e.q: 2-1 where 2 is for the first player announced in the channel)')
                    .setRequired(true)
            );
    }
}