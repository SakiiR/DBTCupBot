import { model, Schema } from 'mongoose';
import uuid from '../utils/uuid';
import { IMatch } from './match';
import { IUser } from './user';

export enum CupBoStrategy {
    OnlyBo1 = '1',
    MixedBo1Bo3 = '2',
    OnlyBo3 = '3',
    // ...
}

export interface ICup {
    _id: string;
    type: string;
    title: string;
    challengers: IUser[] | string[];
    matches: IMatch[] | string[];
    maps: string[];
    over: boolean;
    started: boolean;
    automaticSeeding: boolean;
    boStrategy: CupBoStrategy | string;
    data: any;
    createdAt?: Date;
    updatedAt?: Date;
}


const schema = new Schema<ICup>({
    _id: {
        type: String, default: uuid
    },
    type: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    challengers: [{ type: String, ref: 'User' }],
    matches: [{ type: String, ref: 'Match', default: [] }],
    maps: [{ type: String }],
    over: { type: Boolean, default: false },
    started: { type: Boolean, default: false },
    automaticSeeding: { type: Boolean, default: false },
    data: { type: Object, default: {} },
    boStrategy: {
        type: String,
        default: CupBoStrategy.MixedBo1Bo3,
        enum: Object.values(CupBoStrategy)
    }
});

export default model<ICup>('Cup', new Schema(schema, { timestamps: true }));