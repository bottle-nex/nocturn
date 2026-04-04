use anchor_lang::prelude::*;

#[account]
pub struct ClaimAccount {
    pub quiz_id: String,
    pub claim_token: String,
    pub winner_email_hash: [u8; 32],
    pub amount: u64,
    pub rank: u8,
    pub is_claimed: bool,
    pub claimed_at: i64,
    pub claimer_pubkey: Pubkey,
    pub expires_at: i64,
    pub bump: u8,
}

impl ClaimAccount {
    pub fn length() -> usize {
        4 + 32 +   // quiz_id (String: max 32 chars for cuid)
        4 + 32 +   // claim_token (String: max 32 chars hex)
        32 +       // winner_email_hash ([u8; 32])
        8 +        // amount (u64)
        1 +        // rank (u8)
        1 +        // is_claimed (bool)
        8 +        // claimed_at (i64)
        32 +       // claimer_pubkey (Pubkey)
        8 +        // expires_at (i64)
        1          // bump (u8)
    }
}
