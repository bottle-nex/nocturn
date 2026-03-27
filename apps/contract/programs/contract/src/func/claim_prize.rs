use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    claim_account_shape::ClaimAccount,
    nocturn_data::NocturnData,
};
use crate::error::error::ErrorCodes;

pub fn claim_prize(
    ctx: Context<ClaimPrize>,
    _quiz_id: String,
    _claim_token: String,
) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let claim_account = &mut ctx.accounts.claim_account;
    let claimer = &ctx.accounts.claimer;

    require!(quiz_account.is_finalized, ErrorCodes::NotFinalized);
    require!(!claim_account.is_claimed, ErrorCodes::AlreadyClaimed);

    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp < claim_account.expires_at,
        ErrorCodes::ClaimExpired
    );

    require!(
        ctx.accounts.escrow_token_account.amount >= claim_account.amount,
        ErrorCodes::InsufficientEscrow
    );

    let transfer_amount = claim_account.amount;

    // Sign with escrow authority PDA
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
                to: ctx.accounts.claimer_token_account.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            },
            &[escrow_auth_seeds],
        ),
        transfer_amount,
    )?;

    // Mark as claimed
    claim_account.is_claimed = true;
    claim_account.claimed_at = clock.unix_timestamp;
    claim_account.claimer_pubkey = claimer.key();
    quiz_account.total_claimed += 1;

    msg!(
        "Prize of {} USDC base units claimed by {:?} for rank {}",
        transfer_amount,
        claimer.key(),
        claim_account.rank
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String, claim_token: String)]
pub struct ClaimPrize<'info> {
    #[account(
        mut,
        seeds = [b"quiz", quiz_id.as_bytes(), quiz_account.host_pub_key.as_ref()],
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

    #[account(
        mut,
        seeds = [b"claim", quiz_id.as_bytes(), claim_token.as_bytes()],
        bump,
    )]
    pub claim_account: Account<'info, ClaimAccount>,

    /// Claimer's USDC token account (ATA, must pre-exist — frontend creates beforehand)
    #[account(
        mut,
        constraint = claimer_token_account.owner == claimer.key(),
        constraint = claimer_token_account.mint == NocturnData::USDC_MINT @ ErrorCodes::InvalidMint,
    )]
    pub claimer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub claimer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}
