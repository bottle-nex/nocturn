use anchor_lang::prelude::*;

#[account]
pub struct QuizAccountShape {
    pub quiz_id: String,
    pub prize: u64,
    pub host_pub_key: Pubkey,
    pub host_id: String,
    pub is_finalized: bool,
    pub total_winners: u8,
    pub total_claimed: u8,
    pub total_refunded: u64,
    pub is_cancelled: bool,
    pub claim_expiry: i64,
    pub platform_authority: Pubkey,
    pub bump: u8,
}

impl QuizAccountShape {
    pub fn length() -> usize {
        4 + 16 +   // quiz_id (String: 4 byte prefix + max 16 chars)
        8 +        // prize (u64)
        32 +       // host_pub_key (Pubkey)
        4 + 16 +   // host_id (String: 4 byte prefix + max 16 chars)
        1 +        // is_finalized (bool)
        1 +        // total_winners (u8)
        1 +        // total_claimed (u8)
        8 +        // total_refunded (u64)
        1 +        // is_cancelled (bool)
        8 +        // claim_expiry (i64)
        32 +       // platform_authority (Pubkey)
        1          // bump (u8)
    }
}
