/**
 * Mint test USDC tokens to any wallet on devnet.
 *
 * Usage:
 *   npx ts-node scripts/mint-test-tokens.ts <WALLET_ADDRESS> [AMOUNT]
 *
 * Examples:
 *   npx ts-node scripts/mint-test-tokens.ts 7xKXt... 500     # mint 500 tokens
 *   npx ts-node scripts/mint-test-tokens.ts 7xKXt...          # mint 100 tokens (default)
 *
 * Prerequisites:
 *   - Solana CLI configured to devnet
 *   - Local keypair at ~/.config/solana/id.json (must be the mint authority)
 */

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// Test token mint address (6 decimals, mimics USDC)
// Change this if you create a new test token
const TEST_TOKEN_MINT = new PublicKey(
  "FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja",
);
const DECIMALS = 6;

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      "Usage: npx ts-node scripts/mint-test-tokens.ts <WALLET_ADDRESS> [AMOUNT]",
    );
    console.error("  WALLET_ADDRESS  Solana public key to receive tokens");
    console.error("  AMOUNT          Number of tokens (default: 100)");
    process.exit(1);
  }

  const recipientAddress = args[0]!;
  const amount = parseFloat(args[1] ?? "100");

  let recipientPubkey: PublicKey;
  try {
    recipientPubkey = new PublicKey(recipientAddress);
  } catch {
    console.error(`Invalid wallet address: ${recipientAddress}`);
    process.exit(1);
  }

  // Load the local keypair (mint authority)
  const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  if (!fs.existsSync(keypairPath)) {
    console.error(`Keypair not found at ${keypairPath}`);
    console.error("Run: solana-keygen new");
    process.exit(1);
  }
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const baseUnits = BigInt(Math.round(amount * 10 ** DECIMALS));

  console.log(`Mint:      ${TEST_TOKEN_MINT.toBase58()}`);
  console.log(`Recipient: ${recipientPubkey.toBase58()}`);
  console.log(`Amount:    ${amount} tokens (${baseUnits} base units)`);
  console.log();

  // Get or create the recipient's Associated Token Account
  console.log("Finding or creating token account for recipient...");
  const recipientAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    TEST_TOKEN_MINT,
    recipientPubkey,
  );
  console.log(`Token account: ${recipientAta.address.toBase58()}`);

  // Mint tokens
  console.log(`Minting ${amount} tokens...`);
  const txSig = await mintTo(
    connection,
    payer,
    TEST_TOKEN_MINT,
    recipientAta.address,
    payer, // mint authority
    baseUnits,
  );

  console.log();
  console.log("Done!");
  console.log(`Transaction: ${txSig}`);
  console.log(
    `Explorer:    https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
  );
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
