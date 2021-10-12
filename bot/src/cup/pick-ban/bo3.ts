import PickBanSystem, { IWhoPickBan, PickBan, Player } from "./pick-ban";

export default class BO3 extends PickBanSystem {

    constructor(maps: string[]) {
        super(maps, 0);
    }

    public whoPickBan(): IWhoPickBan {

        if (this.counter === 0)
            return { player: Player.PlayerOne, pickBan: PickBan.Ban };

        if (this.counter === 1)
            return { player: Player.PlayerTwo, pickBan: PickBan.Ban };

        if (this.counter === 2)
            return { player: Player.PlayerTwo, pickBan: PickBan.Pick };

        if (this.counter === 3)
            return { player: Player.PlayerOne, pickBan: PickBan.Ban };

        if (this.counter === 4)
            return { player: Player.PlayerOne, pickBan: PickBan.Pick };

        return { player: this.counter % 2 == 0 ? Player.PlayerOne : Player.PlayerTwo, pickBan: PickBan.Ban }
    }


    public finished(): boolean {
        return this.choosen.length === 3;
    }
}