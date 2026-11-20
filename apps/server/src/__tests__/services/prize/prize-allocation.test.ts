import { describe, it, expect } from 'vitest';
import { allocatePrizes, validateDistributions } from '../../../services/prize/prize-allocation';

const distributions = [
    { rank: 1, percentage: 50 },
    { rank: 2, percentage: 30 },
    { rank: 3, percentage: 20 },
];
const participants = [
    { id: 'first', totalScore: 30 },
    { id: 'second', totalScore: 20 },
    { id: 'third', totalScore: 10 },
];

describe('prize allocation', () => {
    it('splits verified net funding rather than stale gross distribution amounts', () => {
        const result = allocatePrizes(BigInt(99000000), distributions, participants);
        expect(result.claims.map((claim) => claim.amountBaseUnits)).toEqual([
            BigInt(49500000),
            BigInt(29700000),
            BigInt(19800000),
        ]);
        expect(result.surplusBaseUnits).toBe(BigInt(0));
    });

    it('leaves unfilled places available to the host', () => {
        const result = allocatePrizes(BigInt(100000000), distributions, participants.slice(0, 2));
        expect(result.surplusBaseUnits).toBe(BigInt(20000000));
    });

    it('pools consumed tie positions and preserves competition ranks', () => {
        const result = allocatePrizes(BigInt(100), distributions, [
            { id: 'a', totalScore: 20 },
            { id: 'b', totalScore: 20 },
            { id: 'c', totalScore: 10 },
        ]);
        expect(result.claims.map((claim) => [claim.rank, claim.amountBaseUnits])).toEqual([
            [1, BigInt(40)],
            [1, BigInt(40)],
            [3, BigInt(20)],
        ]);
    });

    it('keeps division dust in surplus and never creates zero-value claims', () => {
        const result = allocatePrizes(BigInt(3), distributions, participants);
        expect(result.claims.map((claim) => claim.amountBaseUnits)).toEqual([BigInt(1)]);
        expect(result.surplusBaseUnits).toBe(BigInt(2));
    });

    it('handles a tie that extends beyond the prize positions', () => {
        const result = allocatePrizes(
            BigInt(101),
            [{ rank: 1, percentage: 100 }],
            [
                { id: 'a', totalScore: 1 },
                { id: 'b', totalScore: 1 },
                { id: 'c', totalScore: 1 },
            ],
        );
        expect(result.claims.map((claim) => claim.amountBaseUnits)).toEqual([
            BigInt(33),
            BigInt(33),
            BigInt(33),
        ]);
        expect(result.surplusBaseUnits).toBe(BigInt(2));
    });

    it('preserves exact units above the safe integer range', () => {
        const pool = BigInt('9007199254740993');
        const result = allocatePrizes(
            pool,
            [{ rank: 1, percentage: 100 }],
            participants.slice(0, 1),
        );
        expect(result.claims[0]?.amountBaseUnits).toBe(pool);
    });

    it('handles zero winners without losing the funded pool', () => {
        expect(allocatePrizes(BigInt(99), distributions, []).surplusBaseUnits).toBe(BigInt(99));
    });

    it.each([NaN, Infinity, -1, 0, 100.1, 33.333])(
        'rejects invalid percentage %s',
        (percentage) => {
            expect(() => validateDistributions([{ rank: 1, percentage }])).toThrow();
        },
    );

    it('rejects approximate totals, duplicate ranks and duplicate participants', () => {
        expect(() => validateDistributions([{ rank: 1, percentage: 99.99 }])).toThrow();
        expect(() =>
            validateDistributions([
                { rank: 1, percentage: 50 },
                { rank: 1, percentage: 50 },
            ]),
        ).toThrow();
        expect(() =>
            allocatePrizes(BigInt(100), distributions, [participants[0]!, participants[0]!]),
        ).toThrow();
    });

    it('rejects unsorted or nonfinite scores', () => {
        expect(() =>
            allocatePrizes(BigInt(100), distributions, [...participants].reverse()),
        ).toThrow();
        expect(() =>
            allocatePrizes(BigInt(100), distributions, [{ id: 'a', totalScore: NaN }]),
        ).toThrow();
    });
});
