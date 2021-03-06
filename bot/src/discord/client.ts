import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents } from 'discord.js';
import signale from 'signale';
import CleanChannelsCommand from '../commands/admin/clean-channels';
import CreateAdminCommand from '../commands/admin/create-admin';
import CreateCupCommand from '../commands/admin/create-cup';
import ForceScoreCommand from '../commands/admin/force-score';
import ListAdminsCommand from '../commands/admin/list-admins';
import RemoveAdminCommand from '../commands/admin/remove-admin';
import ResetChannelsCommand from '../commands/admin/reset-channel';
import StartCupCommand from '../commands/admin/start';
import BeerCommand from '../commands/beer';
import EnrollCommand from '../commands/enroll';
import LeaveCommand from '../commands/leave';
import LinkEpicCommand from '../commands/link-epic';
import ListPlayersCommand from '../commands/list-challengers';
import PingCommand from '../commands/ping';
import ReportCommand from '../commands/report';
import RollCommand from '../commands/roll';
import SignupCommand from '../commands/signup';




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

    public getClient() {
        return this.client;
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
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MEMBERS"] });

        // When the client is ready, run this code (only once)
        this.client.once('ready', () => {
            signale.success('Ready!');
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                const { commandName } = interaction;

                signale.debug(`${interaction.user.tag}: /${commandName}`);

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

        this.commands = [
            new PingCommand(this.client),
            new ListAdminsCommand(this.client),
            new CreateAdminCommand(this.client),
            new EnrollCommand(this.client),
            new LinkEpicCommand(this.client),
            new RemoveAdminCommand(this.client),
            new CreateCupCommand(this.client),
            new SignupCommand(this.client),
            new ListPlayersCommand(this.client),
            new LeaveCommand(this.client),
            new StartCupCommand(this.client),
            new RollCommand(this.client),
            new CleanChannelsCommand(this.client),
            new ReportCommand(this.client),
            new ForceScoreCommand(this.client),
            new BeerCommand(this.client),
            new ResetChannelsCommand(this.client)
        ];

        try {
            await this.registerCommands();
        } catch (e) {
            signale.warn("Could not register commands: ");
            signale.warn(e);
        }
    }
}
