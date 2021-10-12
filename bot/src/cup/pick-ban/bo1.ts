import PickBanSystem, { IWhoPickBan, PickBan, Player } from "./pick-ban";

export default class BO1 extends PickBanSystem {

    constructor(maps: string[]) {
        super(maps, 0);
    }

    public whoPickBan(): IWhoPickBan {
        return { player: this.counter % 2 == 0 ? Player.PlayerOne : Player.PlayerTwo, pickBan: PickBan.Ban }
    }

    public finished(): boolean {
        return this.remainingMaps().length === 1;
    }
}