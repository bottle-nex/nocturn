# Server Controllers -- Bug Tracker

**Date:** 2026-02-19
**Scope:** `apps/server/src/controllers/`
**Branch:** `dev`

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 7      |
| HIGH      | 21     |
| MEDIUM    | 30     |
| LOW       | 25     |
| **TOTAL** | **83** |

---

## CRITICAL (7)

- [x] **#1** `spectatorJoinController.ts:81` -- Uses `prisma` instead of `tx` inside transaction, creates orphan records on rollback. **Fix:** Change `prisma.spectator.create` to `tx.spectator.create`. _(fixed on `redis-key` branch)_
- [ ] **#2** `permanently_delete_quiz_controller.ts:49` -- Missing `await` on `permanentDeleteQuiz()`, response sent before deletion completes. **Fix:** Add `await`.
- [ ] **#3** `signInController.ts:11` -- No validation on `req.body.user`, crashes on malformed body. **Fix:** Add `if (!user || !user.email)` guard.
- [ ] **#4** `startCollaborationController.ts:72-107` -- Never sends HTTP response after creating collab session, request hangs forever. **Fix:** Add `ResponseWriter.success()` after transaction.
- [ ] **#5** `createQuizUsingAIController.ts:19-27` -- AI logic commented out, never sends response, request hangs forever. **Fix:** Uncomment or return 501 Not Implemented.
- [ ] **#6** `getParticipantsOnCall.ts:30` -- `skip: page + limit` instead of `skip: page * limit`, pagination completely broken. **Fix:** Change to `page * limit`.
- [ ] **#7** `getQuestionResults.ts:73-78` -- Double response in catch block causes `ERR_HTTP_HEADERS_SENT` crash. **Fix:** Remove duplicate response.

---

## HIGH (21)

### Security / Auth Bypass

- [ ] **#8** `permanently_delete_quiz_controller.ts:20-31` -- No `hostId` filter, any user can delete any trashed quiz. **Fix:** Add `hostId: String(userId)` to where clause.
- [ ] **#9** `getPreSignedUrlController.ts:7-56` -- No auth check, anyone can get S3 upload URLs. **Fix:** Add `req.user` check.
- [ ] **#10** `getPreSignedUrlController.ts:11-38` -- No MIME type whitelist, arbitrary file uploads allowed. **Fix:** Add allowed types whitelist.
- [ ] **#11** `verifySessionController.ts:5-131` -- No auth check, subscription info leaked to unauthenticated users. **Fix:** Add auth + ownership check.
- [ ] **#12** `readReviewController.ts:5-89` -- No auth check, user PII (emails) exposed publicly. **Fix:** Add auth or remove email from response.
- [ ] **#13** `getQuestionResults.ts:5-80` -- No auth check, question results exposed to anyone. **Fix:** Add `req.user` + host verification.
- [ ] **#14** `spectatorJoinQuizViaURLController.ts:26` -- Token payload never validated (no quizId/role check). **Fix:** Verify decoded token matches URL quizId.

### Logic Errors

- [ ] **#15** `signInController.ts:44-47,128-131` -- JWT signed with no `expiresIn`, tokens never expire. **Fix:** Add `{ expiresIn: '7d' }`.
- [ ] **#16** `renameQuizController.ts:19-29` -- Uses `findMany` instead of `findUnique`, `!quiz` check always passes (empty array is truthy). **Fix:** Use `findUnique` or check `quiz.length === 0`.
- [ ] **#17** `publishQuizController.ts:30` -- `update_quiz_status` call not in try/catch, unhandled exception crashes server. **Fix:** Wrap in try/catch.
- [ ] **#18** `launchQuizController.ts:58-63` -- "Already LIVE" check happens after quiz already launched, quiz stuck in LIVE state. **Fix:** Move check before `update_quiz_status`.
- [ ] **#19** `quizController.ts:110-116` -- `handle_update_quiz` has no ownership validation. **Fix:** Add ownership check inside the method.
- [ ] **#20** `delete_trashed_quizzes_controller.ts:12` -- `deleteMany` with no LIVE status check, potential data loss. **Fix:** Add `status: { not: 'LIVE' }` filter.
- [ ] **#21** `getLiveQuizDataController.ts:115` -- `gameSession?.currentQuestionId!` non-null assertion on optional chain, wrong question returned. **Fix:** Handle null gameSession explicitly.
- [ ] **#22** `getQuizController.ts:93` -- `collabSessionId!` non-null assertion on potentially undefined value. **Fix:** Handle undefined case.
- [ ] **#23** `generateNewQuizController.ts:33-41` -- Fetches any session by ID (no user filter), leaks session existence. **Fix:** Return error for mismatched userId.
- [ ] **#24** `readReviewController.ts:19` -- `sortBy` query param injected directly as Prisma column name. **Fix:** Whitelist allowed `sortBy` values.
- [ ] **#25** `reviewAppController.ts:7` -- `comment.trim()` crashes if comment is undefined. **Fix:** Use `comment?.trim()`.
- [ ] **#26** `duplicateQuizController.ts:6` -- `req.user.id` without optional chaining crashes on unauthenticated requests. **Fix:** Use `req.user?.id`.
- [ ] **#27** `getAllTemplatesController.ts:6` -- `req.user.id` without optional chaining crashes on unauthenticated requests. **Fix:** Use `req.user?.id`.
- [ ] **#28** `upsertQuizController.ts:15-16,18-21,36` -- Debug `console.log` dumps full request body to production logs. **Fix:** Remove or gate behind `NODE_ENV`.

---

## MEDIUM (30)

### Wrong Status Codes / Response Semantics

- [ ] **#29** `upsertLearningJourneyController.ts:19` -- Uses `not_found()` for validation error. **Fix:** Use `invalid_data()`.
- [ ] **#30** `upsertLearningJourneyController.ts:23` -- Returns `success()` for validation failure. **Fix:** Use `invalid_data()`.
- [ ] **#31** `getQuizController.ts:58` -- Returns 203 with `success: true` for non-existent quiz. **Fix:** Use `not_found()`.
- [ ] **#32** `deleteQuizController.ts:39` -- Returns `success()` when deletion is rejected (quiz is LIVE). **Fix:** Use `error()` with 409.
- [ ] **#33** `reviewAppController.ts:7` -- `rating` not type-checked, string values stored without conversion. **Fix:** Add `typeof rating !== 'number'` check.

### Data Integrity

- [ ] **#34** `signInController.ts:20-27` -- OAuth login unconditionally overwrites user's custom name/image. **Fix:** Only update unchanged fields.
- [ ] **#35** `quizController.ts:117-122` -- Quiz update deletes all questions and recreates, destroys linked response data. **Fix:** Use upsert strategy.
- [ ] **#36** `participantJoinController.ts:92` -- Redis `set_participant` inside Prisma transaction, not awaited, causes cache inconsistency. **Fix:** Move outside transaction and `await`.
- [ ] **#37** `get_favourite_quizzes_controller.ts:12` -- Missing `isDeleted: false` filter, trashed quizzes appear in favourites. **Fix:** Add filter.
- [ ] **#38** `duplicateQuizController.ts:34-77` -- Duplicated quiz copies `isFavourite` and loses `templateId`. **Fix:** Set `isFavourite: false`, add `templateId`.
- [ ] **#39** `getQuestionsController.ts:26-34` -- Collaborator check uses `id` instead of `userId`, always fails. **Fix:** Change to `userId: user.id`.

### Logic / Algorithm Bugs

- [ ] **#40** `signInController.ts:73` -- `Math.random()` used for OTP, not cryptographically secure. **Fix:** Use `crypto.randomInt()`.
- [ ] **#41** `publishQuizController.ts:45-60` -- Status checks happen after quiz already updated, dead code. **Fix:** Move checks before update or remove.
- [ ] **#42** `launchQuizController.ts:68` -- `data.gameSession.id!` non-null assertion on potentially undefined. **Fix:** Validate before use.
- [ ] **#43** `getQuizController.ts:92` -- Random hex color can produce fewer than 6 digits. **Fix:** Use `.padStart(6, '0')`.
- [ ] **#44** `getLiveQuizDataController.ts:264-275` -- `get_question` filters by `hostId` but receives current userId (could be participant). **Fix:** Pass actual host ID.
- [ ] **#45** `getSelectedQuestionDetails.ts:68-78` -- Unasked question algorithm assumes contiguous orderIndex values. **Fix:** Iterate by array index.
- [ ] **#46** `getParticipantsOnCall.ts:31` -- `take: limit + 1` leaks extra record to client. **Fix:** Slice result to `limit`.
- [ ] **#47** `getSpectatorOnCall.ts:33` -- `take: limit + 1` leaks extra record to client. **Fix:** Slice result to `limit`.
- [ ] **#48** `spectatorJoinQuizViaURLController.ts:33-41` -- URL join skips `allowNewSpectator` check. **Fix:** Add the check.
- [ ] **#49** `getLiveQuizSummarizedData.ts:49` -- `q.question.substring()` crashes on null, bad truncation on short strings. **Fix:** Add null check + conditional truncation.
- [ ] **#50** `verifySessionController.ts:97` -- Date comparison may fail if `expiresAt` is a string. **Fix:** Wrap in `new Date()`.
- [ ] **#51** `readReviewController.ts:9-11` -- `parseInt` returns NaN on invalid strings, Prisma rejects `skip: NaN`. **Fix:** Use `|| 1` fallback.
- [ ] **#52** `dodoWebhookController.ts:14` -- `webhook-id` header cast to string but can be undefined. **Fix:** Add existence check.
- [ ] **#53** `upsertQuizController.ts:8` -- No ownership check before schema parse (minor resource waste). **Fix:** Move ownership check earlier.

### Debug Logs in Production

- [ ] **#54** `getUnAskedQuestionController.ts:15-16,25,36,61,100,125,157` -- Excessive `console.log` leaking quiz data. **Fix:** Remove or gate behind dev mode.
- [ ] **#55** `generateNewQuizController.ts:16` -- `console.log` leaking parsed AI data. **Fix:** Remove or gate behind dev mode.

### Missing Pagination

- [ ] **#56** `getReviewController.ts:13` -- Fetches ALL reviews with no limit. **Fix:** Add `take` and pagination.
- [ ] **#57** `delete_selected_quizzes_controller.ts:12-16` -- No validation that `quizIds` elements are strings. **Fix:** Add type check.
- [ ] **#58** `upsertQuizController.ts:47` -- Generic "system error" returned for unauthorized users. **Fix:** Return 403 for non-host.

---

## LOW (25)

### Typos

- [ ] **#59** `toggle_favourite_quiz_controller.ts:44` -- `'faviorutes'` → `'favourites'`
- [ ] **#60** `spectatorJoinController.ts:44` -- `'spectaors'` → `'spectators'`
- [ ] **#61** `delete_selected_quizzes_controller.ts:34,58` -- `'deletatbleQuizzes'` → `'deletableQuizzes'`, `'seleced'` → `'selected'`
- [ ] **#62** `generateNewQuizController.ts:110` -- `'felt into'` → `'fell into'`
- [ ] **#63** `getAllTemplatesController.ts:34` -- `'fetchinf'` → `'fetching'`
- [ ] **#64** `getReviewController.ts:34` -- Returns 201 for GET request. **Fix:** Use 200.

### Missing Auth Checks

- [ ] **#65** `getParticipantsOnCall.ts:5-6` -- No auth check, participant data exposed. **Fix:** Add auth.
- [ ] **#66** `getSpectatorOnCall.ts:5-6` -- No auth check, spectator data exposed. **Fix:** Add auth.
- [ ] **#67** `getTiersController.ts:5-39` -- No auth check (may be intentional for pricing page). **Fix:** Verify intent.

### Dead Code / Unnecessary Logic

- [ ] **#68** `get_favourite_quizzes_controller.ts:45` -- `if (!quizzes)` is dead code (`findMany` always returns array). **Fix:** Check `.length === 0`.
- [ ] **#69** `publishQuizController.ts:67-73` -- try/catch wraps only `ResponseWriter.success()` which never throws. **Fix:** Move real logic into try/catch.
- [ ] **#70** `getUnAskedQuestionController.ts:58-159` -- Read-only queries wrapped in `$transaction` unnecessarily. **Fix:** Remove transaction wrapper.

### Minor UX / Safety

- [ ] **#71** `signInController.ts:74` -- OTP TTL only 60s, no rate limiting. **Fix:** Increase to 300s, add rate limit.
- [ ] **#72** `getQuizController.ts:91` -- `req.user.name` accessed without null check. **Fix:** Add fallback `|| 'Unknown'`.
- [ ] **#73** `quizController.ts:297` -- `data.quiz.id!` non-null assertion on `Partial<Quiz>`. **Fix:** Validate before use.
- [ ] **#74** `createQuizController.ts:21` -- `...quizData` spread may pass unexpected fields to Prisma. **Fix:** Explicitly pick fields.
- [ ] **#75** `getLiveQuizDataController.ts:239` -- `responseData` typed as `any`. **Fix:** Define proper interface.
- [ ] **#76** `get_trashed_quizzes_controller.ts:43-63` -- Expired trash items (daysLeft=0) never purged. **Fix:** Filter out or add cron job.
- [ ] **#77** `createCheckoutController.ts:58-65` -- Returns `success: true` with `checkoutUrl: null` for existing subscription. **Fix:** Use 409 Conflict.
- [ ] **#78** `getChatsController.ts:11-13` -- Participants blocked from chat history (may be intentional). **Fix:** Verify intent.
- [ ] **#79** `startCollaborationController.ts:96` -- `console.error('use this: ')` is debug leftover. **Fix:** Remove.
- [ ] **#80** `join_collaborator_controller.ts` -- File misleadingly named "join" but contains invitation logic. **Fix:** Rename file.
- [ ] **#81** `getAllQuizController.ts:13` -- No pagination, fetches all quizzes. **Fix:** Add `skip`/`take`/`orderBy`.
- [ ] **#82** `get_recently_viewed_controller.ts:54` -- Hardcoded `take: 50`, no pagination. **Fix:** Accept query params.
- [ ] **#83** `upsertQuizController.ts:47` -- Redundant condition checks (`!data.success` and `data.error`). **Fix:** Simplify condition.

---

## Files with Zero Bugs

- `restore_trashed_quiz_controller.ts`
- `get_shared_quiz_controller.ts`
