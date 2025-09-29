use anchor_lang::prelude::*;

#[account]
pub struct QuizAccountShape {
    quiz_id: String,
    stake_amount: u64,
    host_pub_key: Pubkey,
    host_id: String,
}

impl QuizAccountShape {
    pub fn length() -> usize {
        let len = 16 + // for quiz id 
            8 + // for stake amount
            8 + // for host pub key
            16; // for host id 
        return len;
    }
}
