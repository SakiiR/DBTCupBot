import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import fs from 'fs/promises';
import { BadRequestError, Body, CurrentUser, ForbiddenError, Get, InternalServerError, JsonController, NotFoundError, OnUndefined, Param, Post, Put, Req } from 'routing-controllers';
import User, { IUser } from "../../models/user";
import Cup from '../../models/cup';
import getStoragePath from '../../utils/storage-path';
import CupManager from '../../cup/cup-manager';
import { Request } from 'express';

class AdjustSeedingRequest {
    @IsUUID('4')
    player: string;

    @IsIn(['down', 'up'])
    direction: string;
};

class AddOrRemoveMapRequest {
    @IsNotEmpty()
    name: string;
};

class JoinOrLeaveCupRequest {
    @IsNotEmpty()
    id: string;
}

class StartCupRequest {
    @IsNotEmpty()
    id: string;
}


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

    @Post('/cup/join')
    async joinCup(@Body() joinCupRequest: JoinOrLeaveCupRequest, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        if (!user.epicName || !user.epicId) throw new ForbiddenError('You have to link your epic games account first');

        const cupId = joinCupRequest.id;

        const cup = await Cup.findOne({ _id: cupId }).populate('challengers');

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const challengers = [...cup.challengers];

        const found = challengers.find((c: IUser) => c.discordTag === user.discordTag);
        if (!!found) throw new BadRequestError("You already joined this cup");


        const playerList = [...challengers.map((c: IUser) => c._id), user._id];

        await Cup.updateOne({ _id: cupId }, { $set: { challengers: playerList } });

        return playerList;
    }

    @Post('/cup/leave')
    async leaveCup(@Body() leaveCupRequest: JoinOrLeaveCupRequest, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const cupId = leaveCupRequest.id;

        const cup = await Cup.findOne({ _id: cupId }).populate('challengers');

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const challengers = [...cup.challengers]


        const found = challengers.find((c: IUser) => c.discordTag === user.discordTag);
        if (!found) throw new BadRequestError("You are not part of this cup");


        const playerList = challengers.filter((c: IUser) => c.discordTag !== user.discordTag).map((c: IUser) => c._id);

        await Cup.updateOne({ _id: cupId }, { $set: { challengers: playerList } });

        return playerList;
    }


    @Put('/cup/:id/seeding')
    async adjustSeeding(@Param('id') _id: string, @Body() adjustSeedingRequest: AdjustSeedingRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id })
            .populate(['challengers', 'matches']);

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const found = await User.findOne({ _id: adjustSeedingRequest.player });
        if (!found) throw new BadRequestError("Invalid player");


        let playerList = [...cup.challengers.map(c => c._id)];


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

    @Post('/cup/:id/addMap')
    async addMap(@Param('id') _id: string, @Body() addMapRequest: AddOrRemoveMapRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id })
            .populate(['challengers', 'matches']);

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        if (!cup.maps.includes(addMapRequest.name))
            cup.maps.push(addMapRequest.name);

        await cup.save();

        return cup.maps;
    }

    @Post('/cup/:id/removeMap')
    async removeMap(@Param('id') _id: string, @Body() removeMapRequest: AddOrRemoveMapRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id })
            .populate(['challengers', 'matches']);

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        cup.maps = cup.maps.filter(m => m !== removeMapRequest.name);

        await cup.save();

        return cup.maps;
    }

    @Post('/cup/start')
    @OnUndefined(204)
    async start(@Body() startCupRequest: StartCupRequest, @Req() request: Request, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const _id = startCupRequest.id;

        const cup = await Cup.findOne({ _id }).populate('challengers');

        if (!cup)
            throw new BadRequestError('Invalid cup id provided');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);


        if (cup.challengers.length < 2)
            throw new InternalServerError('Cup needs at least 2 challengers');

        const challengers: IUser[] = cup.challengers as IUser[];

        for (const challenger of challengers) {
            if (!challenger.epicId || !challenger.epicName)
                throw new BadRequestError(`The user ${challenger.discordTag} didn't link its epic account`)
        }


        const cm = new CupManager(request.discordClient.getClient(), cup);

        await cm.start();

        return cup;
    }

}
