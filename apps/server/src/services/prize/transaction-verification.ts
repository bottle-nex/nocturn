import {
    type TransactionInstruction,
    type VersionedTransactionResponse,
    PublicKey,
} from '@solana/web3.js';

export interface PrizeTransfer {
    from: PublicKey;
    to: PublicKey;
    mint: PublicKey;
    recipient: PublicKey;
    amount: bigint;
}

export function verifyPrizeTransaction(
    tx: VersionedTransactionResponse | null,
    expected: TransactionInstruction,
    transfer?: PrizeTransfer,
): boolean {
    if (!tx?.meta || tx.meta.err !== null) return false;
    const message = tx.transaction.message;
    const keys = message.getAccountKeys(
        tx.meta.loadedAddresses ? { accountKeysFromLookups: tx.meta.loadedAddresses } : undefined,
    );
    const matches = message.compiledInstructions.some((instruction) => {
        if (!keys.get(instruction.programIdIndex)?.equals(expected.programId)) return false;
        if (!Buffer.from(instruction.data).equals(expected.data)) return false;
        if (instruction.accountKeyIndexes.length !== expected.keys.length) return false;
        return expected.keys.every((account, index) => {
            const accountIndex = instruction.accountKeyIndexes[index];
            return (
                accountIndex !== undefined &&
                keys.get(accountIndex)?.equals(account.pubkey) &&
                (!account.isSigner || message.isAccountSigner(accountIndex))
            );
        });
    });
    if (!matches || !transfer) return matches;
    const delta = (address: PublicKey, recipient?: PublicKey) => {
        let index = -1;
        for (let i = 0; i < keys.length; i++) if (keys.get(i)?.equals(address)) index = i;
        if (index < 0) return null;
        const before = tx.meta?.preTokenBalances?.find((balance) => balance.accountIndex === index);
        const after = tx.meta?.postTokenBalances?.find((balance) => balance.accountIndex === index);
        if (!after || after.mint !== transfer.mint.toBase58() || after.uiTokenAmount.decimals !== 6)
            return null;
        if (before && (before.mint !== after.mint || before.uiTokenAmount.decimals !== 6))
            return null;
        if (recipient && after.owner !== recipient.toBase58()) return null;
        return BigInt(after.uiTokenAmount.amount) - BigInt(before?.uiTokenAmount.amount ?? '0');
    };
    return (
        delta(transfer.from) === -transfer.amount &&
        delta(transfer.to, transfer.recipient) === transfer.amount
    );
}
