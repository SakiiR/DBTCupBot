import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import Config from '../../config';
import cleanChannels from '../../utils/clean-channels';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Command from '../command';


/**
 * Cleans up the channels containing '-vs-' from the guild.
 */
export default class CleanChannelsCommand extends Command {
    _name = 'clean-channels';
    _description = 'Clean all the created channels';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {

        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        await cleanChannels(this.client);

        return await interaction.reply({ content: 'done', ephemeral: true });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}