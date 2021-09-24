import isAdmin from "./is-admin";

export default async function enforceAdmin(interaction: any): Promise<boolean> {
    const { username, discriminator } = interaction.user;
    const discordTag = `${username}#${discriminator}`;

    return await isAdmin(discordTag);
}