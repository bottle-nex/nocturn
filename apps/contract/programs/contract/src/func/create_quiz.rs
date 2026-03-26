use anchor_lang::{prelude::*, system_program};
use crate::data::{
    quiz_account_shape::QuizAccountShape,
    nocturn_data::NocturnData,
};
use crate::error::{
    error::ErrorCodes
};

pub fn create_quiz(ctx: Context<CreateQuiz>, quiz_id: String, host_id: String, amount: u64) -> Result<()> {
    let quiz_account = &mut ctx.accounts.quiz_account;
    let host = &ctx.accounts.host;

    quiz_account.quiz_id = quiz_id;
    quiz_account.prize = amount;
    quiz_account.host_id = host_id;
    quiz_account.host_pub_key = host.key();
    quiz_account.is_finalized = false;
    quiz_account.total_winners = 0;
    quiz_account.total_claimed = 0;
    quiz_account.total_refunded = 0;
    quiz_account.is_cancelled = false;
    quiz_account.claim_expiry = 0;
    quiz_account.platform_authority = Pubkey::default();
    quiz_account.bump = ctx.bumps.quiz_account;
    
    let nocturn_fees = amount / 100 * NocturnData::FEES;
    let escrow_account = &ctx.accounts.escrow_account;

    let escrow_tx_ix = system_program::Transfer {
        from: host.to_account_info(),
        to: escrow_account.to_account_info()
    };

    let escrow_cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        escrow_tx_ix
    );

    let escrow_tx = system_program::transfer(escrow_cpi_ctx, amount - nocturn_fees)?;

    //transferring lamports to nocturns wallet
    let fees_tx_ix = system_program::Transfer {
        from: host.to_account_info(),
        to: ctx.accounts.nocturn_account.to_account_info()
    };

    let fees_cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        fees_tx_ix
    );

    let fees_tx = system_program::transfer(fees_cpi_ctx, nocturn_fees);

    msg!("transaction id is {:?}", escrow_tx);
    msg!("fees transaction id is : {:?}", fees_tx);
    Ok(())
}

#[derive(Accounts)]
#[instruction(quiz_id: String)]
pub struct CreateQuiz <'info>  {

    #[account(
        init,
        payer = host,
        space = 8 + QuizAccountShape::length(), 
        seeds = [b"quiz", quiz_id.as_bytes(), host.key().as_ref()],
        bump
    )]
    pub quiz_account: Account<'info, QuizAccountShape>,

    #[account(
        mut,
        seeds = [b"escrow", quiz_account.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA used as an escrow vault, created implicitly when SOL is transferred
    pub escrow_account: SystemAccount<'info>,

    #[account(
        mut,
        address = NocturnData::PUBKEY @ ErrorCodes::Unauthorized
    )]
    /// CHECK: Nocturn platform fee account
    pub nocturn_account: AccountInfo<'info>,

    #[account(mut)]
    pub host: Signer<'info>,
    pub system_program: Program<'info, System>

}


