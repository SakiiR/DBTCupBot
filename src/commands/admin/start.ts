import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import Config from '../../config';
import CupManager from '../../cup/cup-manager';
import Cup from '../../models/cup';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Command from '../command';



export default class StartCupCommand extends Command {
    _name = 'start';
    _description = 'Starts the specified cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const { values: [value] } = interaction;
        const cup = await Cup.findById(value).populate('challengers');

        const guild = await this.client.guilds.fetch(Config.discord_guild_id);


        // if (cup.challengers.length < 2) {
        //     return await interaction.reply('Cup needs at least 2 challengers');
        // }

        const cm = new CupManager(this.client, cup);

        await cm.start();

        // const everyoneRole = guild.roles.everyone.id;

        // const channel = await guild.channels.create('test-toto', {});

        // Eventually add new groups ( by name in the config, e.q: Twitchers, Admins etc)
        // await channel.permissionOverwrites.set([
        //     {
        //         id: everyoneRole,
        //         deny: [Permissions.FLAGS.VIEW_CHANNEL],
        //     }
        // ]);


        return await interaction.reply(`Starting cup **${cup.title}**`);
    }

    async onCommandInteraction(interaction: CommandInteraction) {

        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply('You are not an admin');
        }

        const cups = await Cup.find({
            over: false,
            started: false
        });

        if (cups.length === 0) {
            return await interaction.reply('There are no cups available!');
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(this._name)
                .setPlaceholder('No cup selected')
                .addOptions([
                    ...cups.map((cup) => ({
                        label: cup.title,
                        description: `Start '${cup.title}'`,
                        value: cup._id.toString(),
                    })),
                ])
        );

        await interaction.reply({
            content: 'Please choose a cup to start',
            components: [row],
        });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}