use anchor_lang::prelude::*;
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    claim_account_shape::ClaimAccount,
};
use crate::error::error::ErrorCodes;

pub fn finalize_quiz(
    ctx: Context<FinalizeQuiz>,
    _quiz_id: String,
    claim_token: String,
    winner_email_hash: [u8; 32],
    amount: u64,
    rank: u8,
    expires_at: i64,
) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let platform_authority = &ctx.accounts.platform_authority;

    require!(
        platform_authority.key() == quiz_account.platform_authority,
        ErrorCodes::PlatformNotAuthorized
    );

    require!(!quiz_account.is_finalized, ErrorCodes::AlreadyFinalized);
    require!(!quiz_account.is_cancelled, ErrorCodes::QuizCancelled);

    let claim_account = &mut ctx.accounts.claim_account;
    claim_account.quiz_id = quiz_account.quiz_id.clone();
    claim_account.claim_token = claim_token;
    claim_account.winner_email_hash = winner_email_hash;
    claim_account.amount = amount;
    claim_account.rank = rank;
    claim_account.is_claimed = false;
    claim_account.claimed_at = 0;
    claim_account.claimer_pubkey = Pubkey::default();
    claim_account.expires_at = expires_at;
    claim_account.bump = ctx.bumps.claim_account;

    quiz_account.total_winners += 1;

    msg!("Claim account created for rank {}, amount: {} lamports", rank, amount);
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String, claim_token: String)]
pub struct FinalizeQuiz<'info> {
    #[account(
        mut,
        seeds = [b"quiz", quiz_id.as_bytes(), quiz_account.host_pub_key.as_ref()],
        bump,
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    #[account(
        init,
        payer = platform_authority,
        space = 8 + ClaimAccount::length(),
        seeds = [b"claim", quiz_id.as_bytes(), claim_token.as_bytes()],
        bump,
    )]
    pub claim_account: Account<'info, ClaimAccount>,

    #[account(mut)]
    pub platform_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
