import { model, Schema } from 'mongoose';
import uuid from '../utils/uuid';

export interface IUser {
    _id: string;
    epicId: string;
    epicName: string;
    discordTag: string;
    discordId: string;
    admin: boolean;
    rating: number;
}


const schema = new Schema<IUser>({
    _id: {
        type: String, default: uuid
    },
    epicId: { type: String, required: false, unique: false },
    epicName: { type: String, required: false, unique: false },
    discordTag: { type: String, required: false, unique: true },
    discordId: { type: String, required: false, unique: true },
    admin: { type: Boolean, required: true, unique: false },
    rating: { type: Number, required: true, unique: false },
});

export default model<IUser>('User', new Schema(schema));