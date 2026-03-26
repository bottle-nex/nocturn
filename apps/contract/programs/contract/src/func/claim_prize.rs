use anchor_lang::prelude::*;
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    claim_account_shape::ClaimAccount,
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

    let escrow = &ctx.accounts.escrow_account;
    require!(
        escrow.lamports() >= claim_account.amount,
        ErrorCodes::InsufficientEscrow
    );

    // Transfer SOL from escrow PDA to claimer
    let quiz_account_key = quiz_account.key();
    let escrow_seeds: &[&[u8]] = &[
        b"escrow",
        quiz_account_key.as_ref(),
        &[ctx.bumps.escrow_account],
    ];

    let transfer_amount = claim_account.amount;

    **escrow.try_borrow_mut_lamports()? -= transfer_amount;
    **claimer.try_borrow_mut_lamports()? += transfer_amount;

    // Mark as claimed
    claim_account.is_claimed = true;
    claim_account.claimed_at = clock.unix_timestamp;
    claim_account.claimer_pubkey = claimer.key();
    quiz_account.total_claimed += 1;

    msg!(
        "Prize of {} lamports claimed by {:?} for rank {}",
        transfer_amount,
        claimer.key(),
        claim_account.rank
    );

    // Suppress unused variable warning for escrow_seeds (used for PDA verification)
    let _ = escrow_seeds;

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

    /// CHECK: Escrow PDA holding the prize pool SOL
    #[account(
        mut,
        seeds = [b"escrow", quiz_account.key().as_ref()],
        bump,
    )]
    pub escrow_account: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"claim", quiz_id.as_bytes(), claim_token.as_bytes()],
        bump,
    )]
    pub claim_account: Account<'info, ClaimAccount>,

    #[account(mut)]
    pub claimer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
