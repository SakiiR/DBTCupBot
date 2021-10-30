import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import Config from '../../config';
import Cup from "../../models/cup";
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Command from '../command';


/**
 * Example command
 */
export default class CreateCupCommand extends Command {
    _name = 'create-cup';
    _description = 'Create a new cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        const cupName = interaction.options.getString('name');

        const cup = new Cup();

        cup.title = cupName;
        cup.challengers = [];
        cup.maps = [...Config.default_map_pool];
        cup.type = Config.default_type;
        cup.boStrategy = Config.default_bo_strategy;

        await cup.save();

        return await interaction.reply({ content: `Cup ${cupName} created!`, ephemeral: true });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description)
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The tournament name (e.q: DBT France duel cup #1)')
                    .setRequired(true)
            );
    }
}