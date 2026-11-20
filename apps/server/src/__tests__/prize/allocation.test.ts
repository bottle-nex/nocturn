import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    allocatePrizes,
    getNetPrizePoolBaseUnits,
    isValidPrizePercentages,
    PRIZE_FEE_PERCENT,
} from '@nocturn/types';

const entries = (percentages: number[]) =>
    percentages.map((percentage, i) => ({ rank: i + 1, percentage }));
const sum = (values: bigint[]) => values.reduce((total, value) => total + value, BigInt(0));

describe('prize allocation', () => {
    it('funds all three winners in any claim order after the platform fee', () => {
        const prizes = allocatePrizes(100, entries([50, 30, 20]));
        expect(prizes.map((p) => p.amountBaseUnits)).toEqual([
            BigInt(49_500_000),
            BigInt(29_700_000),
            BigInt(19_800_000),
        ]);
        expect(prizes.map((p) => p.amount)).toEqual([49.5, 29.7, 19.8]);
        for (const order of [
            [0, 1, 2],
            [2, 1, 0],
            [1, 2, 0],
        ]) {
            let balance = getNetPrizePoolBaseUnits(100);
            for (const index of order) {
                const prize = prizes[index];
                expect(prize).toBeDefined();
                if (!prize) throw new Error('Missing prize');
                expect(balance).toBeGreaterThanOrEqual(prize.amountBaseUnits);
                balance -= prize.amountBaseUnits;
            }
            expect(balance).toBe(BigInt(0));
        }
    });

    it('allocates the full confirmed escrow balance without deducting another fee', () => {
        const prizes = allocatePrizes(99, entries([50, 30, 20]), 'escrow');
        expect(prizes.map((p) => p.amount)).toEqual([49.5, 29.7, 19.8]);
        expect(sum(prizes.map((p) => p.amountBaseUnits))).toBe(BigInt(99_000_000));
    });

    it('matches the contract fee constant and division order', () => {
        const data = readFileSync(
            resolve(__dirname, '../../../../contract/programs/contract/src/data/nocturn_data.rs'),
            'utf8',
        );
        const creation = readFileSync(
            resolve(__dirname, '../../../../contract/programs/contract/src/func/create_quiz.rs'),
            'utf8',
        );
        expect(data).toContain(`pub const FEES: u64 = ${PRIZE_FEE_PERCENT};`);
        expect(creation).toContain('amount / 100 * NocturnData::FEES');
        expect(getNetPrizePoolBaseUnits(1.000199)).toBe(BigInt(990198));
        expect(getNetPrizePoolBaseUnits(0.000099)).toBe(BigInt(99));
        expect(getNetPrizePoolBaseUnits(0.0001)).toBe(BigInt(99));
    });

    it('uses exact decimal weights and leaves rounding dust in escrow', () => {
        expect(
            allocatePrizes(100, entries([33.33, 33.33, 33.34])).map((p) => p.amountBaseUnits),
        ).toEqual([BigInt(32_996_700), BigInt(32_996_700), BigInt(33_006_600)]);
        expect(allocatePrizes(0.000001, entries([50, 50])).map((p) => p.amountBaseUnits)).toEqual([
            BigInt(0),
            BigInt(0),
        ]);
    });

    it('normalizes totals accepted by the existing percentage tolerance', () => {
        for (const weights of [
            [50, 30, 20.009],
            [50, 30, 19.991],
            [0, 100],
            [1e-7, 99.9999999],
        ]) {
            for (const pool of [0, 0.000001, 1.000199, 100, 9999.999999]) {
                const prizes = allocatePrizes(pool, entries(weights));
                expect(sum(prizes.map((p) => p.amountBaseUnits))).toBeLessThanOrEqual(
                    getNetPrizePoolBaseUnits(pool),
                );
                for (const prize of prizes)
                    expect(prize.amount).toBe(Number(prize.amountBaseUnits) / 1e6);
            }
        }
        expect(allocatePrizes(100, entries([0, 100]))[0]?.amountBaseUnits).toBe(BigInt(0));
    });

    it.each(
        [[NaN, 100], [Infinity, 0], [-1, 101], [101, -1], [50, 40], []].map((value) => [value]),
    )('rejects invalid percentages %j', (percentages) => {
        expect(isValidPrizePercentages(percentages)).toBe(false);
        if (percentages.length)
            expect(() => allocatePrizes(100, entries(percentages))).toThrow('Prize percentages');
    });

    it('handles absent distributions and rejects invalid pools explicitly', () => {
        expect(allocatePrizes(0, [])).toEqual([]);
        for (const pool of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
            expect(() => allocatePrizes(pool, entries([100]))).toThrow('Prize pool');
        }
    });
});
