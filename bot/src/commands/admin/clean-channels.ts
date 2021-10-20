import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import Config from '../../config';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Command from '../command';


/**
 * Cleans up the channels containing '-vs-' from the guild.
 */
export default class CleanChannelsCommand extends Command {
    _name = 'clean-channels';
    _description = '[Dev-UseWithCaution] Clean all the created channels';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) { }

    async onCommandInteraction(interaction: CommandInteraction) {

        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

        const guild = await this.client.guilds.fetch(Config.discord_guild_id);

        guild.channels.cache.filter((c) => c.name.indexOf('-vs-') !== -1).map(c => {
            c.delete();
        })

        return await interaction.reply({ content: 'done', ephemeral: true });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}