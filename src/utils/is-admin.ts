import User from "../models/user";

export default async function isAdmin(discordTag: string) {
    return !!(await User.findOne({ discordTag, admin: true }));
}