import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import Command from './command';


export default class RollCommand extends Command {
    _name = 'roll';
    _description = 'Generates a random numbers between 0 and 10';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        function getRandomInt(max: number = 10) {
            return Math.floor(Math.random() * max);
        }

        return await interaction.reply(`10`);
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}