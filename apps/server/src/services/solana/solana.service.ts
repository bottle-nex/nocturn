import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { env } from '../../configs/env';

export default class SolanaService {
    public connection: Connection;
    public platformKeypair: Keypair;
    public platformPublicKey: PublicKey;

    constructor() {
        this.connection = new Connection(env.SERVER_SOLANA_RPC_URL, 'confirmed');
        const secretKey = bs58.decode(env.SERVER_PLATFORM_AUTHORITY_KEYPAIR);
        this.platformKeypair = Keypair.fromSecretKey(secretKey);
        this.platformPublicKey = this.platformKeypair.publicKey;
    }

    public async verify_transaction(txSignature: string): Promise<boolean> {
        try {
            const tx = await this.connection.getTransaction(txSignature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0,
            });
            return tx !== null && tx.meta !== null && tx.meta.err === null;
        } catch (error) {
            console.error('Failed to verify transaction:', error);
            return false;
        }
    }

    public async get_balance(pubkey: PublicKey): Promise<number> {
        return this.connection.getBalance(pubkey);
    }
}
