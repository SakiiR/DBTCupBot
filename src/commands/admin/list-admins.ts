import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction, SelectMenuInteraction } from "discord.js";
import User from '../../models/user';


export default class ListAdminsCommand {
    static _name = 'list-admin';
    static _description = 'Returns the admin list';

    static async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    static async onCommandInteraction(interaction: CommandInteraction) {
        const adminUsers = await User.find({ admin: true });
        const users = adminUsers.map(user => user.discordTag).join(', ');
        return await interaction.reply(`\`${users}\``);
    }

    static async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}