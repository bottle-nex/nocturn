pub mod data;
pub mod func;

use anchor_lang::prelude::*;
use func::*;

declare_id!("3ULNo29njjmDEyLr8DSyyJUDgnZW5BqPGrHFXVP2fjKL");

#[program]
pub mod contract {
    use super::*;
    pub fn create_quiz(ctx: Context<CreateQuiz>) -> Result<()> {
        func::create_quiz::create_quiz(ctx)
    }
}