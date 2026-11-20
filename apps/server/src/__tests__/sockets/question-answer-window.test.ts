import { describe, expect, it } from 'vitest';
import { isQuestionAnswerable } from '../../../../web/src/lib/question-answer-window';

describe('participant option availability', () => {
    it('blocks the active-phase buffer without consuming the answer, and enables at the start', () => {
        expect(isQuestionAnswerable(7000, 11000, 5000)).toBe(false);
        expect(isQuestionAnswerable(7000, 11000, 6999)).toBe(false);
        expect(isQuestionAnswerable(7000, 11000, 7000)).toBe(true);
        expect(isQuestionAnswerable(7000, 11000, 10999)).toBe(true);
        expect(isQuestionAnswerable(7000, 11000, 11000)).toBe(false);
    });
    it('blocks options without a valid advertised interval', () => {
        expect(isQuestionAnswerable(undefined, undefined, 7000)).toBe(false);
        expect(isQuestionAnswerable(NaN, 11000, 7000)).toBe(false);
    });
});
