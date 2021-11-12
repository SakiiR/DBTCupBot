import { model, Schema } from 'mongoose';
import uuid from '../utils/uuid';
import { IUser } from './user';
import { Match as BracketMatch } from "brackets-model"
import { DiaboticalMatch } from '../services/diabotical';

export interface IMatch {
    _id: string;
    bracketMatchData: any | BracketMatch;
    maps: any[] | DiaboticalMatch[];
    highSeedPlayer: IUser | string;
    lowSeedPlayer: IUser | string;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new Schema<IMatch>({
    _id: {
        type: String, default: uuid
    },
    bracketMatchData: {
        type: Object,
        default: {}
    },
    maps: [{
        type: Object,
        default: {}
    }],

    highSeedPlayer: {
        type: String,
        ref: 'User'
    },
    lowSeedPlayer: {
        type: String,
        ref: 'User'
    },
});

export default model<IMatch>('Match', new Schema(schema, { timestamps: true }));