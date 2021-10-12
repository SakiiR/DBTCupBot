import BO3 from "./bo3";
import { PickBan, Player } from "./pick-ban";

const maps = ['raya', 'bioplant', 'pavillon x', 'restless', 'skybreak', 'sanctum', 'amberfall'];

function randomChoice(choices: string[]): string {
    return choices[Math.floor(Math.random() * choices.length)];
}

async function main() {
    const bo = new BO3(maps);

    while (!bo.finished()) {
        const step = bo.whoPickBan();

        const pickBanStr = step.pickBan === PickBan.Ban ? 'ban' : 'pick';
        const who = step.player === Player.PlayerOne ? 'SakiiR' : "Chamo"

        console.log(`${who} has to ${pickBanStr} a map from ${bo.remainingMaps().join(', ')}`);

        const mapToPickBan = randomChoice(bo.remainingMaps());


        if (step.pickBan === PickBan.Ban)
            bo.ban(mapToPickBan);

        if (step.pickBan === PickBan.Pick)
            bo.pick(mapToPickBan);

        console.log(`${who} ${pickBanStr}s ${mapToPickBan}`);
    }

    console.log(`Maps are: ${bo.get()}`);
}

main();