import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Cup from "../../models/cup";
import Config from '../../config';


/**
 * Example command
 */
export default class CreateCupCommand {
    static _name = 'create-cup';
    static _description = 'Create a new cup';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    static async onCommandInteraction(interaction: CommandInteraction) {
        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply('You are not an admin');
        }

        const cupName = interaction.options.getString('name');

        const cup = new Cup();

        cup.title = cupName;
        cup.challengers = [];
        cup.maps = Config.default_map_pool;
        cup.type = Config.default_type;

        await cup.save();

        return await interaction.reply(`Cup ${cupName} created!`);
    }

    static async register() {
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