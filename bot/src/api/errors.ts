import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";
import signale from "signale";

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err?: any) => any) {
        console.log('do something...');
        signale.debug({ error })
        next();
    }
}