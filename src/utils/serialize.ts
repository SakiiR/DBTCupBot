export default class Serializer {
    public static serialize<T>(obj: T): string {
        return Buffer.from(JSON.stringify(obj)).toString("base64");
    }

    public static deserialize<T>(str: string): T | null {
        try {
            return JSON.parse(Buffer.from(str, "base64").toString()) as T;
        } catch (e) {
            return null;
        }
    }
}