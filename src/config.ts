export default class Config {
    // Discord
    static discord_token = process.env.DISCORD_TOKEN || 'default-discord-token';
    static discord_client_id = process.env.DISCORD_CLIENT_ID || 'default-discord-client-id';
    static discord_guild_id = process.env.DISCORD_GUILD_ID || 'default-discord-guild-id';
    static admin_tags = (process.env.ADMIN_TAGS || 'SakiiR#3822').split(',');

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
}