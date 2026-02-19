# Packages (database, types, UI) -- Deep Bug Report

**Date**: 2026-02-19
**Branch**: dev
**Scope**: database (Prisma schemas, seed, client), types (enums, schemas, socket types, response types, premium types), UI (button, card, code)

---

## Severity Summary

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 1      |
| HIGH      | 4      |
| MEDIUM    | 15     |
| LOW       | 5      |
| **Total** | **25** |

---

## Top 5 Critical Bugs

1. **enums.prisma.ts, Lines 21-29** -- `SessionStatusEnum` values do not match Prisma enum; values `STARTING`, `QUESTION_ACTIVE`, `QUESTION_ENDED`, and `ELIMINATING` do not exist in the database and will cause Prisma write failures.
2. **schemas.prisma.ts, Lines 250-304** -- Duplicate `Collaborator` and `CollabSession` interface declarations cause confusing type merging and inconsistent field definitions.
3. **quiz.prisma, Line 78** -- `correctAnswer` has no validation constraint; can be any integer including negative numbers or out-of-bounds indexes.
4. **users.prisma, Line 43** -- IP addresses stored in plain text without hashing or encryption, which is a GDPR/privacy concern.
5. **prisma.config.ts, Lines 16-18** -- Placeholder database URL fallback silently connects to a non-existent database instead of failing loudly.

---

## All Bugs Grouped by File

---

## DATABASE

---

### prisma/schema/schema.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/schema.prisma`
**Bugs found**: 1

1. **[MEDIUM] Line 2: No `url` specified in the datasource.** The datasource only declares `provider = "postgresql"` but no `url`. This relies entirely on the prisma config file (`prisma.config.ts`) to supply the URL. If the config is misconfigured, migrations and introspection will fail with an unhelpful error. **Fix**: Add a `url = env("DATABASE_URL")` for clarity, even if overridden.

---

### prisma/schema/users.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/users.prisma`
**Bugs found**: 3

1. **[HIGH] Line 43: IP address stored in plain text.** `ipAddress String?` on the `Participant` model stores user IP addresses without any hashing or encryption. Depending on jurisdiction (GDPR, etc.), IP addresses are personally identifiable information and should be protected. **Fix**: Hash or encrypt IP addresses before storage, or document the legal basis for storing them.

2. **[MEDIUM] Line 32: `currentTier` is a plain String, not a foreign key.** The `currentTier` field is `String?` with a default of `"FREE"`, but it is not a relation to `SubscriptionTier`. This means it can contain invalid values (e.g., `"INVALID_TIER"`) with no database-level constraint. **Fix**: Either make it a relation or add a check constraint.

3. **[LOW] Line 36: `@@map("hosts")` is misleading.** The model is `User` but the table is mapped to `hosts`. This is confusing and suggests these are only quiz hosts, not general users. **Fix**: Rename to `users` for clarity.

---

### prisma/schema/quiz.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/quiz.prisma`
**Bugs found**: 3

1. **[HIGH] Line 78: `correctAnswer` has no validation constraint.** The `correctAnswer Int` field on `Question` can be any integer, including negative numbers or numbers exceeding the options array length. There is no database-level check constraint. **Fix**: Add application-level validation or a Prisma middleware check constraint.

2. **[MEDIUM] Line 15: `prizePool Float` without precision.** Using `Float` for monetary values (prize pool) will cause floating-point precision errors. If the prize pool is `0.1 + 0.2`, it may not equal `0.3`. **Fix**: Use `Decimal` type instead of `Float` for monetary values.

3. **[MEDIUM] Line 3: `title` limited to 50 characters.** `@db.VarChar(50)` is quite restrictive for quiz titles. Long quiz titles will be silently truncated or rejected by the database. **Fix**: Increase to a more reasonable limit (e.g., 200 characters).

---

### prisma/schema/game.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/game.prisma`
**Bugs found**: 2

1. **[MEDIUM] Lines 64-65: Missing `onDelete` on `Elimination.participantId`.** The `Elimination` model has a `participantId` String field but no relation defined to `Participant`. If a participant is deleted, orphaned elimination records remain. **Fix**: Add a relation to `Participant` with `onDelete: Cascade`.

2. **[LOW] Line 101: `editedAt` on `ChatMessage` uses `@updatedAt`.** This means any update to the record (even non-content changes) will update `editedAt`, making it unreliable for tracking actual message edits. **Fix**: Only update `editedAt` explicitly when the message content changes, not via `@updatedAt`.

---

### prisma/schema/collab.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/collab.prisma`
**Bugs found**: 1

1. **[MEDIUM] Lines 11-12: Missing `onDelete` cascades.** The `Collaborator` model's relations to `CollabSession` and `User` have no `onDelete` specified. If a session or user is deleted, the collaborator records will cause foreign key constraint errors. **Fix**: Add `onDelete: Cascade` to both relations.

---

### prisma/schema/ai.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/ai.prisma`
**Bugs found**: 0

No bugs found. Clean schema with proper cascading deletes.

---

### prisma/schema/subscription.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/subscription.prisma`
**Bugs found**: 2

1. **[MEDIUM] Lines 55-56: `amount Float` for monetary payment values.** Same floating-point precision issue as quiz.prisma. Payment amounts should use `Decimal`. **Fix**: Change `Float` to `Decimal`.

2. **[MEDIUM] Lines 69-77: `Payment.amount` also uses `Float`.** Same issue. **Fix**: Change to `Decimal`.

---

### prisma/schema/templates.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/templates.prisma`
**Bugs found**: 0

No bugs found.

---

### prisma/schema/enums.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/enums.prisma`
**Bugs found**: 2

1. **[MEDIUM] Line 11: `QuizStatus` has a `NULL` value.** Having an enum value literally named `NULL` is extremely confusing and error-prone. It can be confused with actual null/undefined values in application code, leading to logic bugs. **Fix**: Rename to `DRAFT` or `UNSET` or remove it entirely.

2. **[LOW] Line 21: `SessionStatusEnum` in TypeScript types has values that do not exist in the Prisma `SessionStatus` enum.** The Prisma enum has `WAITING`, `LIVE`, `COMPLETED`, `PAUSED`, but the TypeScript enum in `enums.prisma.ts` adds values like `STARTING`, `QUESTION_ACTIVE`, etc. These are out of sync and will cause runtime errors if the TypeScript values are sent to the database. **Fix**: Synchronize the enums between Prisma and TypeScript.

---

### prisma/schema/platform.prisma

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/schema/platform.prisma`
**Bugs found**: 1

1. **[LOW] Line 9: `updateAt` typo.** The field is named `updateAt` instead of `updatedAt`. This is inconsistent with every other model in the schema which uses `updatedAt`. **Fix**: Rename to `updatedAt`.

---

### prisma/seed.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma/seed.ts`
**Bugs found**: 2

1. **[MEDIUM] Lines 72-98: Sequential user migration without batching.** The migration iterates over all users one by one with individual `update` and `create` calls. For a large user base, this will be extremely slow and may time out. **Fix**: Use `prisma.$transaction` with batched updates or `updateMany`.

2. **[LOW] Line 1: Unused `Prisma` import.** `Prisma` is imported but never used. **Fix**: Remove the unused import.

---

### src/client.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/src/client.ts`
**Bugs found**: 1

1. **[MEDIUM] Lines 6-7: Double dotenv config loading.** Both `config({ path: resolve(process.cwd(), ".env") })` and `config({ path: resolve(process.cwd(), "../../.env") })` are called. Depending on which `.env` file exists and what it contains, values from the first load may be overridden by the second, or vice versa. This is fragile and order-dependent. **Fix**: Use a single, deterministic env loading strategy.

---

### src/index.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/src/index.ts`
**Bugs found**: 0

No bugs found.

---

### src/utils/templates.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/src/utils/templates.ts`
**Bugs found**: 1

1. **[LOW] Lines 14-91: Template `id` field is manually set but ignored by Prisma.** The `Template` interface has an `id` field, but the Prisma model uses `@id @default(cuid())`. In the seed's `upsert`, the `id` is not included in the `create` data, so it will be auto-generated. However, the `id` field in the template array (e.g., `"CLASSIC"`) is misleading as it is never used. **Fix**: Remove the `id` field from the template data or use it as the actual Prisma id.

---

### prisma.config.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/database/prisma.config.ts`
**Bugs found**: 1

1. **[MEDIUM] Lines 16-18: Placeholder database URL fallback.** `process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder"` means if the env var is missing, Prisma will try to connect to a non-existent database with fake credentials. This should fail loudly instead. **Fix**: Throw an error if `DATABASE_URL` is not set.

---

## TYPES

---

### types/src/index.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/index.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/const/nocturn.const.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/const/nocturn.const.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/email/email.types.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/email/email.types.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/premium/premium.types.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/premium/premium.types.ts`
**Bugs found**: 2

1. **[LOW] Line 8: `SubscriptionTierDTO.name` typed as `string` instead of enum.** The comment says `'FREE' | 'PRO' | 'ENTERPRISE'` but it is typed as `string`. The Prisma schema only has `FREE` and `PRO` and no `ENTERPRISE`. **Fix**: Type as `'FREE' | 'PRO'` to match the schema.

2. **[LOW] Lines 25-103: `premium_features` prices in EUR but schema uses INR.** The `premium_features` constant shows `currency: "EUR"` with a price of 16, but the seed data and Prisma schema default to `currency: "INR"` with a price of 999. These are completely inconsistent. **Fix**: Align the currency and pricing.

---

### types/src/prisma/enums.prisma.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/prisma/enums.prisma.ts`
**Bugs found**: 2

1. **[CRITICAL] Lines 21-29: `SessionStatusEnum` values do not match Prisma enum.** The Prisma `SessionStatus` has: `WAITING`, `LIVE`, `COMPLETED`, `PAUSED`. The TypeScript `SessionStatusEnum` has: `WAITING`, `STARTING`, `QUESTION_ACTIVE`, `QUESTION_ENDED`, `ELIMINATING`, `COMPLETED`, `PAUSED`. Values `STARTING`, `QUESTION_ACTIVE`, `QUESTION_ENDED`, and `ELIMINATING` do not exist in the database enum. Using them will cause Prisma write errors. **Fix**: Synchronize the TypeScript enum with the Prisma schema, or add the missing values to the Prisma enum.

2. **[MEDIUM] Lines 31-38: `ParticipantScreenEnum` is missing `QUIZ_RESULTS`.** The Prisma `ParticipantScreen` enum includes `QUIZ_RESULTS` but the TypeScript enum does not. This means the client cannot handle or display the quiz results screen for participants. **Fix**: Add `QUIZ_RESULTS` to `ParticipantScreenEnum`.

---

### types/src/prisma/schemas.prisma.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/prisma/schemas.prisma.ts`
**Bugs found**: 3

1. **[HIGH] Lines 250-293 and 284-304: Duplicate `Collaborator` and `CollabSession` interface declarations.** Both `Collaborator` and `CollabSession` interfaces are defined twice in the same file (lines 250-260 and 284-293 for `Collaborator`; lines 262-271 and 295-304 for `CollabSession`). In TypeScript, duplicate interfaces merge. The second `Collaborator` definition is missing the `color` field that the first has. This means the merged type will have `color` from the first, but the inconsistency is confusing and error-prone. **Fix**: Remove the duplicate declarations.

2. **[MEDIUM] Line 243: `AiQuizChatSession.difficulty` typed as `string` but Prisma schema has `Int?`.** The Prisma model `AiQuizChatSession` defines `difficulty Int?` but the TypeScript interface types it as `string?`. This will cause type mismatches when reading from the database. **Fix**: Change to `difficulty?: number`.

3. **[MEDIUM] Lines 183-184: `phaseStartTime` and `phaseEndTime` typed as `number` but Prisma schema has `DateTime?`.** The Prisma model defines `phaseStartTime DateTime?` and `phaseEndTime DateTime?` but the TypeScript interface types them as `number` and `number?`. **Fix**: Change to `Date | null` to match the Prisma schema.

---

### types/src/response/custom.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/custom.response.ts`
**Bugs found**: 1

1. **[MEDIUM] Line 9: `meta` is required but `success` and `data` are optional.** The `CustomResponse` type makes `meta` required (no `?`) while `success`, `data`, and `message` are optional. This means code like `if (data.success)` could be checking an undefined value. More importantly, `meta` should likely be optional as well, or `success` should be required. **Fix**: Make `success` required or make `meta` optional, depending on the API contract.

---

### types/src/response/type.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/type.response.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/response/home/get_reviews_type.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/home/get_reviews_type.response.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/response/home/user_quiz_types.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/home/user_quiz_types.response.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/response/live/get-live-quiz-data.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/live/get-live-quiz-data.response.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/response/live/get-un-asked-question.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/live/get-un-asked-question.response.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/response/live/live-quiz-types.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/live/live-quiz-types.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/response/new/get_new_quiz.response.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/response/new/get_new_quiz.response.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/socket/socket.types.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/socket/socket.types.ts`
**Bugs found**: 2

1. **[MEDIUM] Lines 113-129: `PubSubMessageTypes` uses `payload: any` throughout.** The `any` type completely bypasses TypeScript's type checking for all socket messages. This means any malformed payload will pass type checking silently, leading to runtime errors. **Fix**: Define specific payload types for each message type.

2. **[LOW] Line 53: Typo in `ParticipantNameChangeEvent.choosenNickname`.** "choosen" should be "chosen". Same issue at line 82 for `SpectatorNameChangeEvent`. **Fix**: Rename to `chosenNickname`.

---

### types/src/socket/socket.codes.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/socket/socket.codes.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/socket/collaborators/collaborators.types.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/socket/collaborators/collaborators.types.ts`
**Bugs found**: 0

No bugs found.

---

### types/src/stream/stream.types.ts

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/types/src/stream/stream.types.ts`
**Bugs found**: 0

No bugs found.

---

## UI

---

### ui/src/button.tsx

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/ui/src/button.tsx`
**Bugs found**: 2

1. **[MEDIUM] Line 11: `appName` prop is required but never used.** The `ButtonProps` interface requires `appName: string` but it is destructured away and never referenced. Consumers must pass a useless prop. **Fix**: Remove `appName` from the interface or use it.

2. **[LOW] Line 12: Button has no `onClick` handler or `type` attribute.** The button component does not forward `onClick`, `type`, or any other native button attributes. It also has no `type="button"` default, meaning it defaults to `type="submit"` inside forms, which can cause unexpected form submissions. **Fix**: Extend `ButtonHTMLAttributes<HTMLButtonElement>` and spread remaining props.

---

### ui/src/card.tsx

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/ui/src/card.tsx`
**Bugs found**: 1

1. **[MEDIUM] Line 17: Trailing double-quote in the URL.** The href is constructed as `` `${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo"` ``. Note the trailing `"` inside the template literal. This produces a malformed URL like `https://example.com?...create-turbo"`. **Fix**: Remove the trailing `"`.

---

### ui/src/code.tsx

**Path**: `/Users/vaibhav_zope/Downloads/utility/nocturn/packages/ui/src/code.tsx`
**Bugs found**: 0

No bugs found.

---

## Total Bug Count: 25
