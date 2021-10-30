
import {
    Match,
    Round
} from 'brackets-model';
import signale from 'signale';
import { CupBoStrategy } from '../models/cup';

export default class BoStrategy {
    static apply(strategy: CupBoStrategy, match: Match, rounds: Round[]): Match {
        signale.debug({ strategy, a: CupBoStrategy.MixedBo1Bo3 });
        const finalRoundId = rounds.length - 1;

        // By default, apply at least BO1
        match.child_count = 1;

        // Mixed Bo1 and Bo3 applies the default settings:
        // Winner bracket matches are BO3 un
        if (strategy === CupBoStrategy.MixedBo1Bo3) {
            match.child_count = 3;
            if (match.group_id === 1) {
                if (match.round_id !== finalRoundId) match.child_count = 1;
            }
            return match;
        }

        // Only BO1 matches
        if (strategy === CupBoStrategy.OnlyBo1) {
            match.child_count = 1;
            return match
        }

        // Only BO3 matches
        if (strategy === CupBoStrategy.OnlyBo3) {
            match.child_count = 3;
            return match
        }


        return match;
    }
}