import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import Command from './command';


export default class BeerCommand extends Command {
    _name = 'beer';
    _description = 'Gives out a beer';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {

        const tag = interaction.user.tag.toLowerCase();

        const allowList = [
            "SakiiR#3822",
            "Chamo#1049",
            "Code187#3370",
        ].map(t => t.toLowerCase());

        if (allowList.includes(tag)) {
            return await interaction.reply(':beer:');
        }


        return await interaction.reply(':warning: no beer for you :warning:');
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}