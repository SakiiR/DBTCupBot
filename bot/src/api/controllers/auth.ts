import fetch from "node-fetch";
import { CurrentUser, Get, JsonController, OnUndefined, QueryParam, Redirect, Req } from 'routing-controllers';
import Config from "../../config";
import User, { IUser } from "../../models/user";


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
}
