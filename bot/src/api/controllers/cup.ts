import { IsIn, IsUUID } from 'class-validator';
import fs from 'fs/promises';
import { BadRequestError, Body, CurrentUser, ForbiddenError, Get, JsonController, NotFoundError, Param, Put } from 'routing-controllers';
import User, { IUser } from "../../models/user";
import Cup from '../../models/cup';
import getStoragePath from '../../utils/storage-path';

class AdjustSeedingRequest {
    @IsUUID('4')
    player: string;

    @IsIn(['down', 'up'])
    direction: string;
};

@JsonController()
export default class CupController {
    @Get('/cups')
    async getAll() {
        const cups = await Cup.find();

        return cups.map((c) => c.toObject());
    }

    @Get('/cup/:id')
    async getOne(@Param('id') _id: string) {
        const obj = await Cup.findOne({ _id })
            .populate(['challengers', 'matches'])
            .populate({ path: 'matches', populate: { path: 'highSeedPlayer' } })
            .populate({ path: 'matches', populate: { path: 'lowSeedPlayer' } });

        if (!obj) throw new NotFoundError('Cup not found');

        const cup = obj.toJSON();
        try {
            const cupStorage = getStoragePath(cup);
            const data = await fs.readFile(cupStorage, 'utf8');
            const cupData = JSON.parse(data);

            return { cup, cupData };
        } catch (e) {
            return { cup };
        }
    }

    @Put('/cup/:id/seeding')
    async adjustSeeding(@Param('id') _id: string, @Body() adjustSeedingRequest: AdjustSeedingRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const obj = await Cup.findOne({ _id })
            .populate(['challengers', 'matches']);

        if (!obj) throw new NotFoundError('Cup not found');

        const found = await User.findOne({ _id: adjustSeedingRequest.player });
        if (!found) throw new BadRequestError("Invalid player");


        let playerList = [...obj.challengers.map(c => c._id)];


        function move(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
            return array;
        }

        const index = playerList.indexOf(adjustSeedingRequest.player);
        if (index === -1) throw new BadRequestError("Invalid player");

        const delt = adjustSeedingRequest.direction === "up" ? (-1) : (1);

        playerList = move(playerList, index, index + delt);

        await Cup.updateOne({ _id }, { $set: { challengers: playerList } });

        return playerList;
    }
}
