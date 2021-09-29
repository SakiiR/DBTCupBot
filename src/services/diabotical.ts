import axios from 'axios'
import signale from 'signale';

const BASE = `https://api.diabotical.com/api/v0/diabotical`;

export interface Customizations {
    sh_l: string;
    sh_r: string;
    color: string;
    mu_pu: string;
    shell: string;
    spray: string;
    we_bl: string;
    we_cb: string;
    we_gl: string;
    we_rl: string;
    we_ss: string;
    we_vc: string;
    avatar: string;
    shield: string;
    we_mac: string;
    country: string;
    sticker: string;
    we_pncr: string;
    we_melee: string;
    we_shaft: string;
}

export interface DiaboticalUser {
    user_id?: string;
    client_user_id?: any;
    name: string;
    avatar: string;
    country: string;
    customizations: Customizations;
    level: number;
    active_battlepass_id: string;
    battlepass_owned: boolean;
    battlepass_xp: number;
    battlepass_level: number;
    twitch_id?: any;
    twitch_name?: any;
}


export default class DiaboticalService {
    static async getUser(userId: string): Promise<DiaboticalUser | null> {
        const response = await axios.get(`${BASE}/users/${userId}`);

        const dbtUser = response.data as DiaboticalUser;
        if (!dbtUser.user_id) return null;
        return dbtUser;
    }

    static async getUserRating(userId: string, mode: string = "md_duel"): Promise<number> {
        const response = await axios.get(`${BASE}/users/${userId}/rating`);

        signale.debug(`Rating of ${userId}`);
        signale.debug({ ...response.data });

        const { ratings } = response.data;

        for (const rating of ratings) {
            if (rating.mode_key === mode) {
                return rating.rank_position;
            }
        }

        return 0;
    }
}