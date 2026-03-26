use anchor_lang::prelude::*;
use crate::data::quiz_account_shape::QuizAccountShape;
use crate::error::error::ErrorCodes;

const SEVEN_DAYS_IN_SECONDS: i64 = 7 * 24 * 60 * 60;

pub fn seal_quiz(
    ctx: Context<SealQuiz>,
    _quiz_id: String,
) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let platform_authority = &ctx.accounts.platform_authority;

    require!(
        platform_authority.key() == quiz_account.platform_authority,
        ErrorCodes::PlatformNotAuthorized
    );

    require!(!quiz_account.is_finalized, ErrorCodes::AlreadyFinalized);
    require!(!quiz_account.is_cancelled, ErrorCodes::QuizCancelled);
    require!(quiz_account.total_winners > 0, ErrorCodes::NotFinalized);

    let clock = Clock::get()?;
    quiz_account.is_finalized = true;
    quiz_account.claim_expiry = clock.unix_timestamp + SEVEN_DAYS_IN_SECONDS;

    msg!(
        "Quiz sealed with {} winners. Claims expire at {}",
        quiz_account.total_winners,
        quiz_account.claim_expiry
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String)]
pub struct SealQuiz<'info> {
    #[account(
        mut,
        seeds = [b"quiz", quiz_id.as_bytes(), quiz_account.host_pub_key.as_ref()],
        bump,
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    #[account(mut)]
    pub platform_authority: Signer<'info>,
}
