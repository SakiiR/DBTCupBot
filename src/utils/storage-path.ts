import path from "path";
import Config from "../config";
import { ICup } from "../models/cup";

export default function getStoragePath(cup: ICup): string {
    return path.join(Config.cup_storage, `cup-${cup._id.toString()}.json`);
}