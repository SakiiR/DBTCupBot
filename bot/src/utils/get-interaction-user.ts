import User from "../models/user";

export default async function getCurrentUser(interaction: any) {
    const { username, discriminator } = interaction.user;
    const discordTag = `${username}#${discriminator}`;

    return await User.findOne({ discordTag });
}