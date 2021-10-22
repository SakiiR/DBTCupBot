import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
    TextChannel
} from 'discord.js';
import getCurrentUser from '../utils/get-interaction-user';


import { IUser } from '../models/user';
import Cup from '../models/cup';
import Command from './command';
import Config from '../config';

export default class LeaveCommand extends Command {
    _name = 'leave';
    _description = 'Leave a specific cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const currentUser = await getCurrentUser(interaction);


        const { values: [value] } = interaction;

        const cup = await Cup.findOne({ _id: value }).populate('challengers');

        if (cup.started && !cup.over) return await interaction.reply({ content: 'Cup has already started!', ephemeral: true });

        const found = [...cup.challengers].find(
            (u: IUser) => u._id.toString() === currentUser._id.toString()
        );
        if (!found)
            return await interaction.reply({ content: 'You are not playing this cup', ephemeral: true });

        await Cup.updateOne(
            { _id: cup._id },
            { $pull: { challengers: currentUser._id } }
        );

        const guild = await this.client.guilds.fetch(Config.discord_guild_id);
        const channels = await guild.channels.fetch();
        const announcementChannel = await channels.find(c => c.name === Config.announcementChannel) as TextChannel;

        await announcementChannel.send(`**${currentUser.epicName}** left the cup **${cup.title}**`);

        return await interaction.reply(
            { content: `Successfully left  **${cup.title}**`, ephemeral: true }
        );
    }

    async onCommandInteraction(interaction: CommandInteraction) {
        const cups = await Cup.find({
            over: false,
            started: false
        });

        if (cups.length === 0) {
            return await interaction.reply({ content: 'There are no cups available!', ephemeral: true });
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(this._name)
                .setPlaceholder('No cup selected')
                .addOptions([
                    ...cups.map((cup) => ({
                        label: cup.title,
                        description: `Leave '${cup.title}'`,
                        value: cup._id.toString(),
                    })),
                ])
        );

        await interaction.reply({
            content: 'Please choose a cup to leave',
            ephemeral: true,
            components: [row],
        });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}
