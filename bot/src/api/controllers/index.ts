import { Response } from "express";
import { Controller, Get, Res } from 'routing-controllers';
import signale from "signale";


@Controller()
export default class IndexController {
    @Get('/')
    async index(@Res() res: Response) {
        const index = `${__dirname}/../../../public/index.html`
        signale.debug(`Sending file ${index}`);
        return res.sendFile(index);
    }
}