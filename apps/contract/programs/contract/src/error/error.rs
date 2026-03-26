use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCodes {
    #[msg("Only the property owner can perform this action")]
    Unauthorized,
    #[msg("Quiz has already been finalized")]
    AlreadyFinalized,
    #[msg("Quiz has not been finalized yet")]
    NotFinalized,
    #[msg("Prize has already been claimed")]
    AlreadyClaimed,
    #[msg("Claim period has expired")]
    ClaimExpired,
    #[msg("Quiz has been cancelled")]
    QuizCancelled,
    #[msg("Claim has not expired yet")]
    ClaimNotExpired,
    #[msg("Insufficient escrow balance")]
    InsufficientEscrow,
    #[msg("Platform authority not authorized for this quiz")]
    PlatformNotAuthorized,
    #[msg("Platform authority already set for this quiz")]
    AlreadyAuthorized,
}
