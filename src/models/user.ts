import { model, Schema } from 'mongoose';

export interface IUser {
    _id: string;
    epicId: string;
    epicName: string;
    discordTag: string;
    admin: boolean;
    rating: number;
}


const schema = new Schema<IUser>({
    epicId: { type: String, required: false, unique: false },
    epicName: { type: String, required: false, unique: false },
    discordTag: { type: String, required: false, unique: true },
    admin: { type: Boolean, required: true, unique: false },
    rating: { type: Number, required: true, unique: false },
});

export default model<IUser>('User', new Schema(schema));