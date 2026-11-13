import { createHash, createHmac } from 'crypto';

// A stable, domain-separated credential lets finalization retries recreate the email
// link without storing its secret in the database or the finalization job.
export function createClaimToken(claimId: string, secret: string): string {
    return createHmac('sha256', secret).update(`prize-claim:${claimId}`).digest('hex');
}

export function hashClaimToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}
