import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import signale from 'signale';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err: any) => any) {
        signale.fatal(error);
        next(null);
    }
}