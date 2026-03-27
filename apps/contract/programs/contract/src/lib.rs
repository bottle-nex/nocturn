pub mod data;
pub mod func;
pub mod error;

use anchor_lang::prelude::*;
use func::*;

declare_id!("8Gj7Nuc8uQZjA9h4XrfQ7RCbuKFW74mhk6nbQ8cdjZue");

#[program]
pub mod contract {
    use super::*;

    pub fn create_quiz(
        ctx: Context<CreateQuiz>,
        quiz_id: String,
        host_id: String,
        amount: u64,
    ) -> Result<()> {
        func::create_quiz::create_quiz(ctx, quiz_id, host_id, amount)
    }

    pub fn authorize_platform(
        ctx: Context<AuthorizePlatform>,
        quiz_id: String,
        platform_pubkey: Pubkey,
    ) -> Result<()> {
        func::authorize_platform::authorize_platform(ctx, quiz_id, platform_pubkey)
    }

    pub fn finalize_quiz(
        ctx: Context<FinalizeQuiz>,
        quiz_id: String,
        claim_token: String,
        winner_email_hash: [u8; 32],
        amount: u64,
        rank: u8,
        expires_at: i64,
    ) -> Result<()> {
        func::finalize_quiz::finalize_quiz(ctx, quiz_id, claim_token, winner_email_hash, amount, rank, expires_at)
    }

    pub fn seal_quiz(
        ctx: Context<SealQuiz>,
        quiz_id: String,
    ) -> Result<()> {
        func::seal_quiz::seal_quiz(ctx, quiz_id)
    }

    pub fn claim_prize(
        ctx: Context<ClaimPrize>,
        quiz_id: String,
        claim_token: String,
    ) -> Result<()> {
        func::claim_prize::claim_prize(ctx, quiz_id, claim_token)
    }

    pub fn cancel_quiz(
        ctx: Context<CancelQuiz>,
        quiz_id: String,
    ) -> Result<()> {
        func::cancel_quiz::cancel_quiz(ctx, quiz_id)
    }

    pub fn reclaim_expired(
        ctx: Context<ReclaimExpired>,
        quiz_id: String,
        claim_token: String,
    ) -> Result<()> {
        func::reclaim_expired::reclaim_expired(ctx, quiz_id, claim_token)
    }
}
