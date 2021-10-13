/**
 * Returns whenever the match is ended depending on the number of match to be played and the score
 * 
 * @param leftScore 
 * @param rightScore 
 * @param bo best of 1, 3 or 5 etc 
 * @returns boolean
 */
export function isThatAWin(leftScore: number, rightScore: number, bo: number): boolean {
    const remainingMatchCount = bo - (leftScore + rightScore);
    const delta = Math.abs(leftScore - rightScore);


    if (remainingMatchCount <= 0) {
        return true;
    }

    return delta > remainingMatchCount;
}


// const BO1 = 1
// const BO3 = 3
// const BO5 = 5
// 
// async function main() {
//     console.log("1-1 bo3", isThatAWin(1, 1, BO3) === false);
//     console.log("2-1 bo3", isThatAWin(2, 1, BO3) === true);
//     console.log("2-0 bo3", isThatAWin(2, 0, BO3) === true);
// 
//     console.log("1-0 bo1", isThatAWin(1, 0, BO1) === true);
//     console.log("0-1 bo1", isThatAWin(0, 1, BO1) === true);
//     console.log("0-0 bo1", isThatAWin(0, 0, BO1) === false);
// 
//     console.log("2-1 bo5", isThatAWin(2, 1, BO5) === false);
//     console.log("2-2 bo5", isThatAWin(2, 2, BO5) === false);
//     console.log("3-1 bo5", isThatAWin(3, 1, BO5) === true);
//     console.log("4-1 bo5", isThatAWin(4, 1, BO5) === true);
// }
// 
// main();
