import Config from "../config";
import User, { IUser } from "../models/user";
import jwt from "jsonwebtoken";

interface AuthenticationData {
    discordTag?: string;
}

export default async function getUserByToken(token: string): Promise<IUser | null> {
    try {
        const { discordTag } = jwt.verify(token, Config.api_secret) as AuthenticationData;
        if (!discordTag) return null;
        const user = await User.findOne({ discordTag });

        return user.toObject();
    } catch (e) {
        return null;
    }
}