use anchor_lang::prelude::*;

pub struct NocturnData {}

impl NocturnData {
    pub const PUBKEY: Pubkey =
        Pubkey::from_str_const("3ULNo29njjmDEyLr8DSyyJUDgnZW5BqPGrHFXVP2fjKL");
    pub const FEES: u64 = 1;
}
