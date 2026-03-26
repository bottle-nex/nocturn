# Nocturn Prizepool Distribution — Architecture & Flow

This document explains the complete lifecycle of a prizepool quiz in Nocturn, from the moment a host sets a prize pool to the moment a winner claims their SOL.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [On-Chain Accounts (Solana)](#on-chain-accounts)
3. [Database Models](#database-models)
4. [The Complete Flow](#the-complete-flow)
   - [Stage 1: Quiz Creation & Staking](#stage-1-quiz-creation--staking)
   - [Stage 2: Quiz Goes Live & Results](#stage-2-quiz-goes-live--results)
   - [Stage 3: Prize Claim Creation](#stage-3-prize-claim-creation)
   - [Stage 4: Host Authorization (Hybrid Finalization)](#stage-4-host-authorization)
   - [Stage 5: On-Chain Finalization](#stage-5-on-chain-finalization)
   - [Stage 6: Winner Email Notification](#stage-6-winner-email-notification)
   - [Stage 7: Winner Claims Prize](#stage-7-winner-claims-prize)
   - [Stage 8: Expiry & Reclaim](#stage-8-expiry--reclaim)
5. [Queue Architecture](#queue-architecture)
6. [Security Model](#security-model)
7. [File Map](#file-map)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                           │
│                                                                         │
│  Quiz Creation ──> StakeAmountSection + PrizeDistributionConfig         │
│  Quiz Results  ──> PrizeFinalizationPanel (host approves distribution)  │
│  /claim?token= ──> ClaimPage (winner connects wallet, claims SOL)       │
└────────────┬───────────────────────────────────────────┬────────────────┘
             │ REST API                                  │ WebSocket
             ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVER (Express + WS)                            │
│                                                                         │
│  Prize Routes ── controllers ── SolanaService ── PrizeQueue (Bull)      │
│  HostManager.create_prize_claims() ── WebSocket events                  │
└────────────┬──────────────────────────┬────────────────┬────────────────┘
             │ Bull Queue (Redis)       │ Prisma          │ RPC
             ▼                          ▼                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│  ORCHESTRATOR    │  │   PostgreSQL     │  │   Solana Blockchain      │
│                  │  │                  │  │                          │
│  EmailProcessor  │  │  Quiz            │  │  QuizAccountShape (PDA)  │
│  PrizeExpiry     │  │  PrizeDistrib.   │  │  EscrowAccount (PDA)     │
│  (daily cron)    │  │  PrizeClaim      │  │  ClaimAccount (PDA)      │
└──────────────────┘  └──────────────────┘  └──────────────────────────┘
```

---

## On-Chain Accounts

There are three types of Program Derived Addresses (PDAs) on Solana:

### QuizAccountShape

**Seeds:** `["quiz", quiz_id, host_pubkey]`

Stores quiz metadata on-chain. Created when the host stakes SOL.

```
quiz_id, host_id, host_pub_key, prize (lamports)
is_finalized, is_cancelled
total_winners, total_claimed, total_refunded
claim_expiry, platform_authority, bump
```

### EscrowAccount

**Seeds:** `["escrow", quiz_account_key]`

A system account (not a data account) that holds the staked SOL. The host's SOL lands here during `create_quiz`. This is a PDA-controlled vault — no private key exists for it. SOL can only leave via program instructions (`claim_prize`, `cancel_quiz`, `reclaim_expired`).

### ClaimAccount

**Seeds:** `["claim", quiz_id, claim_token]`

One per winner. Created by the server during `finalize_quiz`. Contains:

```
quiz_id, claim_token, winner_email_hash
amount (lamports), rank, expires_at
is_claimed, claimed_at, claimer_pubkey, bump
```

---

## Database Models

### PrizeDistribution

Configured by the host during quiz creation. Defines how the prize pool splits.

```
quizId, rank, percentage, amount, amountLamports
@@unique([quizId, rank])
```

Example for a 5 SOL pool with 3 winners:
| rank | percentage | amount |
|------|-----------|--------|
| 1 | 50% | 2.5 SOL |
| 2 | 30% | 1.5 SOL |
| 3 | 20% | 1.0 SOL |

### PrizeClaim

Created after quiz results are computed. One per winning participant.

```
quizId, participantId, rank, amount, amountLamports
claimToken (unique, 64-char hex), claimTokenHash, emailHash
status (PENDING → CLAIMED | EXPIRED | REFUNDED)
claimerWallet, txSignature, expiresAt, emailSentAt
```

### Quiz (added fields)

```
escrowPda, quizAccountPda, onChainTxSignature
prizeDistributions[], prizeClaims[]
```

---

## The Complete Flow

### Stage 1: Quiz Creation & Staking

**Who:** Host (browser)
**Where:** `apps/web` → StakeDraft panel

```
Host opens quiz editor
  └─> StakeAmountSection: enters prize pool (e.g. 5 SOL)
       └─> PrizeDistributionConfig: sets winner count + percentages
            └─> Zustand store: quiz.prizePool = 5, quiz.prizeDistributions = [...]
```

When the host saves/publishes the quiz:

1. **Frontend** calls `POST /prize/distribution/:quizId` with the percentages
2. **Server** (`setDistributionController`) validates percentages sum to 100%, calculates SOL amounts, creates `PrizeDistribution` records in PostgreSQL
3. **Frontend** builds a Solana `create_quiz` transaction using the Anchor IDL
4. **Host signs** in their browser wallet (Phantom/Solflare) — SOL transfers from host wallet → escrow PDA
5. **Frontend** sends the tx signature to `POST /prize/confirm-stake/:quizId`
6. **Server** (`confirmStakeController`) verifies the tx on-chain via `SolanaService.verify_transaction()`, stores `escrowPda`, `quizAccountPda`, `onChainTxSignature` on the Quiz record

**Quiz status:** `PUBLISHED` (or `SCHEDULED`)

**What's on-chain at this point:**

- `QuizAccountShape` PDA exists with the quiz metadata
- `EscrowAccount` PDA holds the staked SOL
- `platform_authority` is still `Pubkey::default()` (not yet delegated)

---

### Stage 2: Quiz Goes Live & Results

**Who:** Host + Participants (WebSocket)
**Where:** `apps/server` → QuizManager / HostManager

This is the normal quiz flow — nothing prizepool-specific here:

```
Host launches quiz → participants join via code → questions cycle through
  QUESTION_READING → QUESTION_ACTIVE → SHOW_RESULTS → repeat
    → QUIZ_RESULTS (final)
```

When the host triggers the final results screen, `HostManager.handle_quiz_results()` runs:

1. Fetches the full leaderboard from Redis (sorted by score)
2. Filters out kicked participants
3. Assigns `finalRank` with tie handling (same score = same rank)
4. Sets quiz status based on prizePool:
   - **Has prize:** `QuizStatus.PAYOUT_PENDING`
   - **No prize:** `QuizStatus.COMPLETED`
5. Checks if `quiz.prizePool > 0` → proceeds to Stage 3

---

### Stage 3: Prize Claim Creation

**Who:** Server (automatic, triggered at end of quiz)
**Where:** `apps/server/src/sockets/HostManager.ts` → `create_prize_claims()`

This runs immediately after results are computed. No user action needed.

```
HostManager.handle_quiz_results()
  └─> if (quiz.prizePool > 0)
       └─> create_prize_claims(quiz_id, game_session_id, rankable)
```

**What happens inside `create_prize_claims()`:**

1. Fetches `PrizeDistribution` records from PostgreSQL (the percentages the host configured)
2. Builds a `rankMap`: maps each rank → array of participant IDs at that rank
3. **Tie handling:** If 2 participants tied at rank 1, it combines the prizes for rank 1 + rank 2 and splits evenly between them
4. For each winner:
   - Generates a `claimToken` = `crypto.randomBytes(32).toString('hex')` (64 hex chars, single-use)
   - Hashes the token: `claimTokenHash = SHA-256(claimToken)`
   - Hashes the participant's email: `emailHash = SHA-256(email)`
   - Sets `expiresAt` = now + 7 days
   - Creates a `PrizeClaim` record in PostgreSQL with status `PENDING`
5. Emits `PRIZE_CLAIMS_READY` WebSocket event to the host, so the frontend can show the PrizeFinalizationPanel

**At this point:**

- Database has PrizeClaim records (one per winner)
- Nothing has happened on-chain yet
- No emails sent yet
- Host sees the PrizeFinalizationPanel overlay on the quiz results screen

---

### Stage 4: Host Authorization (Hybrid Finalization)

**Who:** Host (browser — ONE wallet popup)
**Where:** `apps/web` → PrizeFinalizationPanel

This is the "hybrid" part. The host only needs to sign ONE transaction, then the server handles the rest.

```
PrizeFinalizationPanel
  └─> Host clicks "Approve Distribution"
       └─> Frontend builds authorize_platform transaction
            └─> Host signs in wallet (one popup)
                 └─> POST /prize/authorize-confirm/:quizId { txSignature }
```

**On-chain (`authorize_platform` instruction):**

- Verifies the signer is the quiz host (`host.key() == quiz_account.host_pub_key`)
- Verifies platform_authority hasn't been set yet (`== Pubkey::default()`)
- Sets `quiz_account.platform_authority = server's platform keypair pubkey`

This is the trust handoff — the host says "I trust the Nocturn server to finalize this quiz."

**Server-side (`authorizeConfirmController`):**

1. Verifies the `authorize_platform` tx on-chain
2. Loads all `PrizeClaim` records for this quiz (with participant data)
3. Enqueues a `FINALIZE_PRIZE_ON_CHAIN` job to the **prize-finalization Bull queue**

---

### Stage 5: On-Chain Finalization

**Who:** Server (automatic, via Bull queue)
**Where:** `apps/server/src/queue/prize/prize.queue.ts` → PrizeQueue

```
Bull Queue: "prize-finalization"
  └─> Job: FINALIZE_PRIZE_ON_CHAIN
       └─> PrizeQueue.process_finalization()
```

The `prize-finalization` queue is a Bull queue running on the **server** process (not the orchestrator). It uses Redis as the job backend.

**What the processor does (for each winner claim):**

1. Calls `finalize_quiz` instruction on Solana using the **platform authority keypair** (stored in `SERVER_PLATFORM_AUTHORITY_KEYPAIR` env var). This:
   - Creates a `ClaimAccount` PDA on-chain with seeds `["claim", quiz_id, claim_token]`
   - Stores the prize amount, rank, email hash, and expiry on-chain
   - Increments `quiz_account.total_winners`
   - **Signer:** server's platform keypair (NOT the host — host already authorized in Stage 4)

2. After ALL claims are finalized, calls `seal_quiz` instruction:
   - Sets `quiz_account.is_finalized = true`
   - Sets `quiz_account.claim_expiry = now + 7 days`
   - After this, no more claims can be added

3. For each winner, enqueues a `WINNER_NOTIFICATION` email job → Stage 6

4. Updates quiz status to `COMPLETED`

**Bull queue retry logic:** 3 attempts with exponential backoff (5s → 10s → 20s). If a claim fails, Bull retries it automatically.

---

### Stage 6: Winner Email Notification

**Who:** Orchestrator (automatic, via Bull queue)
**Where:** `apps/orchestrator` → EmailServiceProcessor → ResendService

```
Server (PrizeQueue)
  └─> email_service_queue_instance.email_winner_notification(data)
       └─> Bull Queue: "email-service-queue" (shared Redis)
            └─> Orchestrator picks up the job
                 └─> EmailServiceProcessor.read_messages()
                      └─> case WINNER_NOTIFICATION:
                           └─> ResendService.send_winner_notification_email()
```

**The flow across processes:**

1. **Server** adds a job to the `email-service-queue` Bull queue with type `WINNER_NOTIFICATION`
2. **Orchestrator** (separate Node.js process) has a processor listening on this queue
3. `EmailServiceProcessor.handle_winner_notification_email()` calls `ResendService.send_winner_notification_email()`
4. `ResendService`:
   - Generates a QR code from the claim URL using the `qrcode` npm package
   - QR code colors: `#E84545` (alpha) on `#2B2E4A` (delta) background
   - Renders the `generate_winner_notification_email()` HTML template with:
     - Rank badge (gold/silver/bronze colors)
     - Quiz title, prize amount in SOL
     - Embedded QR code (base64 data URI)
     - "Claim Your Prize" CTA button linking to `/claim?token=<claimToken>`
     - 7-day expiry notice
   - Sends via Resend API

**The claim URL format:** `https://nocturn.app/claim?token=<64-char-hex-token>`

The token is the ONLY way to access the claim page. It's not tied to authentication — anyone with the link can view the claim, but only a connected wallet can execute the on-chain `claim_prize` instruction.

---

### Stage 7: Winner Claims Prize

**Who:** Winner (browser)
**Where:** `apps/web/app/claim/page.tsx`

```
Winner opens email → clicks claim link or scans QR code
  └─> /claim?token=abc123...
       └─> ClaimPage component
```

**Step-by-step:**

1. **Page loads:** Calls `GET /prize/claim/:token` (public, no auth)
   - Server returns: quiz title, rank, amount, status, expiry
   - If status is `CLAIMED` → shows "Already claimed" with tx link
   - If status is `EXPIRED` → shows "Claim expired" message
   - If status is `PENDING` and not expired → shows claim interface

2. **Winner connects wallet:** Page shows installed Solana wallets (Phantom, Solflare)
   - Uses `@solana/wallet-adapter-react` with the `SolanaWalletProvider` at the root layout

3. **Winner clicks "Claim Prize":**
   - Frontend builds a `claim_prize` transaction using the Anchor IDL
   - Winner signs in their wallet
   - Transaction executes on-chain:
     - Verifies `is_finalized == true`
     - Verifies `!is_claimed`
     - Verifies `clock < expires_at`
     - Transfers `claim_account.amount` lamports from escrow PDA → winner's wallet
     - Marks `is_claimed = true`, records `claimer_pubkey` and `claimed_at`

4. **Frontend confirms:** Sends `POST /prize/claim/:token/confirm` with `{ txSignature, claimerWallet }`
   - Server verifies the tx on-chain
   - Updates PrizeClaim in PostgreSQL: status → `CLAIMED`, stores wallet + tx signature

**Claim page states:**

```
loading → pending → connecting → claiming → claimed
                                          → error (retry)
           → expired
           → not_found
```

---

### Stage 8: Expiry & Reclaim

**Who:** Orchestrator (automatic) + Host (manual)

Two things happen for expired claims:

#### 8a. Database Expiry (Orchestrator)

```
Orchestrator boots up
  └─> PrizeExpiryWorker
       └─> Bull Queue: "prize-expiry"
            └─> Cron: "0 0 * * *" (midnight daily)
                 └─> expire_pending_claims()
```

Daily at midnight, the orchestrator runs:

```sql
UPDATE prize_claims
SET status = 'EXPIRED'
WHERE status = 'PENDING' AND expires_at < NOW()
```

This is a database-level cleanup. It doesn't touch the blockchain.

#### 8b. On-Chain Reclaim (Host)

After a claim expires on-chain (7 days past `seal_quiz`), the host can call `reclaim_expired`:

```
Host's dashboard → "Reclaim" button on expired claim
  └─> Frontend builds reclaim_expired transaction
       └─> Host signs
            └─> On-chain:
                 - Verifies is_finalized, !is_claimed, clock >= expires_at
                 - Transfers claim.amount from escrow → host wallet
                 - Marks claim as claimed (prevents double-reclaim)
                 - Adds to quiz_account.total_refunded
```

This returns unclaimed SOL back to the host's wallet.

---

## Queue Architecture

There are **two separate Bull queue systems** running on Redis:

### Server Queues (apps/server process)

| Queue Name            | Job Type                  | Purpose                                                   |
| --------------------- | ------------------------- | --------------------------------------------------------- |
| `prize-finalization`  | `FINALIZE_PRIZE_ON_CHAIN` | Calls finalize_quiz + seal_quiz on-chain, triggers emails |
| `email-service-queue` | Various email types       | Adds jobs that the orchestrator processes                 |
| `database-operations` | Various DB updates        | Async database writes                                     |

### Orchestrator Queues (apps/orchestrator process)

| Queue Name            | Job Type                         | Purpose                                |
| --------------------- | -------------------------------- | -------------------------------------- |
| `email-service-queue` | `WINNER_NOTIFICATION` (+ others) | Processes email jobs, sends via Resend |
| `prize-expiry`        | `check-expired-claims`           | Daily cron, marks expired claims       |

**How they connect:**

The server **adds** jobs to `email-service-queue`. The orchestrator **processes** them. They share the same Redis instance, so Bull coordinates between the two processes.

```
Server (producer) ──> Redis ──> Orchestrator (consumer)
                    email-service-queue
```

---

## Security Model

### Claim Token

- 64-character hex string (`crypto.randomBytes(32)`)
- Single-use, stored hashed in the database
- Transmitted only via email — never exposed in WebSocket events or API responses (except the claim endpoint itself)
- The token is in the URL: `/claim?token=<token>`

### Hybrid Finalization

The host delegates finalization to the platform but retains control:

- **Host signs once** (`authorize_platform`) — sets `platform_authority` on-chain
- **Server signs many** (`finalize_quiz` × N, then `seal_quiz`) — but can ONLY do this for quizzes where it was authorized
- **The server cannot:** create claims for unauthorized quizzes, claim prizes, cancel quizzes, or modify the escrow

### On-Chain Guarantees

- SOL is locked in an escrow PDA — no private key can drain it
- Claims can only be made after `is_finalized == true`
- Each claim can only be claimed once (`is_claimed` flag)
- Expiry is enforced by Solana's clock (`clock.unix_timestamp >= expires_at`)
- Only the host can cancel (before finalization) or reclaim (after expiry)

### Email Hash

- The winner's email is hashed (`SHA-256`) and stored on-chain in the ClaimAccount
- This creates a verifiable link between the off-chain identity (email) and the on-chain claim, without exposing the email on the blockchain

---

## File Map

### Smart Contract (Rust/Anchor)

```
apps/contract/programs/contract/src/
├── lib.rs                              # Program entry — 7 instructions
├── data/
│   ├── quiz_account_shape.rs           # QuizAccountShape struct (on-chain state)
│   ├── claim_account_shape.rs          # ClaimAccount struct (per-winner claim)
│   └── mod.rs
├── func/
│   ├── create_quiz.rs                  # Host stakes SOL → escrow PDA
│   ├── authorize_platform.rs           # Host delegates to server keypair
│   ├── finalize_quiz.rs                # Server creates ClaimAccount PDAs
│   ├── seal_quiz.rs                    # Server locks finalization, sets 7-day expiry
│   ├── claim_prize.rs                  # Winner claims SOL from escrow
│   ├── cancel_quiz.rs                  # Host cancels (before finalization)
│   ├── reclaim_expired.rs              # Host reclaims expired prizes
│   └── mod.rs
└── error/
    └── error.rs                        # Custom error codes
```

### Database (Prisma)

```
packages/database/prisma/schema/
├── enums.prisma                        # ClaimStatus enum
├── quiz.prisma                         # PrizeDistribution, PrizeClaim models + Quiz fields
└── users.prisma                        # Participant.prizeClaims relation
```

### Shared Types

```
packages/types/src/
├── email/email.types.ts                # WinnerNotificationEmailData, EmailJobType.WINNER_NOTIFICATION
├── prisma/schemas.prisma.ts            # PrizeDistributionType, PrizeClaimType
├── prisma/enums.prisma.ts              # ClaimStatusEnum
└── socket/socket.types.ts              # PRIZE_CLAIMS_READY, PRIZE_FINALIZATION_UPDATE
```

### Server (Express)

```
apps/server/src/
├── configs/env.ts                      # SERVER_SOLANA_RPC_URL, SERVER_PLATFORM_AUTHORITY_KEYPAIR
├── services/
│   ├── solana/solana.service.ts         # Connection, keypair, verify_transaction()
│   ├── email/email.services.ts          # email_winner_notification() queue producer
│   └── init.services.ts                 # solanaServiceInstance, prizeQueueInstance
├── routes/
│   ├── prize.router.ts                  # 6 prize endpoints
│   └── index.ts                         # Route registration
├── controllers/prize-controller/
│   ├── setDistributionController.ts     # POST /prize/distribution/:quizId
│   ├── confirmStakeController.ts        # POST /prize/confirm-stake/:quizId
│   ├── authorizeConfirmController.ts    # POST /prize/authorize-confirm/:quizId
│   ├── getPrizeClaimsController.ts      # GET /prize/claims/:quizId
│   ├── getClaimController.ts            # GET /prize/claim/:token (public)
│   └── confirmClaimController.ts        # POST /prize/claim/:token/confirm (public)
├── queue/prize/prize.queue.ts           # PrizeQueue — finalize on-chain + trigger emails
└── sockets/HostManager.ts              # create_prize_claims() at quiz end
```

### Orchestrator

```
apps/orchestrator/src/
├── queue/email_service.queue.ts         # WINNER_NOTIFICATION case in processor
├── services/email/
│   ├── resend.services.ts               # send_winner_notification_email() — QR code + Resend
│   └── templates/email.templates.ts     # generate_winner_notification_email() HTML
├── job/prize-expiry.worker.ts           # Daily cron — mark expired claims
└── services/init-services.ts            # PrizeExpiryWorker registration
```

### Frontend (Next.js)

```
apps/web/
├── app/
│   ├── layout.tsx                       # SolanaWalletProvider wrapping the app
│   └── claim/page.tsx                   # Public claim page — connect wallet, claim SOL
├── routes/api_routes.ts                 # Prize API URL constants
└── src/
    ├── providers/SolanaWalletProvider.tsx     # Phantom + Solflare wallet adapters
    ├── store/
    │   ├── new-quiz/useNewQuizStore.ts        # prizeDistributions in quiz state
    │   └── claim/useClaimStore.ts             # Claim page state management
    └── components/
        ├── utility/StakeAmountSection.tsx          # Stake input wired to store
        └── quiz/
            ├── new/PrizeDistributionConfig.tsx     # Winner count + percentage config
            └── live/host/PrizeFinalizationPanel.tsx # Post-results approval panel
```

---

## Visual Timeline

```
TIME ──────────────────────────────────────────────────────────────────────>

QUIZ CREATION                    LIVE QUIZ              RESULTS & PAYOUT
─────────────                    ─────────              ────────────────

[Host sets       [Host stakes   [Quiz        [Results   [Claims    [Host      [Server        [Emails   [Winners
 prize pool       SOL on-chain   plays        computed   created    authorizes  finalizes      sent      claim
 + distribution   via wallet]    normally]    in Redis]  in DB]     platform]   on-chain]      via       on /claim
 percentages]                                                                                 Resend]   page]
     │                │              │            │          │          │           │             │          │
     ▼                ▼              ▼            ▼          ▼          ▼           ▼             ▼          ▼
  Frontend         Solana        WebSocket    HostManager HostManager Frontend   PrizeQueue   Orchestrator Frontend
  + Server         Contract      + Redis      (server)   (server)   + Server   (Bull queue)  (Bull queue) + Solana

                                                                                              ◄── 7 DAYS ──►
                                                                                                            │
                                                                                              [Expiry cron  │
                                                                                               marks        │
                                                                                               unclaimed    │
                                                                                               as EXPIRED]  │
                                                                                                            │
                                                                                              [Host can     │
                                                                                               reclaim_     │
                                                                                               expired      │
                                                                                               on-chain]    ▼
```
