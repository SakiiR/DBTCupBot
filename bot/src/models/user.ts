import { model, Schema } from 'mongoose';
import { Rating } from '../services/diabotical';
import uuid from '../utils/uuid';

export interface IUser {
    _id: string;
    epicId: string;
    epicName: string;
    discordTag: string;
    discordId: string;
    admin: boolean;
    rating: Rating;
    createdAt?: Date;
    updatedAt?: Date;
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
    rating: {
        position: { type: Number },
        tier: { type: Number },
    },
});

export default model<IUser>('User', new Schema(schema, { timestamps: true }));