import { model, Schema } from 'mongoose';
import uuid from '../utils/uuid';
import { IUser } from './user';

export interface ITeam {
    _id: string;
    name: string;
    owner: IUser | string;
    players: IUser[] | string[];
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const schema = new Schema<ITeam>({
    _id: {
        type: String, default: uuid
    },
    name: { type: String, required: true },
    players: [{ type: String, ref: 'User' }],
    owner: { type: String, ref: 'User' },
    password: { type: String, required: true }
});

export default model<ITeam>('Team', new Schema(schema, { timestamps: true }));