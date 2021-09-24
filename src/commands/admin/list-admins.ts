import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction, SelectMenuInteraction } from "discord.js";
import User from '../../models/user';
import Command from '../command';


export default class ListAdminsCommand extends Command {
    _name = 'list-admin';
    _description = 'Returns the admin list';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {
        const adminUsers = await User.find({ admin: true });
        const users = adminUsers.map(user => user.discordTag).join(', ');
        return await interaction.reply(`\`${users}\``);
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}