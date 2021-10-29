import express, { Application, Request } from 'express';
import { Action, useExpressServer } from 'routing-controllers';
import signale from 'signale';
import Config from '../config';
import CupController from './controllers/cup';
import path from "path";
import AuthController from './controllers/auth';

import User, { IUser } from '../models/user';
import UserController from './controllers/user';
import DiscordClient from '../discord/client';
import { HttpLogger } from './logger';
import getUserByToken from "../utils/jwt-check";



declare global {
    namespace Express {
        interface Request {
            discordClient: DiscordClient
            user?: IUser
        }
    }
}



export default class App {
    public app: Application;
    private client: DiscordClient;

    constructor(client: DiscordClient) {
        this.app = express();
        this.client = client;
    }

    private async config(): Promise<void> {

        this.app.use('/', express.static(path.join(__dirname, 'public')));

        this.app.use((req, res, next) => {
            req.discordClient = this.client;
            return next();
        });


    }

    /**
     * Starts the API server
     */
    public async start(): Promise<void> {

        await this.config();

        useExpressServer(this.app, {
            controllers: [CupController, AuthController, UserController],
            middlewares: [HttpLogger],
            // defaultErrorHandler: false,
            development: false,
            routePrefix: '/api',
            currentUserChecker: async (action: Action) => {
                const request = (action.request as Request);
                const token = request.headers.authorization;

                const user = await getUserByToken(token);

                action.request.user = user;

                return user;
            },
            authorizationChecker: async (action: Action, roles: string[]) => {
                const request = (action.request as Request);
                const token = request.headers.authorization;
                const user = await getUserByToken(token);

                if (!user) return false;

                if (roles.indexOf('ADMIN')) {
                    return !!user.admin;
                }

                return true;
            },
        });


        this.app.listen(Config.api_port, () => {
            signale.success(`Started API server @ ::${Config.api_port}`);
        });
    }
}