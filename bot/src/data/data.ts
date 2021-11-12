import signale from "signale";
import Config from "../config";
import Cup from "../models/cup";
import User from "../models/user";

export default class DatabaseFixtures {

    static async createUserAndGetId(user) {
        const { discordTag } = user;

        const found = await User.findOne({ discordTag });
        if (found) return found._id;

        const { _id } = await user.save();

        return _id;
    }


    static async fill() {
        const users = [
            new User({
                "discordId": "208187617055997952",
                "discordTag": "Chamo#1049",
                "admin": true,
                "rating": 22,
                "epicId": "1cf88f28703c4e5582cc2d92aaf92d17",
                "epicName": "Ξ Chamo"
            }),
            new User({
                "discordId": "119758326706733056",
                "discordTag": "SakiiR#3822",
                "admin": true,
                "rating": 37,
                "epicId": "20ee8612d4c2461195fdf891fd4a3f10",
                "epicName": "SakiiR au Beurre"
            }),
            new User({
                "discordId": "119786129011638274",
                "discordTag": "Nykho#1337",
                "admin": false,
                "rating": 11,
                "epicId": "4778a0c993a7416e8635526397aaf85e",
                "epicName": "Nykho"
            }),
            new User({
                "discordId": "324218231298588684",
                "discordTag": "Code187#3370",
                "admin": false,
                "rating": 0,
                "epicId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                "epicName": "C0DE-187"
            }),
            new User({
                "discordId": "179670335757484042",
                "discordTag": "guzz#0687",
                "admin": false,
                "rating": 0,
                "epicId": "16b9f794b2b6433fad7a4f99a663f4c5",
                "epicName": "ESAツguzz"
            }),
            new User({
                "discordTag": "goulox#6374",
                "discordId": "107223123337728000",
                "admin": false,
                "rating": 99,
                "epicId": "eb78fb7ada1e4f14affb738aa5a56397",
                "epicName": "goulox"
            }),
            new User({
                "discordTag": "FragStealer#6234",
                "discordId": "98729729460293632",
                "admin": false,
                "rating": 49,
                "epicId": "6a230c9d0165496da81d6883347c9511",
                "epicName": "FragStealzor"
            })
        ];



        const userIds = [];
        for (const user of users) {
            userIds.push(await this.createUserAndGetId(user));
        }

        const data = {
            challengers: userIds,
            title: "Dev Test Cup",
            over: false,
            started: false,
            type: Config.default_type,
            boStrategy: Config.default_bo_strategy,
            maps: [...Config.default_map_pool]
        };

        signale.debug({ data })

        const cup = new Cup(data)



        const { title } = cup;
        if (!!(await Cup.findOne({ title }))) {
            await Cup.deleteOne({ title });
        }

        await cup.save();

    }
}