import { model, Schema } from 'mongoose';
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
    type: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    challengers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    maps: [{ type: String }],
    over: { type: Boolean, default: false },
    started: { type: Boolean, default: false },
    data: { type: Object, default: {} },
});

export default model<ICup>('Cup', new Schema(schema));