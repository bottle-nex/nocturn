use anchor_lang::prelude::*;
use crate::data::quiz_account_shape::QuizAccountShape;

pub fn create_quiz(ctx: Context<CreateQuiz>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String)]
pub struct CreateQuiz <'info>  {
    // for quiz data 
    #[account(
        init,
        payer = host,
        space = 8 + QuizAccountShape::length(), 
        seeds = [b"quiz", quiz_id.as_bytes(), host.key().as_ref()],
        bump
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    // for escrow account


    #[account(mut)]
    pub host: Signer<'info>,
    pub system_program: Program<'info, System>
}

