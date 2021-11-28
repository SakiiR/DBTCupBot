import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, UserFlags } from "discord.js";
import signale from 'signale';
import CupManager from '../../cup/cup-manager';
import Cup from '../../models/cup';
import User, { IUser } from '../../models/user';
import DiaboticalService from '../../services/diabotical';
import enforceAdmin from '../../utils/enforce-admin-interaction';
import Command from '../command';


export default class StartCupCommand extends Command {
    _name = 'start';
    _description = 'Starts the specified cup';

    async onSelectMenuInteraction(interaction: SelectMenuInteraction) {
        const { values: [value] } = interaction;
        const cup = await Cup.findById(value).populate('challengers');


        if (!cup) {
            return await interaction.reply({ content: 'Error: cup is null', ephemeral: true });
        }

        if (cup.challengers.length < 2) {
            return await interaction.reply({ content: 'Cup needs at least 2 challengers', ephemeral: true });
        }

        const challengers: IUser[] = cup.challengers as IUser[];

        for (const challenger of challengers) {
            if (!challenger.epicId || !challenger.epicName) {
                return await interaction.reply({ content: `The user ${challenger.discordTag} didn't link its epic account`, ephemeral: true });
            }
        }



        const participants = cup.challengers.map((challenger) => `\`${challenger.epicName}\``).join(", ");

        signale.debug("Updating rating for all players");
        for (const c of challengers) {
            const user = await User.findOne({ discordTag: c.discordTag });

            user.rating = await DiaboticalService.getUserRating(user.epicId);

            await user.save();
        }
        signale.debug("Updated rating for all players");



        let content = (
            `Starting cup **${cup.title}**\n` +
            `Participants (**${cup.challengers.length}**): ${participants}`
        )

        await interaction.reply({ content });

        const cm = await this.getCupManager(cup._id);

        await cm.start();

        return;
    }

    async onCommandInteraction(interaction: CommandInteraction) {

        if (!(await enforceAdmin(interaction))) {
            return await interaction.reply({ content: 'You are not an admin', ephemeral: true });
        }

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
                        description: `Start '${cup.title}'`,
                        value: cup._id.toString(),
                    })),
                ])
        );

        await interaction.reply({
            content: 'Please choose a cup to start',
            components: [row],
            ephemeral: true,
        });
    }

    async register() {
        return new SlashCommandBuilder()
            .setName(this._name)
            .setDescription(this._description);
    }
}