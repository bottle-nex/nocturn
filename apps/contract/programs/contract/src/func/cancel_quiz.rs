use anchor_lang::prelude::*;
use crate::data::quiz_account_shape::QuizAccountShape;
use crate::error::error::ErrorCodes;

pub fn cancel_quiz(
    ctx: Context<CancelQuiz>,
    _quiz_id: String,
) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let host = &ctx.accounts.host;

    require!(
        host.key() == quiz_account.host_pub_key,
        ErrorCodes::Unauthorized
    );

    require!(!quiz_account.is_finalized, ErrorCodes::AlreadyFinalized);
    require!(!quiz_account.is_cancelled, ErrorCodes::QuizCancelled);

    // Transfer all lamports from escrow back to host
    let escrow = &ctx.accounts.escrow_account;
    let escrow_balance = escrow.lamports();

    if escrow_balance > 0 {
        **escrow.try_borrow_mut_lamports()? -= escrow_balance;
        **host.try_borrow_mut_lamports()? += escrow_balance;
    }

    quiz_account.is_cancelled = true;

    msg!("Quiz cancelled. {} lamports returned to host", escrow_balance);
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String)]
pub struct CancelQuiz<'info> {
    #[account(
        mut,
        seeds = [b"quiz", quiz_id.as_bytes(), host.key().as_ref()],
        bump,
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    /// CHECK: Escrow PDA holding the prize pool SOL
    #[account(
        mut,
        seeds = [b"escrow", quiz_account.key().as_ref()],
        bump,
    )]
    pub escrow_account: SystemAccount<'info>,

    #[account(mut)]
    pub host: Signer<'info>,

    pub system_program: Program<'info, System>,
}
