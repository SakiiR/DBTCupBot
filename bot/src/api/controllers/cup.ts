import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import { Request } from 'express';
import fs from 'fs/promises';
import { BadRequestError, Body, CurrentUser, Delete, ForbiddenError, Get, HttpError, InternalServerError, JsonController, NotFoundError, OnNull, Param, Post, Put, Req } from 'routing-controllers';
import Config from '../../config';
import CupManager from '../../cup/cup-manager';
import Cup, { CupBoStrategy } from '../../models/cup';
import User, { IUser } from "../../models/user";
import cleanChannels from '../../utils/clean-channels';
import getDiscordTag from '../../utils/discord-tag';
import getStoragePath from '../../utils/storage-path';

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

class RemoveCupRequest {
    @IsNotEmpty()
    id: string;
}
class JoinOrLeaveCupRequest {
    @IsNotEmpty()
    id: string;
}

class StartCupRequest {
    @IsNotEmpty()
    id: string;
}

class CancelCupRequest {
    @IsNotEmpty()
    id: string;
}

class CreateCupRequest {
    @IsNotEmpty()
    name: string;
}
class KickPlayerRequest {
    @IsNotEmpty()
    id: string;
}

class SetBoStrategyRequest {
    @IsNotEmpty()
    @IsIn(Object.values(CupBoStrategy))
    strategy: string;
}

class SetAutomaticSeedingRequest {
    automaticSeeding: boolean;
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
    async joinCup(@Body() joinCupRequest: JoinOrLeaveCupRequest, @Req() request: Express.Request, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        if (!user.epicName || !user.epicId) throw new ForbiddenError('You have to link your epic games account first');

        const cupId = joinCupRequest.id;

        const cup = await Cup.findOne({ _id: cupId }).populate('challengers');

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const challengers = [...cup.challengers];

        const found = challengers.find((c: IUser) => c.discordTag === user.discordTag);
        if (!!found) throw new BadRequestError("You already joined this cup");

        const cm = new CupManager(request.discordClient.getClient(), cup);
        const discordTag = getDiscordTag(user.discordId);

        await cm.announceMessage(`**${discordTag}** signed up for the cup **${cup.title}**`);


        const playerList = [...challengers.map((c: IUser) => c._id), user._id];

        await Cup.updateOne({ _id: cupId }, { $set: { challengers: playerList } });

        return playerList;
    }

    @Post('/cup/leave')
    async leaveCup(@Body() leaveCupRequest: JoinOrLeaveCupRequest, @Req() request: Express.Request, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const cupId = leaveCupRequest.id;

        const cup = await Cup.findOne({ _id: cupId }).populate('challengers');

        if (!cup) throw new NotFoundError('Cup not found');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const challengers = [...cup.challengers]


        const found = challengers.find((c: IUser) => c.discordTag === user.discordTag);
        if (!found) throw new BadRequestError("You are not part of this cup");

        const cm = new CupManager(request.discordClient.getClient(), cup);
        const discordTag = getDiscordTag(user.discordId);

        await cm.announceMessage(`**${discordTag}** left the cup **${cup.title}**`);


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
    @OnNull(204)
    async start(@Body() startCupRequest: StartCupRequest, @Req() request: Request, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const _id = startCupRequest.id;

        const cup = await Cup.findOne({ _id }).populate('challengers');

        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);


        if (cup.challengers.length < 2)
            throw new InternalServerError('Cup needs at least 2 challengers');

        const challengers: IUser[] = cup.challengers as IUser[];

        for (const challenger of challengers) {
            if (!challenger.epicId || !challenger.epicName)
                throw new HttpError(400, `The user ${challenger.discordTag} didn't link its epic account`);
        }


        const cm = new CupManager(request.discordClient.getClient(), cup);

        await cm.start();
        const discordTag = getDiscordTag(user.discordId);
        await cm.announceMessage(`The cup **${cup.title}** have been started by ${discordTag}`);

        return null;
    }

    @Post('/cup/create')
    async createCup(@Body() createCupRequest: CreateCupRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cupName = createCupRequest.name;

        const found = await Cup.findOne({ title: cupName });
        if (!!found) throw new BadRequestError(`A cup with that name already exists: ${found.title}`);

        const cup = new Cup();

        cup.title = cupName;
        cup.challengers = [];
        cup.maps = [...Config.default_map_pool];
        cup.type = Config.default_type;
        cup.boStrategy = Config.default_bo_strategy;
        cup.automaticSeeding = true;

        await cup.save();

        return cup.toObject();
    }

    @Delete('/cup/remove')
    async removeCup(@Body() removeCupRequest: RemoveCupRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const _id = removeCupRequest.id;
        const cup = await Cup.findOne({ _id });

        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        await Cup.deleteOne({ _id });

        return cup.toObject();
    }

    @Post('/cup/cancel')
    async cancel(@Body() cancelCupRequest: CancelCupRequest, @Req() request: Express.Request, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const _id = cancelCupRequest.id;
        const cup = await Cup.findOne({ _id });

        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        // clean channels
        const client = request.discordClient.getClient();

        await cleanChannels(client);

        // reset state
        await Cup.updateOne({ _id }, {
            $set: {
                started: false,
                over: false
            }
        });

        const cm = new CupManager(request.discordClient.getClient(), cup);
        const discordTag = getDiscordTag(user.discordId);
        await cm.announceMessage(`The cup **${cup.title}** have been cancelled by ${discordTag}`);

        return cup.toObject();
    }

    @Put('/cup/:id/bo-strategy')
    async setBoStrategy(@Param('id') _id: string, @Body() setBoStrategyRequest: SetBoStrategyRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id });
        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const boStrategy = setBoStrategyRequest.strategy;

        await Cup.updateOne({ _id }, { $set: { boStrategy } });

        return boStrategy;
    }

    @Put('/cup/:id/automatic-seeding')
    async setAutomaticSeeding(@Param('id') _id: string, @Body() setAutomaticSeedingRequest: SetAutomaticSeedingRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id });
        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const { automaticSeeding } = setAutomaticSeedingRequest;

        await Cup.updateOne({ _id }, { $set: { automaticSeeding } });

        return automaticSeeding;
    }

    @Put('/cup/:id/kick')
    async kickPlayer(@Param('id') _id: string, @Req() request: Express.Request, @Body() kickPlayerRequest: KickPlayerRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id });
        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        if (cup.started || cup.over) throw new BadRequestError(`Invalid cup state: (started=${cup.started}, over=${cup.over})`);

        const challengers = cup.challengers as string[];

        const newChallengers = challengers.filter(i => i !== kickPlayerRequest.id);

        await Cup.updateOne({ _id }, { $set: { challengers: [...newChallengers] } });

        const cm = new CupManager(request.discordClient.getClient(), cup);
        const discordTag = getDiscordTag(user.discordId);
        const targetUser = await User.findOne({ _id: kickPlayerRequest.id });
        const targetDiscordTag = getDiscordTag(targetUser.discordId);

        await cm.announceMessage(`${discordTag} kicked out ${targetDiscordTag} from the cup **${cup.title}**`);

        return newChallengers;
    }

    @Get('/cup/:id/preview-seeding')
    async previewSeeding(@Param('id') _id: string, @Req() request: Express.Request, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const cup = await Cup.findOne({ _id }).populate('challengers');
        if (!cup)
            throw new HttpError(400, 'Invalid cup id provided');

        const cm = new CupManager(request.discordClient.getClient(), cup);

        const seeding = await cm.getSeeding();

        return seeding;
    }
}
