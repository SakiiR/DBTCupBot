
import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import { Response } from "express";
import User, { IUser } from "../../models/user";

import { BadRequestError, Body, CurrentUser, ForbiddenError, Get, JsonController, NotFoundError, Param, Post, Put, Res } from 'routing-controllers';
import DiaboticalService from '../../services/diabotical';

class ToggleAdminRequest {
    @IsNotEmpty()
    id: string;
}

@JsonController()
export default class UserController {
    @Get('/users')
    async list(@Res() res: Response) {
        const users = await User.find();

        return users.map((u: any) => u.toObject());
    }

    @Get('/user/:id')
    async get(@Param('id') _id: string) {
        const user = await User.findOne({ _id });
        return user.toObject();
    }


    @Put('/users/refresh-rating')
    async refreshRating(@Res() res: Response, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const users = await User.find();

        for (const user of users) {
            const u = await User.findOne({ _id: user._id });
            if (u.epicId && u.epicName) {
                u.rating = await DiaboticalService.getUserRating(u.epicId) || 0;
                await u.save();
            }
        }

        return users.map((u: any) => u.toObject());
    }

    @Put('/users/toggle-admin')
    async toggleAdmin(@Body() toggleAdminRequest: ToggleAdminRequest, @CurrentUser() user?: IUser) {
        if (!user || !user.admin) throw new ForbiddenError('You are not authorized');

        const userId = toggleAdminRequest.id;

        if (user._id === userId) throw new BadRequestError("You cannot toggle admin on yourself");

        const targetUser = await User.findOne({ _id: userId });
        if (!targetUser) throw new BadRequestError('Invalid user id provided');

        // We want to make this user admin, so just do it right away
        if (!targetUser.admin) {
            targetUser.admin = true;
            await targetUser.save();
            return targetUser.toObject();
        }

        // otherwise, we want to remove an admin, so check before if its not the only one remaining
        const adminUsers = await User.find({ admin: true });
        if (adminUsers.length === 1)
            throw new BadRequestError('Only one admin remaining');


        targetUser.admin = false;

        await targetUser.save();
        return targetUser.toObject();
    }
}