use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    nocturn_data::NocturnData,
};
use crate::error::error::ErrorCodes;

pub fn create_quiz(ctx: Context<CreateQuiz>, quiz_id: String, host_id: String, amount: u64) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;

    quiz_account.quiz_id = quiz_id;
    quiz_account.prize = amount;
    quiz_account.host_id = host_id;
    quiz_account.host_pub_key = ctx.accounts.host.key();
    quiz_account.is_finalized = false;
    quiz_account.total_winners = 0;
    quiz_account.total_claimed = 0;
    quiz_account.total_refunded = 0;
    quiz_account.is_cancelled = false;
    quiz_account.claim_expiry = 0;
    quiz_account.platform_authority = Pubkey::default();
    quiz_account.bump = ctx.bumps.quiz_account;
    quiz_account.escrow_bump = ctx.bumps.escrow_authority;

    let nocturn_fees = amount / 100 * NocturnData::FEES;
    let escrow_amount = amount - nocturn_fees;

    // Transfer USDC to escrow token account
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.host_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.host.to_account_info(),
            },
        ),
        escrow_amount,
    )?;

    // Transfer USDC fees to Nocturn fee token account
    if nocturn_fees > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.host_token_account.to_account_info(),
                    to: ctx.accounts.nocturn_token_account.to_account_info(),
                    authority: ctx.accounts.host.to_account_info(),
                },
            ),
            nocturn_fees,
        )?;
    }

    msg!("Quiz created with {} USDC base units ({} to escrow, {} fees)", amount, escrow_amount, nocturn_fees);
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String)]
pub struct CreateQuiz<'info> {
    #[account(
        init,
        payer = host,
        space = 8 + QuizAccountShape::length(),
        seeds = [b"quiz", quiz_id.as_bytes(), host.key().as_ref()],
        bump
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    /// USDC mint account
    #[account(
        address = NocturnData::USDC_MINT @ ErrorCodes::InvalidMint
    )]
    pub usdc_mint: Account<'info, Mint>,

    /// Escrow authority PDA (never allocated, used only for signing token transfers)
    /// CHECK: This is a PDA used as token account authority, validated by seeds
    #[account(
        seeds = [b"escrow_auth", quiz_account.key().as_ref()],
        bump
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    /// Escrow token account — holds USDC for the quiz prize pool
    #[account(
        init,
        payer = host,
        token::mint = usdc_mint,
        token::authority = escrow_authority,
        seeds = [b"escrow", quiz_account.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Host's USDC token account (ATA, must pre-exist)
    #[account(
        mut,
        constraint = host_token_account.owner == host.key(),
        constraint = host_token_account.mint == usdc_mint.key(),
    )]
    pub host_token_account: Account<'info, TokenAccount>,

    /// Nocturn platform fee USDC token account (must pre-exist)
    #[account(
        mut,
        constraint = nocturn_token_account.owner == NocturnData::PUBKEY @ ErrorCodes::Unauthorized,
        constraint = nocturn_token_account.mint == usdc_mint.key() @ ErrorCodes::InvalidMint,
    )]
    pub nocturn_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub host: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
