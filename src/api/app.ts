import express, { Application } from 'express';
import { useExpressServer } from 'routing-controllers';
import signale from 'signale';
import Config from '../config';
import IndexController from './controllers';
import CupController from './controllers/cup';
import { CustomErrorHandler } from './errors';
import path from "path";

export default class App {
    public app: Application;

    constructor() {
        this.app = express();
    }

    private async config(): Promise<void> {
        this.app.use('/', express.static(path.join(__dirname, 'public')));
    }

    /**
     * Starts the API server
     */
    public async start(): Promise<void> {

        await this.config();

        useExpressServer(this.app, {
            controllers: [CupController],
            middlewares: [CustomErrorHandler],
            defaultErrorHandler: false,
            routePrefix: '/api'
        });

        this.app.listen(Config.api_port, () => {
            signale.success(`Started API server @ ::${Config.api_port}`);
        });
    }
}