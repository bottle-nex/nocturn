use anchor_lang::prelude::*;

#[account]
pub struct ClaimAccount {
    pub quiz_id: String,
    pub claim_token_hash: [u8; 32],
    pub winner_email_hash: [u8; 32],
    pub amount: u64,
    pub rank: u8,
    pub is_claimed: bool,
    pub claimed_at: i64,
    pub claimer_pubkey: Pubkey,
    pub expires_at: i64,
    pub bump: u8,
}

impl ClaimAccount {
    pub fn verifies_token(&self, token: &str) -> bool {
        solana_sha256_hasher::hash(token.as_bytes()).to_bytes() == self.claim_token_hash
    }

    pub fn length() -> usize {
        4 + 32 +   // quiz_id (String: max 32 chars for cuid)
        32 +       // claim_token_hash ([u8; 32])
        32 +       // winner_email_hash ([u8; 32])
        8 +        // amount (u64)
        1 +        // rank (u8)
        1 +        // is_claimed (bool)
        8 +        // claimed_at (i64)
        32 +       // claimer_pubkey (Pubkey)
        8 +        // expires_at (i64)
        1          // bump (u8)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_the_secret_token_verifies() {
        let token = "winner-secret";
        let token_hash = solana_sha256_hasher::hash(token.as_bytes()).to_bytes();
        let claim = ClaimAccount {
            quiz_id: "quiz".into(),
            claim_token_hash: token_hash,
            winner_email_hash: [0; 32],
            amount: 100,
            rank: 1,
            is_claimed: false,
            claimed_at: 0,
            claimer_pubkey: Pubkey::default(),
            expires_at: 1000,
            bump: 0,
        };
        assert!(claim.verifies_token(token));
        assert!(!claim.verifies_token("attacker-secret"));
        let public_hash = token_hash.iter().map(|b| format!("{:02x}", b)).collect::<String>();
        assert!(!claim.verifies_token(&public_hash));
        assert!(!claim.verifies_token(""));
    }
}
