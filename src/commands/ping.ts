import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";


/**
 * Example command
 */
export default class PingCommand {
    static _name = 'ping';
    static _description = 'Replies pong';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    static async onCommandInteraction(interaction: CommandInteraction) {
        return await interaction.reply('pong!!!');
    }

    static async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}