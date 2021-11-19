

import {
    Seeding
} from 'brackets-model';
import { IUser } from '../models/user';
import ensurePowerOfTwo from '../utils/ensure-power-of-two';
import encorePowerOfTwo from "../utils/ensure-power-of-two";

// Code copied from the eggwp project ( thanks laznic ^_^)
export default async function automaticSeeds(players: IUser[]): Promise<Seeding> {
    const sortedPlayers = players.sort((a, b) => {
        const { position: aRankPosition, tier: aRankTier } = a.rating;
        const { position: bRankPosition, tier: bRankTier } = a.rating;

        if (aRankPosition && bRankPosition) {
            const delta = Math.abs(aRankTier - bRankTier);
            if (delta <= 5) return aRankPosition - bRankPosition;
        }

        return bRankTier - aRankTier;
    });
    const shouldFlipThirdAndFourthSeed = Math.random() < 0.6
    const shouldFlipFifthAndSixthSeed = Math.random() < 0.6
    const shouldFlipSeventhAndEighthSeed = Math.random() < 0.6
    const shouldFlipThirdAndSixthSeed = Math.random() < 0.2
    const shouldFlipFourthAndFifthSeed = Math.random() < 0.2

    if (shouldFlipThirdAndFourthSeed) {
        [sortedPlayers[2], sortedPlayers[3]] = [sortedPlayers[3], sortedPlayers[2]]
    }

    if (shouldFlipFifthAndSixthSeed && sortedPlayers.length >= 8) {
        [sortedPlayers[4], sortedPlayers[5]] = [sortedPlayers[5], sortedPlayers[4]]
    }

    if (shouldFlipSeventhAndEighthSeed && sortedPlayers.length >= 16) {
        [sortedPlayers[6], sortedPlayers[7]] = [sortedPlayers[7], sortedPlayers[6]]
    }

    if (shouldFlipThirdAndSixthSeed && !shouldFlipThirdAndFourthSeed && sortedPlayers.length >= 8) {
        [sortedPlayers[2], sortedPlayers[5]] = [sortedPlayers[5], sortedPlayers[2]]
    }

    if (shouldFlipFourthAndFifthSeed && !shouldFlipFifthAndSixthSeed && sortedPlayers.length >= 8) {
        [sortedPlayers[3], sortedPlayers[4]] = [sortedPlayers[4], sortedPlayers[3]]
    }

    let seeds = [...sortedPlayers];

    seeds = ensurePowerOfTwo(seeds);

    const numRounds = Math.log(seeds.length) / Math.log(2);
    const seedRounds = [];
    for (let i = 0; i < numRounds; ++i) {
        seedRounds[i] = [];
    }

    seedRounds[numRounds] = [1, 2];

    for (let i = numRounds; i > 0; --i) {
        const round = seedRounds[i];
        const feedRound = seedRounds[i - 1];
        for (let j = 0; j < round.length; ++j) {
            const num_teams_in_round = round.length * 2;
            feedRound[j * 2] = round[j];
            feedRound[(j * 2) + 1] = num_teams_in_round + 1 - round[j];
        }
    }

    const [, firstSeedRound] = seedRounds;

    const properSeeds = firstSeedRound.map((seed) => seeds[seed - 1]);
    const firstHalf = properSeeds.slice(0, Math.ceil(properSeeds.length / 2));
    const secondHalf = properSeeds.slice(Math.ceil(properSeeds.length / 2)).reverse();

    const finalSeeds = [].concat(firstHalf).concat(secondHalf);

    return finalSeeds.map(u => u ? u.epicName : null);
}