use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    nocturn_data::NocturnData,
};
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

    // Transfer all USDC from escrow back to host
    let escrow_balance = ctx.accounts.escrow_token_account.amount;

    if escrow_balance > 0 {
        let quiz_account_key = quiz_account.key();
        let escrow_auth_seeds: &[&[u8]] = &[
            b"escrow_auth",
            quiz_account_key.as_ref(),
            &[quiz_account.escrow_bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.host_token_account.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
                &[escrow_auth_seeds],
            ),
            escrow_balance,
        )?;
    }

    quiz_account.is_cancelled = true;

    msg!("Quiz cancelled. {} USDC base units returned to host", escrow_balance);
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

    /// CHECK: Escrow authority PDA for signing token transfers
    #[account(
        seeds = [b"escrow_auth", quiz_account.key().as_ref()],
        bump,
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    /// Escrow USDC token account
    #[account(
        mut,
        seeds = [b"escrow", quiz_account.key().as_ref()],
        bump,
        constraint = escrow_token_account.mint == NocturnData::USDC_MINT @ ErrorCodes::InvalidMint,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Host's USDC token account (ATA)
    #[account(
        mut,
        constraint = host_token_account.owner == host.key(),
        constraint = host_token_account.mint == NocturnData::USDC_MINT @ ErrorCodes::InvalidMint,
    )]
    pub host_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub host: Signer<'info>,

    pub token_program: Program<'info, Token>,
}
