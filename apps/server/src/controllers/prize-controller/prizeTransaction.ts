import { Prisma } from '@nocturn/database';
import { Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export async function consume_prize_transaction(
    tx: Prisma.TransactionClient,
    signature: string,
    step: 'STAKE' | 'AUTHORIZE' | 'CLAIM',
    referenceId: string,
) {
    await tx.prizeTransaction.create({ data: { signature, step, referenceId } });
}

export function prize_confirmation_error(res: Response, error: unknown): boolean {
    if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'P2002' || error.code === 'P2025')
    ) {
        ResponseWriter.error(
            res,
            'ALREADY_CONFIRMED',
            'Transaction or prize step has already been confirmed',
            undefined,
            409,
        );
        return true;
    }
    return false;
}
