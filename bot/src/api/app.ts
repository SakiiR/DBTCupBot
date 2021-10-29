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
import jwt from "jsonwebtoken";


interface AuthenticationData {
    discordTag?: string;
}

declare global {
    namespace Express {
        interface Request {
            discordClient: DiscordClient
        }
    }
}

async function getUserByToken(token: string): Promise<IUser | null> {
    try {
        const { discordTag } = jwt.verify(token, Config.api_secret) as AuthenticationData;
        if (!discordTag) return null;
        const user = await User.findOne({ discordTag });

        return user.toObject();
    } catch (e) {
        return null;
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
        })

    }

    /**
     * Starts the API server
     */
    public async start(): Promise<void> {

        await this.config();

        useExpressServer(this.app, {
            controllers: [CupController, AuthController, UserController],
            // middlewares: [CustomErrorHandler],
            // defaultErrorHandler: false,
            development: false,
            routePrefix: '/api',
            currentUserChecker: async (action: Action) => {
                const request = (action.request as Request);
                const token = request.headers.authorization;

                const user = await getUserByToken(token);

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