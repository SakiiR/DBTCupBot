import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseGuildTextChannel, CommandInteraction, SelectMenuInteraction } from "discord.js";
import Config from '../../config';
import CupManager, { MatchChannelTopic } from '../../cup/cup-manager';
import Cup from "../../models/cup";
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Serializer from '../../utils/serialize';
import sleep from '../../utils/sleep';
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
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        await interaction.deferReply();

        const scoreString = interaction.options.getString('score');

        const scoreTokens = scoreString.split('-');

        const malformedScoreError = `Invalid score provided: ${scoreString}`;

        if (scoreTokens.length !== 2) return await interaction.reply({ content: malformedScoreError, ephemeral: true });

        let [leftScore, rightScore] = scoreTokens.map(c => parseInt(c));



        const channel = interaction.channel as BaseGuildTextChannel;
        const matchChannelTopic = Serializer.deserialize<MatchChannelTopic>(channel.topic);

        const cup = await Cup.findOne({ _id: matchChannelTopic.cupId });
        if (!cup)
            return await interaction.editReply(`The channel topic might be invalid, please contact admins`);


        const cupManager = new CupManager(this.client, cup);

        const res = await cupManager.forceMatchScore(matchChannelTopic.match, leftScore, rightScore);
        if (!res)
            return await interaction.editReply('Cannot force match score, contact admin');

        await interaction.editReply('Score reported');

        await sleep(Config.timeBeforeDeletingChannel);

        if (channel.deletable) await channel.delete();
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