import axios from 'axios';
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

export interface W {
    f: number;
    i: number;
    df: number;
    dh: number;
    di: number;
    ds: number;
    dt: number;
    sf: number;
    sh: number;
}

export interface It {
    c: number;
    i: string;
}

export interface Stats {
    a: number;
    d: number;
    f: number;
    p: number;
    s: number;
    w: W[];
    at: number;
    di: number;
    dt: number;
    it: It[];
    oh: number;
    th: number;
}

export interface TeamStats {
    r: any;
}
export interface DiaboticalMatch {
    match_id: string;
    user_team_idx: number;
    finished: boolean;
    stats: Stats;
    team_score: number;
    team_placement: number;
    team_stats: TeamStats;
    match_type: number;
    match_state: number;
    match_mode: string;
    match_mm_mode: string;
    match_map: string;
    match_map_name?: any;
    match_time: number;
    match_rounds: number;
    location: string;
    time_limit: number;
    score_limit: number;
    team_size: number;
    team_count: number;
    create_ts: Date;
    finish_ts: Date;
    modifier_instagib: number;
    modifier_physics: number;
    match_private: boolean;
}

export default class DiaboticalService {
    static async getUser(userId: string): Promise<DiaboticalUser | null> {
        const response = await axios.get(`${BASE}/users/${userId}`);

        const dbtUser = response.data as DiaboticalUser;
        if (!dbtUser.user_id) return null;
        return dbtUser;
    }

    static async getUserRating(
        userId: string,
        mode: string = 'md_duel'
    ): Promise<number> {
        const response = await axios.get(`${BASE}/users/${userId}/rating`);
        const { ratings } = response.data;

        for (const rating of ratings) {
            if (rating.mode_key === mode) {
                return rating.rank_position;
            }
        }

        return 0;
    }

    static async getLastMatches(
        userId: string,
        count: number = 1
    ): Promise<DiaboticalMatch[]> {
        const response = await axios.get(
            `${BASE}/users/${userId}/matches?limit=${count}`
        );

        const {
            data: { matches },
        } = response;

        return matches;
    }
}
