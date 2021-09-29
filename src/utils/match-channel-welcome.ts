import { Match } from "brackets-model";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "../models/user";

export default async function getMatchChannelWelcomeMessage(cupTitle: string, op1User: IUser, op2User: IUser, match: Match): Promise<string> {
    const mapCount = 3;

    const password = uuidv4();

    const tag1 = `<@${op1User.discordId}>`;
    const tag2 = `<@${op2User.discordId}>`;

    return `
    @here

    Welcome to your match ! 

    ** ${tag1} vs ${tag2} **

    The match is BO${mapCount}.

    Higher seed begins with the ban (go ahead @${op1User.discordTag});

    **Please create a public server named \`${cupTitle} - ${op1User.epicName} vs ${op2User.epicName}\` with the following password: ** \`${password}\`
    `;
}