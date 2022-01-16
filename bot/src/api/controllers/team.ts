
import { Response } from "express";
import { BadRequestError, BodyParam, CurrentUser, Delete, ForbiddenError, Get, JsonController, NotFoundError, OnNull, Param, Post, Put, Res } from "routing-controllers";
import signale from "signale";
import Config from "../../config";
import Cup from "../../models/cup";
import Team, { ITeam } from "../../models/team";
import { IUser } from "../../models/user";
import uuid from "../../utils/uuid";

/**
 * Checks whenever a team is locked ( already in a running cup or something )
 * 
 * @param teamId the team to check
 */
async function isTeamLocked(teamId: string): Promise<boolean> {
    const team = await Team.findOne({ _id: teamId });

    const affectedCups = await Cup.find({
        teams: { $all: [team._id] },
        $or: [{ over: true }, { started: true }],
    });

    return affectedCups.length > 0;
}

@JsonController()
export default class TeamController {
    @Get('/teams')
    async list() {
        const teams = await Team.find().populate('players').select("-password");
        const objects: ITeam[] = teams.map((u: any) => u.toObject());

        return objects;
    }

    @Post('/team/:id/join')
    async join(@Param('id') _id: string, @BodyParam('password') password: string, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ _id });

        if (!team) throw new NotFoundError(`This team does not exist`);

        if (password !== team.password) throw new ForbiddenError('Invalid password');

        const newPlayerList = [
            ...team.players,
            user._id
        ];

        if ((team.players as string[]).includes(user._id)) throw new BadRequestError('You are already in this team');

        if (await isTeamLocked(team._id)) throw new BadRequestError('The team is locked!');

        const alreadyJoinedTeams = await Team.find({ players: { $all: [user._id] } });
        const joinedTeamNames = alreadyJoinedTeams.map(t => t.name).join(', ');

        if (alreadyJoinedTeams.length > Config.max_joined_teams) throw new BadRequestError(`You cannot join more than ${Config.max_joined_teams} teams (Joined teams: ${joinedTeamNames})`);

        await Team.updateOne(
            {
                _id
            },
            {
                $set: {
                    players: [
                        ...newPlayerList
                    ]
                }
            });

        return newPlayerList;
    }


    @Post('/team/:id/leave')
    async leave(@Param('id') _id: string, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ _id });

        if (!team) throw new NotFoundError(`This team does not exist`);

        if (!(team.players as string[]).includes(user._id)) throw new BadRequestError('You do not belong to that team');

        if (await isTeamLocked(team._id)) throw new BadRequestError('The team is locked!');

        const newPlayerList = [
            ...team.players,
        ].filter(p => p !== user._id);

        await Team.updateOne(
            {
                _id
            },
            {
                $set: {
                    players: [
                        ...newPlayerList
                    ]
                }
            });

        return newPlayerList;
    }

    @Put('/team/:id')
    @OnNull(204)
    async edit(@Param('id') _id: string, @BodyParam('name') name: string, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ _id });

        if (!team) throw new NotFoundError(`This team does not exist`);

        const allowed = user.admin || team.owner === user._id;

        if (!allowed) throw new ForbiddenError('You are not allowed to modify the name of that team');

        await Team.updateOne(
            {
                _id
            },
            {
                $set: {
                    name
                }
            });

        return null;
    }

    @Get('/team/:id/password')
    async password(@Param('id') _id: string, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ _id });

        if (!team) throw new NotFoundError(`This team does not exist`);

        const allowed = user.admin || team.owner === user._id;

        if (!allowed) throw new ForbiddenError('You are not authorized');

        return team.password;
    }

    @Put('/team/:id/renew-password')
    @OnNull(204)
    async renewPassword(@Param('id') _id: string, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ _id });

        if (!team) throw new NotFoundError(`This team does not exist`);

        const allowed = user.admin || team.owner === user._id;

        if (!allowed) throw new ForbiddenError('You are not authorized');

        const password = uuid();

        await Team.updateOne({ _id }, {
            $set: {
                password
            }
        });

        return null;
    }




    @Post('/teams')
    async create(@BodyParam('name') name: string, @CurrentUser() user?: IUser) {
        if (!user) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ name });

        if (!!team) throw new BadRequestError('A team already exists with that name');

        const alreadyJoinedTeams = await Team.find({ players: { $all: [user._id] } });
        const joinedTeamNames = alreadyJoinedTeams.map(t => t.name).join(', ');

        if (alreadyJoinedTeams.length > Config.max_joined_teams) throw new BadRequestError(`You cannot join more than ${Config.max_joined_teams} teams (Joined teams: ${joinedTeamNames})`);

        const password = uuid();

        const owner = user._id;

        const data = {
            name,
            owner,
            password,
            players: [owner]
        };

        const newTeam = new Team(data);

        await newTeam.save();

        return newTeam.toObject();
    }

    @Delete('/team/:id')
    @OnNull(204)
    async remove(@Param('id') _id: string, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const team = await Team.findOne({ _id });

        if (!team) throw new NotFoundError('Team does not exist');

        if (await isTeamLocked(team._id)) throw new BadRequestError('This team is locked!');

        await Team.deleteOne({ _id });

        return null;
    }
}