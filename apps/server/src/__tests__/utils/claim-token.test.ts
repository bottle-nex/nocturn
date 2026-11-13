import { describe, expect, it } from 'vitest';
import { createClaimToken, hashClaimToken } from '../../utils/claim-token';

describe('prize claim credentials', () => {
    it('recreates the same secret for email retries without storing it', () => {
        const token = createClaimToken('claim-one', 'platform-secret');
        expect(token).toMatch(/^[a-f0-9]{64}$/);
        expect(createClaimToken('claim-one', 'platform-secret')).toBe(token);
        expect(createClaimToken('claim-two', 'platform-secret')).not.toBe(token);
        expect(createClaimToken('claim-one', 'another-secret')).not.toBe(token);
        expect(hashClaimToken(token)).not.toBe(token);
    });

    it('uses SHA-256 of the UTF-8 token, matching on-chain verification', () => {
        expect(hashClaimToken('abc')).toBe(
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        );
    });
});
