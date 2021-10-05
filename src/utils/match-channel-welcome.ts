import { Match } from "brackets-model";
import { v4 as uuidv4 } from "uuid";
import { ICup } from "../models/cup";
import { IUser } from "../models/user";

export default async function getMatchChannelWelcomeMessage(cup: ICup, high: IUser, low: IUser, match: Match): Promise<string> {
    const password = uuidv4();

    const tag1 = `<@${high.discordId}>`;
    const tag2 = `<@${low.discordId}>`;

    return `
    @here

    Welcome to your match ! 

    ** ${tag1} vs ${tag2} **

    The match is BO${match.child_count}.

    Higher seed begins with the ban (go ahead ${tag1});

    The current map pool is: **${cup.maps.join(', ')}**

    **Please create a public server named \`${cup.title} - ${high.epicName} vs ${low.epicName}\` with the following password: ** \`${password}\`
    `;
}