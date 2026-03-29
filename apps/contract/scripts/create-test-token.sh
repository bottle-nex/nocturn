#!/bin/bash
# Create a custom SPL token on devnet that mimics USDC (6 decimals).
# Run this once, then update the mint address in:
#   - programs/contract/src/data/nocturn_data.rs
#   - apps/web/src/lib/solana/program.ts
#   - scripts/mint-test-tokens.ts
#
# Prerequisites:
#   - solana CLI configured to devnet (solana config set --url devnet)
#   - Wallet funded with devnet SOL (solana airdrop 2)

set -e

echo "=== Creating Test USDC Token (6 decimals) on Devnet ==="
echo

solana config set --url https://api.devnet.solana.com

echo "Creating token..."
TOKEN_MINT=$(spl-token create-token --decimals 6 2>&1 | grep "Address:" | awk '{print $2}')
echo "Mint address: $TOKEN_MINT"

echo "Creating your token account..."
spl-token create-account "$TOKEN_MINT"

echo "Minting 1,000,000 tokens to your wallet..."
spl-token mint "$TOKEN_MINT" 1000000

echo
echo "Creating token account for Nocturn fee wallet..."
spl-token create-account "$TOKEN_MINT" \
  --owner DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR \
  --fee-payer ~/.config/solana/id.json

echo
echo "========================================="
echo "  Test Token Created!"
echo "  Mint: $TOKEN_MINT"
echo "========================================="
echo
echo "Next steps:"
echo "  1. Update USDC_MINT in programs/contract/src/data/nocturn_data.rs"
echo "  2. Update USDC_MINT in apps/web/src/lib/solana/program.ts"
echo "  3. Update TEST_TOKEN_MINT in scripts/mint-test-tokens.ts"
echo "  4. Run: anchor build && anchor deploy --provider.cluster devnet && pnpm sync"
