use anchor_lang::prelude::*;
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    claim_account_shape::ClaimAccount,
};
use crate::error::error::ErrorCodes;

pub fn reclaim_expired(
    ctx: Context<ReclaimExpired>,
    _quiz_id: String,
    _claim_token: String,
) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let claim_account = &mut ctx.accounts.claim_account;
    let host = &ctx.accounts.host;

    require!(
        host.key() == quiz_account.host_pub_key,
        ErrorCodes::Unauthorized
    );

    require!(quiz_account.is_finalized, ErrorCodes::NotFinalized);
    require!(!claim_account.is_claimed, ErrorCodes::AlreadyClaimed);

    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp >= claim_account.expires_at,
        ErrorCodes::ClaimNotExpired
    );

    let escrow = &ctx.accounts.escrow_account;
    require!(
        escrow.lamports() >= claim_account.amount,
        ErrorCodes::InsufficientEscrow
    );

    // Transfer expired claim amount from escrow back to host
    let transfer_amount = claim_account.amount;

    **escrow.try_borrow_mut_lamports()? -= transfer_amount;
    **host.try_borrow_mut_lamports()? += transfer_amount;

    // Mark claim as claimed to prevent double-reclaim
    claim_account.is_claimed = true;
    claim_account.claimed_at = clock.unix_timestamp;
    claim_account.claimer_pubkey = host.key();

    quiz_account.total_refunded += transfer_amount;

    msg!(
        "Reclaimed {} lamports from expired claim (rank {})",
        transfer_amount,
        claim_account.rank
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String, claim_token: String)]
pub struct ReclaimExpired<'info> {
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

    #[account(
        mut,
        seeds = [b"claim", quiz_id.as_bytes(), claim_token.as_bytes()],
        bump,
    )]
    pub claim_account: Account<'info, ClaimAccount>,

    #[account(mut)]
    pub host: Signer<'info>,

    pub system_program: Program<'info, System>,
}
