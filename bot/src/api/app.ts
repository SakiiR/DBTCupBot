import express, { Application } from 'express';
import { Action, useExpressServer } from 'routing-controllers';
import signale from 'signale';
import Config from '../config';
import CupController from './controllers/cup';
import { CustomErrorHandler } from './errors';
import path from "path";
import AuthController from './controllers/auth';

import session from "express-session";
import { IUser } from '../models/user';


declare global {
    namespace Express {
        interface Session {
            user?: IUser
        }

        interface Request {
            session: Session
        }
    }
}


export default class App {
    public app: Application;

    constructor() {
        this.app = express();
    }

    private async config(): Promise<void> {
        this.app.use(session({
            secret: Config.api_secret,
            resave: false,
            saveUninitialized: true,
        }));

        this.app.use('/', express.static(path.join(__dirname, 'public')));
    }

    /**
     * Starts the API server
     */
    public async start(): Promise<void> {

        await this.config();

        useExpressServer(this.app, {
            controllers: [CupController, AuthController],
            // middlewares: [CustomErrorHandler],
            //defaultErrorHandler: false,
            routePrefix: '/api',
            currentUserChecker: async (action: Action) => {
                return action?.request?.session?.user;
            },
            authorizationChecker: async (action: Action, roles: string[]) => {
                const user = action?.request?.session?.user as IUser;

                if (!user) return false;

                if (roles.indexOf('ADMIN')) {
                    return !!user.admin;
                }

                return true;
            },
        })

        this.app.listen(Config.api_port, () => {
            signale.success(`Started API server @ ::${Config.api_port}`);
        });
    }
}