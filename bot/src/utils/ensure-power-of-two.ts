export default function ensurePowerOfTwo<T>(array: T[]): T[] {
    let final = [...array];

    const powerOfTwo = (num) => Math.log2(num) % 1 === 0;
    while (!powerOfTwo(final.length)) {
        final.push(null);
    }

    return final
}