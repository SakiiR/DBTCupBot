import fs from "fs/promises";
import { Get, NotFoundError, HttpError, JsonController, OnNull, Param } from 'routing-controllers';
import Cup from '../../models/cup';


@JsonController()
export default class CupController {
    @Get('/cups')
    async getAll() {
        const cups = await Cup.find();

        return cups.map(c => c.toObject());
    }

    @Get('/cup/:id')
    async getOne(@Param('id') _id: string) {
        const obj = await Cup.findOne({ _id }).populate("challengers");

        if (!obj) throw new NotFoundError('Cup not found');

        const cup = obj.toJSON();
        try {
            const cupStorage = `cup-${cup._id}.json`;
            const data = await fs.readFile(cupStorage, 'utf8');
            const cupData = JSON.parse(data);

            return ({ cup, cupData });
        } catch (e) {
            return ({ cup });
        }
    }
}