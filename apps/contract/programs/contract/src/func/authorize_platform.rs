use anchor_lang::prelude::*;
use crate::data::quiz_account_shape::QuizAccountShape;
use crate::error::error::ErrorCodes;

pub fn authorize_platform(
    ctx: Context<AuthorizePlatform>,
    _quiz_id: String,
    platform_pubkey: Pubkey,
) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let host = &ctx.accounts.host;

    require!(
        host.key() == quiz_account.host_pub_key,
        ErrorCodes::Unauthorized
    );

    require!(
        quiz_account.platform_authority == Pubkey::default(),
        ErrorCodes::AlreadyAuthorized
    );

    require!(!quiz_account.is_cancelled, ErrorCodes::QuizCancelled);

    quiz_account.platform_authority = platform_pubkey;

    msg!("Platform authority set to: {:?}", platform_pubkey);
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String)]
pub struct AuthorizePlatform<'info> {
    #[account(
        mut,
        seeds = [b"quiz", quiz_id.as_bytes(), host.key().as_ref()],
        bump,
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    #[account(mut)]
    pub host: Signer<'info>,
}
