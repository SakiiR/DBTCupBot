import { Request, Response } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import signale from 'signale';
import getUserByToken from '../utils/jwt-check';

@Middleware({ type: 'after' })
export class HttpLogger implements ExpressMiddlewareInterface {
    async use(request: Request, response: Response, next?: (err?: any) => any): Promise<any> {

        const token = request.headers.authorization;

        let username = 'unknown';

        const user = await getUserByToken(token);

        if (!!user) username = user.discordTag;

        let ip = request.headers['x-forwarded-for'];
        if (!ip) ip = request.ip;


        const method = request.method;
        const path = request.path;

        signale.debug(`[${ip}] (Usr ${username}) - ${method} ${path} -> ${response.statusCode}`);

        return next();
    }
}