import { model, Schema } from 'mongoose';
import uuid from '../utils/uuid';
import { IUser } from './user';

export interface ICup {
    _id: string;
    type: string;
    title: string;
    challengers: IUser[] | string[];
    maps: string[];
    over: boolean;
    started: boolean;
    data: any;
}


const schema = new Schema<ICup>({
    _id: {
        type: String, default: uuid
    },
    type: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    challengers: [{ type: String, ref: 'User' }],
    maps: [{ type: String }],
    over: { type: Boolean, default: false },
    started: { type: Boolean, default: false },
    data: { type: Object, default: {} },
});

export default model<ICup>('Cup', new Schema(schema));