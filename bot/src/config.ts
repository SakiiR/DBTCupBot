export default class Config {
    // Discord
    static discord_token = process.env.DISCORD_TOKEN || 'default-discord-token';
    static discord_client_id = process.env.DISCORD_CLIENT_ID || 'default-discord-client-id';
    static discord_client_secret = process.env.DISCORD_CLIENT_SECRET || 'default-discord-client-secret';
    static discord_guild_id = process.env.DISCORD_GUILD_ID || 'default-discord-guild-id';
    static admin_tags = (process.env.ADMIN_TAGS || 'SakiiR#3822').split(',');
    static redirect_uri = process.env.REDIRECT_URI || 'http://127.0.0.1:444/api/auth/callback';

    // Mongo
    static mongo_url = (process.env.MONGO_URL || 'mongodb://localhost:27017/dbtcup');
    static fill_database: boolean = (process.env.FILL_DATABASE === 'true' ? true : false);

    // Diabotical
    static default_map_pool = ['raya', 'bioplant', 'pavillon x', 'restless', 'skybreak', 'sanctum', 'amberfall'];
    static default_type = "double_elimination";

    static cup_storage = process.env.CUP_STORAGE || "/tmp"

    // API
    static api_port = parseInt(process.env.API_PORT || '31337');

    static dev: boolean = process.env.NODE_ENV !== 'prod';

    static pickEmoji = ":white_check_mark:";
    static banEmoji = ":no_entry_sign:";

    static timeBeforeDeletingChannel = 5000;

    static announcementChannel = process.env.ANNOUNCEMENT_CHANNEL || "general";
    static api_secret = process.env.API_SECRET || "default-secret";

    static secretFields = [
	"discord_token",
	"discord_client_secret",
	"api_secret"
    ]
}

export function getPrintableConfig(): any {
    const cpy = { ...Config };

    for (const s of Config.secretFields) {
        cpy[s] = "******";
    }

    return cpy;
}
