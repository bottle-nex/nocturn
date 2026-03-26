# Solana Prizepool System - Architecture & Implementation Plan

## Context

Nocturn needs a complete prizepool system where hosts stake SOL into an on-chain escrow, configure how prizes are distributed among top N winners, and winners claim their rewards via a `/claim` page after receiving an email with a QR code. The existing contract only has `create_quiz` (escrow deposit). Everything else - distribution config, finalization, claiming, refunds - needs to be built.

**Key decisions:**

- **Hybrid finalization:** Host signs ONE approval tx, then the server auto-finalizes all winners using a platform authority keypair
- **Wallet-only claiming:** Winners must connect a Solana wallet to claim (no custodial option)
- **7-day claim expiry:** Winners have 7 days to claim before host can reclaim

---

## 1. Smart Contract (apps/contract/)

### New Account: `ClaimAccount`

One PDA per winner per quiz, created when server finalizes prizes after host approval.

```rust
#[account]
pub struct ClaimAccount {
    pub quiz_id: String,              // 4 + 16 bytes
    pub claim_token: String,          // 4 + 64 bytes (SHA-256 hex)
    pub winner_email_hash: [u8; 32],  // 32 bytes
    pub amount: u64,                  // 8 bytes (lamports)
    pub rank: u8,                     // 1 byte
    pub is_claimed: bool,             // 1 byte
    pub claimed_at: i64,              // 8 bytes (unix ts, 0 if unclaimed)
    pub claimer_pubkey: Pubkey,       // 32 bytes (zero if unclaimed)
    pub expires_at: i64,              // 8 bytes (unix ts)
    pub bump: u8,                     // 1 byte
}
// PDA seeds: ["claim", quiz_id.as_bytes(), claim_token.as_bytes()]
```

### Updated `QuizAccountShape`

```rust
#[account]
pub struct QuizAccountShape {
    pub quiz_id: String,
    pub prize: u64,
    pub host_pub_key: Pubkey,
    pub host_id: String,
    pub is_finalized: bool,           // NEW: set true after seal_quiz
    pub total_winners: u8,            // NEW: number of winners
    pub total_claimed: u8,            // NEW: counter
    pub total_refunded: u64,          // NEW: lamports refunded to host
    pub is_cancelled: bool,           // NEW: host cancelled before quiz
    pub claim_expiry: i64,            // NEW: unix timestamp
    pub platform_authority: Pubkey,   // NEW: delegated signer (zero until authorized)
    pub bump: u8,                     // NEW: store bump for PDA signing
}
```

### New Instructions

| Instruction          | Signer                              | Purpose                                                                                                                                        |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `authorize_platform` | Host (browser wallet)               | Host signs ONCE to delegate finalization authority to the platform keypair for this specific quiz. Stores platform pubkey on QuizAccountShape. |
| `finalize_quiz`      | Platform authority (server keypair) | Creates a ClaimAccount PDA for one winner. Called N times by server automatically. Verifies `signer == quiz_account.platform_authority`.       |
| `seal_quiz`          | Platform authority                  | Marks quiz as finalized, sets 7-day claim expiry. No more claims can be added after this.                                                      |
| `claim_prize`        | Winner (browser wallet)             | Transfers SOL from escrow PDA to winner's wallet. Winner must connect wallet on `/claim` page.                                                 |
| `cancel_quiz`        | Host                                | Returns all escrow SOL to host. Only works before finalization.                                                                                |
| `reclaim_expired`    | Host                                | Reclaims a single expired unclaimed prize from escrow after 7-day window.                                                                      |

### Hybrid Finalization Model

```
Quiz ends → Host sees "Approve Prize Distribution" button
→ Host signs ONE `authorize_platform` tx (wallet popup)
→ Server detects authorization on-chain
→ Server calls `finalize_quiz` × N + `seal_quiz` using platform keypair
→ All happens automatically in the background
→ Winner emails sent after seal_quiz confirms
```

- Platform keypair stored as env var (`PLATFORM_AUTHORITY_KEYPAIR`) on the server
- Contract enforces: platform can ONLY finalize quizzes where host explicitly authorized it
- Host never needs to stay on the page after the single approval

### Security

- Escrow PDA seeds: `["escrow", quiz_account.key()]` - program signs on its behalf
- `finalize_quiz` verifies `signer == quiz_account.platform_authority` (set by host via `authorize_platform`)
- Platform keypair cannot touch escrows it wasn't authorized for
- Claim token (64-char random hex, emailed to winner) is the authentication for claiming
- Solana runtime serializes writes to same account - prevents double-claim race conditions
- Claimer pays gas (~5000 lamports) - standard for pull-based models

### Error Codes

```rust
#[error_code]
pub enum ErrorCodes {
    Unauthorized,
    AlreadyFinalized,
    NotFinalized,
    AlreadyClaimed,
    ClaimExpired,
    QuizCancelled,
    ClaimNotExpired,
    InsufficientEscrow,
    PlatformNotAuthorized,
    AlreadyAuthorized,
}
```

---

## 2. Database Schema Changes

### New Models

**`PrizeDistribution`** - Host's configured split

```prisma
model PrizeDistribution {
    id             String  @id @default(cuid())
    quizId         String
    quiz           Quiz    @relation(fields: [quizId], references: [id], onDelete: Cascade)
    rank           Int
    percentage     Float   // e.g. 50.0 for 50%
    amount         Float?  // calculated: prizePool * percentage / 100
    amountLamports BigInt? // amount * 1e9

    @@unique([quizId, rank])
    @@map("prize_distributions")
}
```

**`PrizeClaim`** - Per-winner claim record

```prisma
model PrizeClaim {
    id              String      @id @default(cuid())
    quizId          String
    quiz            Quiz        @relation(fields: [quizId], references: [id], onDelete: Cascade)
    participantId   String
    participant     Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
    rank            Int
    amount          Float       // SOL
    amountLamports  BigInt      // lamports
    claimToken      String      @unique
    claimTokenHash  String      // SHA-256 hash (stored on-chain)
    emailHash       String      // SHA-256 of participant email (on-chain)
    status          ClaimStatus @default(PENDING)
    claimedAt       DateTime?
    claimerWallet   String?
    txSignature     String?     // Solana tx sig
    expiresAt       DateTime
    emailSentAt     DateTime?
    createdAt       DateTime    @default(now())
    updatedAt       DateTime    @updatedAt

    @@map("prize_claims")
}

enum ClaimStatus {
    PENDING
    CLAIMED
    EXPIRED
    REFUNDED
}
```

**Quiz model additions:**

- `prizeDistributions PrizeDistribution[]`
- `prizeClaims PrizeClaim[]`
- `escrowPda String?`
- `quizAccountPda String?`
- `onChainTxSignature String?`

**Participant model addition:**

- `prizeClaims PrizeClaim[]`

### Files to modify

- `packages/database/prisma/schema/quiz.prisma` - add PrizeDistribution, PrizeClaim models, Quiz fields
- `packages/database/prisma/schema/enums.prisma` - add ClaimStatus enum
- `packages/database/prisma/schema/users.prisma` - add prizeClaims relation to Participant

---

## 3. Backend Flow

### 3.1 Distribution Configuration

**New endpoint:** `POST /api/quiz/:quizId/distribution`

- Body: `{ distributions: [{ rank: 1, percentage: 50 }, ...] }`
- Validates: percentages sum to 100, ranks sequential from 1
- Saves to `PrizeDistribution` table

### 3.2 Stake Confirmation

**New endpoint:** `POST /api/quiz/:quizId/confirm-stake`

- Body: `{ txSignature, escrowPda, quizAccountPda }`
- Verifies tx on Solana via `Connection.getTransaction()`
- Updates Quiz with on-chain addresses

### 3.3 Post-Quiz Prize Claim Creation

**Insert point:** `apps/server/src/sockets/HostManager.ts:533` (the comment says "call another function for processing the transaction")

When `quiz.prizePool > 0` and quiz ends:

1. Fetch `PrizeDistribution` records
2. Match winners by `finalRank` from the ranked leaderboard
3. Handle ties: if 2 participants tie for rank 1, split rank 1 + rank 2 prizes equally
4. For each winner:
   - Generate `claimToken` = `crypto.randomBytes(32).toString('hex')`
   - Compute `claimTokenHash` = SHA-256(claimToken)
   - Compute `emailHash` = SHA-256(participant.email)
   - Calculate `amountLamports` = `(prizePool * percentage / 100) * 1e9`
   - Create `PrizeClaim` record (status=PENDING, expiresAt=now+7days)
5. Quiz status already set to `PAYOUT_PENDING` (line 529)
6. Emit WebSocket event to host with prize data → shows "Approve Distribution" button

### 3.4 Hybrid Finalization Flow

1. Host clicks "Approve Distribution" → frontend sends `authorize_platform` tx (ONE wallet popup)
2. Frontend calls `POST /api/quiz/:quizId/authorize-confirm` with txSignature
3. Server verifies the `authorize_platform` tx on-chain
4. Server automatically calls `finalize_quiz` for each winner using platform keypair (Bull queue job: `FINALIZE_PRIZE_ON_CHAIN`)
5. Server calls `seal_quiz` after all claims are created
6. Server enqueues `WINNER_NOTIFICATION` email jobs for each winner
7. Host gets real-time progress updates via WebSocket

**New endpoints:**

- `POST /api/quiz/:quizId/authorize-confirm` - Body: `{ txSignature }` - confirms host's authorize_platform tx
- `GET /api/quiz/:quizId/prize-claims` - Returns all PrizeClaim records + finalization status

### 3.5 Claim Endpoints

**`GET /api/claim/:token`** - Public, no auth required

- Returns: quiz title, rank, amount (SOL), expiry, status

**`POST /api/claim/:token/confirm`** - Public

- Body: `{ txSignature, walletAddress }`
- Verifies on-chain `claim_prize` tx
- Updates PrizeClaim: status=CLAIMED, claimerWallet, txSignature
- If all claims resolved → quiz status = PAYOUT_COMPLETED

### 3.6 Expiry Cron

Daily cron job (apps/orchestrator):

- Find PrizeClaims where `expiresAt < now` AND `status == PENDING`
- Mark as EXPIRED
- Notify host via email they can reclaim unclaimed funds

### 3.7 New env vars for server

- `PLATFORM_AUTHORITY_KEYPAIR` - Base58-encoded Solana keypair for server-side signing
- `SOLANA_RPC_URL` - Solana RPC endpoint (devnet for dev, mainnet for prod)

---

## 4. Email & QR Code

### New dependency

`qrcode` npm package in `apps/orchestrator`

### New email type: `WINNER_NOTIFICATION`

Add to `packages/types/src/email/email.types.ts`:

```typescript
interface WinnerNotificationEmailData {
  email: string;
  participantName: string;
  quizTitle: string;
  rank: number;
  prizeAmount: number; // SOL
  claimUrl: string; // https://nocturn.app/claim?token=<TOKEN>
  expiresAt: string; // formatted date
}
```

### Email content

- "You Won!" header with rank badge
- Quiz title, rank (#1, #2...), prize amount (X.XX SOL)
- QR code (200x200, generated server-side as base64 data URI) encoding the claim URL
- "Claim Your Prize" CTA button linking to same URL
- **7-day expiry notice** prominently displayed
- Nocturn branding (dark theme with alpha/delta colors)

### Files to modify

- `apps/orchestrator/src/services/email/templates/email.templates.ts` - add winner template
- `apps/orchestrator/src/queue/email_service.queue.ts` - handle new job type
- `packages/types/src/email/email.types.ts` - add interface and enum value

---

## 5. Frontend

### 5.1 Prize Distribution Config

**New component:** `PrizeDistributionConfig` (in quiz creation sidebar, shown when prizePool > 0)

- "Number of winners" input (default 3)
- Dynamic rank rows with percentage inputs
- Default suggestions: 1→100%, 2→60/40, 3→50/30/20, 4→40/25/20/15, 5→35/25/20/12/8
- Host can manually adjust ("jumble") percentages
- Real-time validation: must sum to 100%
- Preview showing SOL amount per rank (e.g., "1st: 2.5 SOL, 2nd: 1.5 SOL, 3rd: 1.0 SOL")

**Store changes:** Add `prizeDistributions: { rank: number; percentage: number }[]` to `useNewQuizStore`

### 5.2 Host Finalization Panel

**New component:** `PrizeFinalizationPanel` (shown on quiz results screen when prizePool > 0)

- List of winners with rank + prize amount
- Single "Approve Distribution" button (ONE wallet popup)
- Progress indicator showing server-side finalization status (via WebSocket)
- States: waiting for approval → authorizing → finalizing (X/N) → sealing → complete → emails sent

### 5.3 Claim Page

**New route:** `apps/web/app/claim/page.tsx`

- Extracts `token` from `?token=` query param
- Calls `GET /api/claim/:token` for claim details
- States:
  - **PENDING:** Shows prize details → "Connect Wallet" (Phantom/Solflare/Backpack) → "Claim Prize" button → constructs `claim_prize` tx → confirmation
  - **CLAIMED:** Shows "Already claimed" + Solscan tx link
  - **EXPIRED:** Shows "This claim has expired"
- No NextAuth login required - claim token IS the authentication
- New store: `apps/web/src/store/claim/useClaimStore.ts`

### 5.4 Host Dashboard Prize Status

In quiz management view, show prize claim status:

- Claim progress: X/Y claimed
- Individual winner statuses with timestamps
- "Reclaim" button for expired unclaimed prizes (triggers `reclaim_expired` tx via wallet)

---

## 6. Edge Cases

| Case                                      | Handling                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rank ties**                             | Split combined prize of tied ranks equally. E.g., two tied for 1st split (rank1% + rank2%) / 2 each                                            |
| **Fewer participants than winners**       | Only create claims for actual participants. Remainder stays in escrow for host to reclaim after 7-day expiry                                   |
| **Unclaimed prizes**                      | 7-day expiry → daily cron marks EXPIRED → host notified → host reclaims via `reclaim_expired`                                                  |
| **Double claim attempt**                  | On-chain: fails with `AlreadyClaimed`. Backend: idempotent confirm endpoint                                                                    |
| **Host cancels before live**              | `cancel_quiz` instruction returns all escrow SOL. Only works before `authorize_platform`                                                       |
| **Insufficient escrow**                   | Contract validates `escrow.lamports >= claim.amount` before transfer                                                                           |
| **Email not delivered**                   | Claim page is still accessible if winner has the URL. Host can view claim URLs in dashboard                                                    |
| **Quiz with 0 prizePool**                 | Entire prizepool system is bypassed - existing flow unchanged                                                                                  |
| **Server-side finalization fails midway** | Bull queue retries (3 attempts). If still fails, host is notified. Partial finalization is safe - only sealed claims are claimable             |
| **Platform keypair compromised**          | Can only finalize quizzes that were explicitly authorized by hosts. Cannot steal escrow funds (only create claim PDAs). Rotate key + re-deploy |

---

## 7. User Journey Summary

```
Host creates quiz → Sets prizePool (SOL) → Configures distribution (N winners, % each)
→ Preview distribution → Connect wallet → "Stake & Publish" → create_quiz on-chain (1% fee to Nocturn)
→ Quiz goes LIVE → Normal quiz flow → Quiz ends → Ranks assigned
→ Server creates PrizeClaim records (status: PENDING) → Quiz → PAYOUT_PENDING
→ Host sees "Approve Distribution" → Signs ONE tx (authorize_platform)
→ Server auto-finalizes all claims on-chain using platform keypair
→ Server seals quiz → Emails winners with QR codes
→ Winner opens /claim?token=... → Connects Solana wallet → claim_prize on-chain → SOL received
→ After 7 days: unclaimed prizes → EXPIRED → host reclaims via reclaim_expired
```

---

## 8. Implementation Phases

**Phase 1: Smart Contract** (independent)

- Updated QuizAccountShape with new fields
- ClaimAccount structure
- 6 new instructions: authorize_platform, finalize_quiz, seal_quiz, claim_prize, cancel_quiz, reclaim_expired
- Error codes
- Anchor tests covering all flows
- Files: `apps/contract/programs/contract/src/`

**Phase 2: Database** (independent)

- PrizeDistribution and PrizeClaim models
- ClaimStatus enum
- Quiz model additions (escrowPda, quizAccountPda, onChainTxSignature, relations)
- Participant model relation
- Migration
- Files: `packages/database/prisma/schema/`

**Phase 3: Backend** (depends on Phase 2)

- Distribution config endpoint
- Stake confirmation endpoint
- Prize claim creation logic in HostManager
- Hybrid finalization flow (authorize-confirm endpoint + Bull queue job)
- Claim verification and confirmation endpoints
- Expiry cron job
- Solana connection utilities + platform keypair loading
- Files: `apps/server/src/controllers/`, `apps/server/src/sockets/HostManager.ts`, `apps/orchestrator/`

**Phase 4: Email** (depends on Phase 3)

- Winner notification email template with QR code
- `qrcode` dependency in orchestrator
- Email job handler for WINNER_NOTIFICATION
- Files: `apps/orchestrator/src/services/email/`

**Phase 5: Frontend** (depends on Phase 1 + Phase 3)

- PrizeDistributionConfig component in quiz creation
- PrizeFinalizationPanel on quiz results screen
- `/claim` page + useClaimStore
- Host dashboard prize status view
- Anchor client integration for authorize_platform, claim_prize, reclaim_expired
- Files: `apps/web/app/claim/`, `apps/web/src/components/`, `apps/web/src/store/`

---

## Verification Plan

1. **Contract:** `anchor test` with scenarios: create→authorize→finalize→seal→claim, create→cancel, create→authorize→finalize→seal→expire→reclaim
2. **Database:** `pnpm db:migrate:dev` and verify models in Prisma Studio
3. **Backend:** Test distribution endpoint (valid/invalid), test claim creation after mock quiz end, test hybrid finalization flow
4. **Email:** Verify QR code renders correctly, claim URL is valid, 7-day expiry shown
5. **Frontend:** Create quiz with prizePool on devnet, verify distribution UI, simulate full claim flow
6. **E2E:** Full flow on Solana devnet - stake → quiz → authorize → auto-finalize → claim → verify SOL received in winner wallet
