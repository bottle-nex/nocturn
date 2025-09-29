use anchor_lang::prelude::*;

#[account]
pub struct QuizAccountShape {
    pub quiz_id: String,
    pub prize: u64,
    pub host_pub_key: Pubkey,
    pub host_id: String,
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
