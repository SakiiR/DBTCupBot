import { Mutex } from "async-mutex";

export default class MutexSingleton {
    private static instance: MutexSingleton;
    private mutex: Mutex;

    private constructor() {
        this.mutex = new Mutex();
    }

    public static getInstance(): MutexSingleton {
        if (!MutexSingleton.instance) {
            MutexSingleton.instance = new MutexSingleton();
        }

        return MutexSingleton.instance;
    }

    public getMutex(): Mutex {
        return this.mutex;
    }
}