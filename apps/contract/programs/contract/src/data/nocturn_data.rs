use anchor_lang::prelude::*;

pub struct NocturnData {}

impl NocturnData {
    pub const PUBKEY: Pubkey =
        Pubkey::from_str_const("DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR");
    pub const FEES: u64 = 1;
    // Devnet USDC mint (6 decimals)
    pub const USDC_MINT: Pubkey =
        Pubkey::from_str_const("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
}
