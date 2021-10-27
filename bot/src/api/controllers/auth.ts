import { IsNotEmpty } from "class-validator";
import fetch from "node-fetch";
import { BadRequestError, Body, CurrentUser, ForbiddenError, Get, InternalServerError, JsonController, OnUndefined, Post, QueryParam, Redirect, Req } from 'routing-controllers';
import signale from "signale";
import Config from "../../config";
import User, { IUser } from "../../models/user";
import DiaboticalService from "../../services/diabotical";

class LinkEpicRequest {
    @IsNotEmpty()
    id: string;
}

@JsonController()
export default class AuthController {
    @Get('/auth/callback')
    @Redirect("/")
    async callback(@QueryParam('code') code: string, @Req() req: Express.Request) {
        const oauthResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: Config.discord_client_id,
                client_secret: Config.discord_client_secret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: Config.redirect_uri,
                scope: 'identify',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const oauthData = await oauthResponse.json();

        if (!oauthData.access_token)
            return "?error=Invalid configuration";



        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            },
        });

        const discordUserData = await response.json();

        const discordTag = `${discordUserData.username}#${discordUserData.discriminator}`;

        const user = await User.findOne({ discordTag });

        if (!user)
            return "?error=Invalid User";

        req.session.user = user;
    }


    @Get('/me')
    @OnUndefined(401)
    async me(@CurrentUser() user?: IUser) {
        return user;
    }

    @Post('/link-epic')
    async linkEpic(@Body() linkEpicRequest: LinkEpicRequest, @CurrentUser() u?: IUser) {
        if (!u) throw new ForbiddenError('You are not authorized');

        const epicId = linkEpicRequest.id;

        const { discordTag } = u;

        const user = await User.findOne({ discordTag });
        if (!user) throw new InternalServerError('Invalid logged in user');

        // Validate Epic ID
        const epicUser = await DiaboticalService.getUser(epicId);
        if (!epicUser) throw new BadRequestError('Invalid epic id provided');

        user.epicId = epicId;
        user.epicName = epicUser.name;
        user.rating = (await DiaboticalService.getUserRating(epicId) || 0);


        await user.save();

        return u;
    }
}
