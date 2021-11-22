import signale from 'signale';
import Config from '../config';
import Cup from '../models/cup';
import User from '../models/user';

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
                discordId: '119758326706733056',
                discordTag: 'SakiiR#3822',
                admin: true,
                rating: {
                    position: 27,
                    tier: 40,
                },
                epicId: '20ee8612d4c2461195fdf891fd4a3f10',
                epicName: 'SakiiR au Beurre',
            }),
            new User({
                discordId: '208187617055997952',
                discordTag: 'Chamo#1049',
                admin: true,
                rating: {
                    position: 13,
                    tier: 40,
                },
                epicId: '1cf88f28703c4e5582cc2d92aaf92d17',
                epicName: 'Ξ Chamo',
            }),
            new User({
                discordTag: 'n3ro#3604',
                discordId: '223874150085689344',
                admin: false,
                rating: {
                    position: 0,
                    tier: 38,
                },
                epicId: '131ee80a6a104a9fa48b7f078baad930',
                epicName: 'n3rouf au Beurre',
            }),
            new User({
                discordTag: 'Doctor#6295',
                discordId: '748900090537836648',
                admin: false,
                rating: {
                    position: 49,
                    tier: 40,
                },
                epicId: '00f858f96d884d1193f6e4d1fecc1899',
                epicName: 'PhD_Doctor',
            }),
            new User({
                discordTag: 'guzz#0687',
                discordId: '179670335757484042',
                admin: false,
                rating: {
                    position: 0,
                    tier: 27,
                },
                epicId: '16b9f794b2b6433fad7a4f99a663f4c5',
                epicName: 'ESAツguzz',
            }),
            new User({
                discordTag: 'Code187#3370',
                discordId: '324218231298588684',
                admin: false,
                rating: {
                    position: 0,
                    tier: 0,
                },
                epicId: '445023e34d854971b24c52a50b54bb47',
                epicName: 'C0DE-187',
            }),
            new User({
                discordTag: 'Nykho#1337',
                discordId: '119786129011638274',
                admin: true,
                rating: {
                    position: 22,
                    tier: 40,
                },
                epicId: '4778a0c993a7416e8635526397aaf85e',
                epicName: 'Nykho',
            }),
            new User({
                discordTag: 'KaShiS#8347',
                discordId: '167018428278767617',
                admin: false,
                rating: {
                    position: 64,
                    tier: 40,
                },
                epicId: 'b35050cc7db948c88311e714c60d5f22',
                epicName: 'KaShiS HmT',
            }),
            new User({
                discordTag: 'headbang3r#0484',
                discordId: '228586007715512332',
                admin: false,
                rating: {
                    position: 46,
                    tier: 40,
                },
                epicId: '19e4a8c0c2a2471680aaa068a4e02b2f',
                epicName: 'PLG.headbang3r',
            }),
            new User({
                discordTag: 'SuperCarlouf#7568',
                discordId: '493399750603964418',
                admin: false,
                rating: {
                    position: 0,
                    tier: 39,
                },
                epicId: '3e31448f6bc94917931d8bdf27274d48',
                epicName: 'Carlouf_',
            }),
            new User({
                discordTag: 'KANZA#3391',
                discordId: '566728546941272114',
                admin: false,
                rating: {
                    position: 3,
                    tier: 40,
                },
                epicId: 'd1e39ac568904256a6939d5fd506d133',
                epicName: 'KANZA1337',
            }),
            new User({
                discordTag: 'Gppp#4144',
                discordId: '203075115234099200',
                admin: false,
                rating: {
                    position: 33,
                    tier: 40,
                },
                epicId: '5a10d246150c4d59ac396e4969fe4def',
                epicName: 'Gppp_',
            }),
            new User({
                discordTag: 'goulox#6374',
                discordId: '107223123337728000',
                admin: false,
                rating: {
                    position: 0,
                    tier: 36,
                },
                epicId: 'eb78fb7ada1e4f14affb738aa5a56397',
                epicName: 'goulox',
            }),
            new User({
                discordTag: 'LySt#1436',
                discordId: '438408546460237836',
                admin: false,
                rating: {
                    position: 9,
                    tier: 40,
                },
                epicId: '2fcafe0cec1d4c38b847b156faf186a3',
                epicName: 'LySt.WA',
            }),
            new User({
                discordTag: 'cobrask#2747',
                discordId: '233615955631144962',
                admin: false,
                rating: {
                    position: 0,
                    tier: 0,
                },
                epicId: '514d4f69f9ff47f58e356bff1422d985',
                epicName: 'Coby TM',
            }),
            new User({
                discordTag: 'Signys#9158',
                discordId: '217228472756600832',
                admin: false,
                rating: {
                    position: 0,
                    tier: 23,
                },
                epicId: '3a85bec995f04be0a3c4d2ccda228c12',
                epicName: 'Sìgnys',
            }),
            new User({
                discordTag: 'Edouard#5328',
                discordId: '199248075733204993',
                admin: false,
                rating: {
                    position: 0,
                    tier: 21,
                },
                epicId: '368c19490bd64c3e8cbd7bdaab9a6a18',
                epicName: 'Edouard_live',
            }),
            new User({
                discordTag: 'FragStealer#6234',
                discordId: '98729729460293632',
                admin: false,
                epicId: '6a230c9d0165496da81d6883347c9511',
                epicName: 'FragStealzor',
                rating: {
                    position: 38,
                    tier: 40,
                },
            }),
        ];

        const userIds = [];
        for (const user of users) {
            userIds.push(await this.createUserAndGetId(user));
        }

        const cup = new Cup({
            challengers: userIds,
            title: 'Dev Test Cup',
            over: false,
            started: false,
            type: Config.default_type,
            boStrategy: Config.default_bo_strategy,
            automaticSeeding: true,
            maps: [...Config.default_map_pool],
        });

        const { title } = cup;
        if (!!(await Cup.findOne({ title }))) {
            await Cup.deleteOne({ title });
        }

        await cup.save();
    }
}
