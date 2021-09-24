import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

import { Client, Intents } from 'discord.js';

import signale from 'signale';

import PingCommand from '../commands/ping';
import ListAdminsCommand from '../commands/admin/list-admins';
import CreateAdminCommand from '../commands/admin/create-admin';
import EnrollCommand from '../commands/enroll';
import LinkEpicCommand from '../commands/link-epic';
import RemoveAdminCommand from '../commands/admin/remove-admin';
import CreateCupCommand from '../commands/admin/create-cup';
import SignupCommand from '../commands/signup';
import ListPlayersCommand from '../commands/list-challengers';
import LeaveCommand from '../commands/leave';

export default class DiscordClient {
    private token: string = '';
    private application_id: string = '';
    private guild_id: string = '';
    private client: Client;

    // Add new commands here
    private commands = [
    ];

    constructor(token: string, application_id: string, guild_id: string) {
        this.token = token;
        this.application_id = application_id;
        this.guild_id = guild_id;
    }

    public async registerCommands() {
        const rest = new REST({ version: '9' }).setToken(this.token);

        const commands = await Promise.all(
            this.commands.map(async (c) => (await c.register()).toJSON())
        );

        try {
            await rest.put(
                Routes.applicationGuildCommands(
                    this.application_id,
                    this.guild_id
                ),
                { body: [...commands] }
            );
        } catch (e) {
            signale.error('Could not register commands');
            signale.fatal(e);
        }
    }

    public async start() {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });

        // When the client is ready, run this code (only once)
        this.client.once('ready', () => {
            signale.success('Ready!');
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                const { commandName } = interaction;

                for (const command of this.commands) {
                    if (command._name === commandName) {
                        await command.onCommandInteraction(interaction);
                        break;
                    }
                }
            }

            if (interaction.isSelectMenu()) {
                const { customId: commandName } = interaction;
                for (const command of this.commands) {
                    if (command._name === commandName) {
                        await command.onSelectMenuInteraction(interaction);
                        break;
                    }
                }
            }
        });

        await this.client.login(this.token);

        this.commands.push(new PingCommand(this.client));
        this.commands.push(new ListAdminsCommand(this.client));
        this.commands.push(new CreateAdminCommand(this.client));
        this.commands.push(new EnrollCommand(this.client));
        this.commands.push(new LinkEpicCommand(this.client));
        this.commands.push(new RemoveAdminCommand(this.client));
        this.commands.push(new CreateCupCommand(this.client));
        this.commands.push(new SignupCommand(this.client));
        this.commands.push(new ListPlayersCommand(this.client));
        this.commands.push(new LeaveCommand(this.client));

        await this.registerCommands();
    }
}
