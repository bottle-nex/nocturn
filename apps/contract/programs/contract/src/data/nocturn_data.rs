use anchor_lang::prelude::*;

pub struct NocturnData {}

impl NocturnData {
    pub const PUBKEY: Pubkey =
        Pubkey::from_str_const("DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR");
    pub const FEES: u64 = 1;
    // SPL Token Mint for prize payments (6 decimals)
    // DEVNET:  Custom test token (FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja)
    // MAINNET: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (real USDC)
    pub const USDC_MINT: Pubkey =
        Pubkey::from_str_const("FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja");
}
