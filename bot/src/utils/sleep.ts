import util from "util";

export default async function sleep(utime: number): Promise<void> {
    return await util.promisify(setTimeout)(utime);

}