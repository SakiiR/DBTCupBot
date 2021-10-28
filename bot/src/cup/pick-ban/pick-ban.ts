export enum Player {
    PlayerOne,
    PlayerTwo,
}

export enum PickBan {
    Pick,
    Ban,
}

export interface IWhoPickBan {
    player: Player;
    pickBan: PickBan;
}

export default abstract class PickBanSystem {
    choosen: string[];

    constructor(protected maps: string[], protected counter: number = 0) {
        this.choosen = [];
    }

    protected remove(map: string) {
        if (this.finished()) return;

        const index = this.maps.indexOf(map);
        if (index !== -1) {
            this.maps.splice(index, 1);
        }

        //!important the counter is incremented here
        this.counter++;
    }


    public remainingMaps(): string[] {
        return this.maps;
    }

    public pick(map: string): void {
        this.remove(map);
        this.choosen.push(map);
    }

    public ban(map: string): void {
        this.remove(map);
        if (this.maps.length === 1)
            this.choosen.push(this.maps[0]);
    }

    /**
     * Depending on this.counter, this function has to return who has to pick or ban a map.
     */
    public abstract whoPickBan(): IWhoPickBan;


    /**
     * Should return true if the system is finished
     */
    public abstract finished(): boolean;

    /**
     * Should return the final choosen map(s)
     */
    public get(): string[] | null {
        if (this.finished()) {
            if (this.choosen.length === 1) return [this.choosen[0]];
            return this.choosen;
        }
        return null;
    }
}
