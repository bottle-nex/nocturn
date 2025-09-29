use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCodes {
    #[msg("Only the property owner can perform this action")]
    Unauthorized,
}
