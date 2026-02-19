# Server Controllers -- Deep Bug Report

**Date:** 2026-02-19
**Scope:** All controller files under `apps/server/src/controllers/`
**Branch:** `dev`

---

## Severity Summary

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 7      |
| HIGH      | 21     |
| MEDIUM    | 30     |
| LOW       | 25     |
| **TOTAL** | **83** |

---

## Top 5 Critical / Must-Fix Bugs

| #   | File                                    | Line   | Summary                                                                                |
| --- | --------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| 1   | `spectatorJoinController.ts`            | 81     | Uses `prisma` instead of `tx` inside transaction -- creates orphan records on rollback |
| 2   | `permanently_delete_quiz_controller.ts` | 49     | Missing `await` on permanent delete -- response sent before deletion completes         |
| 3   | `permanently_delete_quiz_controller.ts` | 20-31  | No `hostId` filter -- any user can delete any trashed quiz (authorization bypass)      |
| 4   | `startCollaborationController.ts`       | 72-107 | Never sends HTTP response -- request hangs forever                                     |
| 5   | `createQuizUsingAIController.ts`        | 19-27  | AI logic commented out, never sends response -- request hangs forever                  |

Additionally critical:

| #   | File                       | Line  | Summary                                                                              |
| --- | -------------------------- | ----- | ------------------------------------------------------------------------------------ |
| 6   | `getParticipantsOnCall.ts` | 30    | `skip: page + limit` instead of `skip: page * limit` -- pagination completely broken |
| 7   | `getQuestionResults.ts`    | 73-78 | Double response sent in catch block -- causes Express `ERR_HTTP_HEADERS_SENT` crash  |

---

## All Bugs by File

---

### signInController.ts

**Path:** `apps/server/src/controllers/user-controller/signInController.ts`
**Bugs found:** 5

#### Bug 1 -- `CRITICAL` -- Line 11

No validation on `req.body.user`. If `req.body.user` is `undefined` or `null`, accessing `user.email` on line 14 will throw an unhandled TypeError that crashes the request.

```typescript
// Line 11
const { user } = req.body;
// ...
// Line 14 -- throws if user is undefined
const existingUser = await prisma.user.findUnique({
  where: { email: user.email },
});
```

**Impact:** Unhandled crash on malformed request body.

**Fix:** Add early validation:

```typescript
if (!user || !user.email) {
  ResponseWriter.invalid_data(res, "User data is required");
  return;
}
```

---

#### Bug 2 -- `HIGH` -- Lines 44-47, 128-131

JWT is signed with no `expiresIn` option. The token never expires, meaning a stolen token grants permanent access.

```typescript
// Line 44-47
const token = jwt.sign(
  {
    name: myUser.name,
    email: myUser.email,
    id: myUser.id,
    image: myUser.image,
  },
  secret,
);
```

```typescript
// Line 128-131 (same issue in verify_otp)
const token = jwt.sign(
  {
    name: myUser.name,
    email: myUser.email,
    id: myUser.id,
    image: myUser.image,
  },
  secret,
);
```

**Impact:** Stolen tokens grant permanent access with no expiration.

**Fix:** Add `{ expiresIn: '7d' }` (or appropriate TTL) as the third argument to `jwt.sign()`.

---

#### Bug 3 -- `MEDIUM` -- Lines 20-27

On OAuth sign-in, an existing user's `name` and `image` are unconditionally overwritten with whatever the OAuth provider sends. If the user customized their profile in-app, OAuth re-login will clobber those changes.

```typescript
// Lines 20-27
myUser = await prisma.user.update({
  where: { email: user.email },
  data: {
    name: user.name,
    email: user.email,
    image: user.image,
  },
});
```

**Impact:** User profile customizations are silently overwritten on every OAuth login.

**Fix:** Only update fields that the user has not manually changed, or skip updates entirely for existing users.

---

#### Bug 4 -- `MEDIUM` -- Line 73

`Math.random()` is not cryptographically secure for OTP generation. An attacker who can predict the PRNG state can guess OTPs.

```typescript
// Line 73
const otp = Math.floor(100000 + Math.random() * 900000).toString();
```

**Impact:** Predictable OTPs could be exploited.

**Fix:** Use `crypto.randomInt(100000, 999999)` from Node's `crypto` module.

---

#### Bug 5 -- `LOW` -- Line 74

OTP TTL is only 60 seconds. This is extremely short and may frustrate users on slow email delivery. Also, there is no rate limiting on the `send_otp` endpoint, enabling OTP flooding/abuse.

```typescript
// Line 74
await publisherInstance.set(`otp:${email}`, otp, "EX", 60);
```

**Impact:** Poor UX and potential abuse vector.

**Fix:** Consider 300 seconds (5 minutes) and add rate limiting.

---

### upsertLearningJourneyController.ts

**Path:** `apps/server/src/controllers/user-controller/upsertLearningJourneyController.ts`
**Bugs found:** 2

#### Bug 6 -- `MEDIUM` -- Line 19

When `learningJourneyStep` is invalid, the response uses `ResponseWriter.not_found()`. A 404 "not found" is semantically incorrect for a validation error.

```typescript
// Line 19
ResponseWriter.not_found(res, "Invalid learningJourneyStep");
```

**Impact:** Misleading HTTP status code sent to clients.

**Fix:** Use `ResponseWriter.invalid_data(res, 'Invalid learningJourneyStep')`.

---

#### Bug 7 -- `MEDIUM` -- Line 23

When `learningJourneyStep` values are out of range (0-5), the response uses `ResponseWriter.success()`, returning a success status code (200) with a string error message. This is misleading -- a validation failure should return an error.

```typescript
// Line 23
ResponseWriter.success(res, "learningJourneyStep must be between 0 and 5");
```

**Impact:** Client receives a 200 success for a validation failure.

**Fix:** Use `ResponseWriter.invalid_data(res, 'learningJourneyStep must be between 0 and 5')`.

---

### createQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/createQuizController.ts`
**Bugs found:** 1

#### Bug 8 -- `LOW` -- Line 21

`id` and `templateId` are destructured and discarded, but `...quizData` is spread into the create call. If the Zod schema allows additional unexpected fields, they could be passed to Prisma.

```typescript
// Line 21
const {
  id: _ignoredId,
  templateId: _ignoredTemplateId,
  questions,
  ...quizData
} = data;
```

**Impact:** Unexpected fields could be passed to Prisma, causing errors or unintended data writes.

**Fix:** Explicitly pick only the fields you want to pass to Prisma rather than spreading the remainder.

---

### upsertQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/upsertQuizController.ts`
**Bugs found:** 3

#### Bug 9 -- `HIGH` -- Lines 15-16, 18-21, 36

Multiple `console.log` statements dumping the entire request body and parsed data to stdout. This leaks potentially sensitive quiz data in production logs.

```typescript
// Line 15
console.log(
  "DATA FROM FRONTEND IS ---------------------------------> ",
  req.body,
);

// Lines 18-21
console.log(
  "PARSED DATA IS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>",
  parsed,
);

// Line 36
console.log("data from FRONTEND IS: ", parsed.data);
```

**Impact:** Sensitive data leaked to production logs.

**Fix:** Remove or gate behind `NODE_ENV === 'development'`.

---

#### Bug 10 -- `MEDIUM` -- Line 8

`quizId` is taken from `req.params` but there is no ownership check before the schema parse. The ownership check only happens inside `quizControllerInstance.update_quiz_status`, meaning all the parsing work is done before confirming the user owns the quiz.

```typescript
// Line 8
const { quizId } = req.params;
```

**Impact:** Minor waste of resources parsing data for unauthorized requests. Not a security issue since ownership is still checked eventually.

**Fix:** Move ownership check earlier, or accept the current flow.

---

#### Bug 11 -- `LOW` -- Line 47

The condition `!data || !data.success || data.error || !data.quiz` checks both `!data.success` and `data.error` redundantly. If `data.success` is `false` but `isHost` is `false`, the client gets a generic "system error" instead of a meaningful "not authorized" message.

```typescript
// Line 47
if (!data || !data.success || data.error || !data.quiz) {
  console.error("[CREATE_QUIZ_ERROR] ", data?.error);
  ResponseWriter.system_error(res);
  return;
}
```

**Impact:** Misleading error message for unauthorized users.

**Fix:** Check `data.isHost === false` separately and return a 403.

---

### getQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/getQuizController.ts`
**Bugs found:** 4

#### Bug 12 -- `HIGH` -- Line 93

`collabSessionId!` uses the non-null assertion operator, but `collabSessionId` can be `undefined` (line 84-85 shows it is set to `undefined` when there is no CollabSession). Passing `undefined` as `collabSessionId` to `generateCollabSessionToken` could generate a token with an undefined session ID.

```typescript
// Lines 84-85
const collabSessionId =
  hasCollabSession && quiz.CollabSession ? quiz.CollabSession.id : undefined;

// Line 87-94
const secureTokenData = QuizAction.generateCollabSessionToken(
  userId,
  quiz.id,
  userCollabRole,
  req.user.name,
  "#" + Math.floor(Math.random() * 16777215).toString(16),
  collabSessionId!, // <-- non-null assertion on potentially undefined
);
```

**Impact:** Token generated with `undefined` session ID, leading to broken collaboration features.

**Fix:** Handle the case where `collabSessionId` is undefined -- either skip token generation or pass a sentinel value.

---

#### Bug 13 -- `MEDIUM` -- Line 58

When a quiz does not exist, the response uses status code 203 with `success: true`. This is misleading; a non-existent quiz should return 404.

```typescript
// Line 58
ResponseWriter.custom(res, true, "", "Quiz does not exist", 203, {
  type: QuizResponseType.QUIZ_NOT_EXIST,
});
```

**Impact:** Clients receive a success-like status for a missing resource.

**Fix:** Use `ResponseWriter.not_found(res, 'Quiz does not exist')`.

---

#### Bug 14 -- `MEDIUM` -- Line 92

The random color generation can produce colors with fewer than 6 hex digits (e.g., `#fff` instead of `#00ffff`), producing invalid hex color codes.

```typescript
// Line 92
"#" + Math.floor(Math.random() * 16777215).toString(16);
```

**Impact:** Invalid hex color codes break frontend rendering.

**Fix:** Use `.toString(16).padStart(6, '0')`.

---

#### Bug 15 -- `LOW` -- Line 91

`req.user.name` is accessed without null-check. If `req.user` exists but `name` is null/undefined, this passes `undefined` to the token generator.

```typescript
// Line 91
req.user.name,
```

**Impact:** Token may contain undefined user name.

**Fix:** Add a fallback like `req.user.name || 'Unknown'`.

---

### getAllQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/getAllQuizController.ts`
**Bugs found:** 1

#### Bug 16 -- `LOW` -- Line 13

No pagination support. `findMany` returns ALL quizzes for a user. For power users with hundreds of quizzes this will be slow and memory-intensive.

```typescript
// Line 13
const quizzes = await prisma.quiz.findMany({
    where: {
        hostId: String(req.user.id),
        isDeleted: false,
    },
    // ... no skip, take, or orderBy
```

**Impact:** Performance degradation for users with many quizzes.

**Fix:** Add `skip`, `take`, and `orderBy` parameters with pagination support.

---

### publishQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/publishQuizController.ts`
**Bugs found:** 3

#### Bug 17 -- `HIGH` -- Line 30

The call to `quizControllerInstance.update_quiz_status` is not wrapped in a try/catch. If it throws an exception, the entire process crashes with an unhandled promise rejection. The try/catch on line 67 only wraps the `ResponseWriter.success` call, which can never throw.

```typescript
// Line 30 -- NOT in a try/catch
const data = await quizControllerInstance.update_quiz_status(
  QUIZ_STATUS.PUBLISH_QUIZ,
  quizId,
  input,
  questions,
  userId,
);

// ...

// Lines 67-73 -- useless try/catch
try {
  ResponseWriter.success(res, quiz, "Quiz published successfully", 200);
  return;
} catch (err) {
  console.error("Error publishing quiz:", err);
  ResponseWriter.system_error(res);
}
```

**Impact:** Unhandled exception crashes the server process.

**Fix:** Move the `update_quiz_status` call inside the try/catch block.

---

#### Bug 18 -- `MEDIUM` -- Lines 45-60

The logic checks `prev_status` and `quiz.status` after the quiz has already been updated/published by `update_quiz_status`. The status checks for "already published" and "already live" come too late -- the quiz status was already changed.

```typescript
// Lines 44-65 -- checks happen AFTER update
const quiz = data.quiz;
let prev_status;

if (data.type === QUIZ_STATUS.PUBLISH_QUIZ) {
    prev_status = data.status;
}

if (prev_status === 'PUBLISHED') {
    ResponseWriter.custom(res, false, 'QUIZ_ALREADY_PUBLISHED', ...);
    return;
}

if (quiz.status === 'LIVE') {
    ResponseWriter.custom(res, false, 'QUIZ_ALREADY_LIVE', ...);
    return;
}
```

**Impact:** Dead code / logic error. Status was already changed by `update_quiz_status`.

**Fix:** Either remove the redundant post-hoc checks or rely solely on them by moving them before the update call.

---

#### Bug 19 -- `LOW` -- Lines 67-73

The try/catch wraps only `ResponseWriter.success(res, quiz, ...)` which will never throw an error. This is useless error handling.

```typescript
// Lines 67-73
try {
  ResponseWriter.success(res, quiz, "Quiz published successfully", 200);
  return;
} catch (err) {
  console.error("Error publishing quiz:", err);
  ResponseWriter.system_error(res);
}
```

**Impact:** False sense of error handling; actual errors are not caught.

**Fix:** Move the actual logic into the try/catch.

---

### launchQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/launchQuizController.ts`
**Bugs found:** 2

#### Bug 20 -- `HIGH` -- Lines 58-63

The check `if (prev_status === 'LIVE')` happens after the quiz has already been launched (status changed to LIVE, game session created). By this point, the quiz is live but the controller returns an error. This means the quiz is stuck in LIVE state with no valid response to the client.

```typescript
// Lines 58-63
const prev_status = data.status;

if (prev_status === "LIVE") {
  ResponseWriter.error(
    res,
    "QUIZ_ALREADY_LIVE",
    "quiz is already live",
    undefined,
    400,
  );
  return;
}
```

**Impact:** Quiz stuck in LIVE state with error returned to client.

**Fix:** This check should happen before `update_quiz_status` is called, or the internal implementation should prevent double-launching.

---

#### Bug 21 -- `MEDIUM` -- Line 68

`data.gameSession.id!` uses non-null assertion. If `gameSession.id` is somehow `undefined`, this would generate a broken token.

```typescript
// Line 68
data.gameSession.id!,
```

**Impact:** Potentially broken token passed to the client.

**Fix:** Validate `data.gameSession.id` exists before using it.

---

### deleteQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/deleteQuizController.ts`
**Bugs found:** 1

#### Bug 22 -- `MEDIUM` -- Line 39

When the quiz is LIVE, the response uses `ResponseWriter.success()` with status 200, meaning the client receives a "success" response even though the deletion was rejected.

```typescript
// Line 38-40
if (quiz.status === QuizStatus.LIVE) {
  ResponseWriter.success(res, quiz.id, "CANNOT_DELETE_ONGOING_QUIZ", 200);
  return;
}
```

**Impact:** Client cannot distinguish between successful deletion and rejection.

**Fix:** Use `ResponseWriter.error(res, 'CANNOT_DELETE_ONGOING_QUIZ', 'Cannot delete a quiz that is currently live', undefined, 409)`.

---

### permanently_delete_quiz_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/permanently_delete_quiz_controller.ts`
**Bugs found:** 2

#### Bug 23 -- `CRITICAL` -- Line 49

`QuizAction.permanentDeleteQuiz(quizId, String(userId))` is called without `await`. This is a fire-and-forget call. The response "Quiz deleted successfully" is sent immediately before the deletion completes. If the deletion fails, the user is never notified.

```typescript
// Line 49-50
QuizAction.permanentDeleteQuiz(quizId, String(userId));
ResponseWriter.success(res, quiz, "Quiz deleted successfully");
```

**Impact:** Quiz may remain in database after user is told it was deleted. Silent failures.

**Fix:** Add `await` before `QuizAction.permanentDeleteQuiz(...)`.

---

#### Bug 24 -- `HIGH` -- Lines 20-31

The query filters by `isDeleted: true` but does NOT filter by `hostId`. This means any authenticated user can permanently delete any other user's trashed quiz if they know or guess the quiz ID. This is an authorization bypass.

```typescript
// Lines 20-31
const quiz = await prisma.quiz.findUnique({
  where: {
    id: quizId,
    isDeleted: true,
    // MISSING: hostId: String(userId)
  },
  select: {
    id: true,
    status: true,
    title: true,
    description: true,
  },
});
```

**Impact:** Any authenticated user can permanently delete any trashed quiz. Authorization bypass.

**Fix:** Add `hostId: String(userId)` to the `where` clause.

---

### delete_selected_quizzes_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/delete_selected_quizzes_controller.ts`
**Bugs found:** 2

#### Bug 25 -- `MEDIUM` -- Lines 12-16

No validation that `quizIds` elements are strings. If the client sends an array of numbers or objects, Prisma may throw an unexpected error.

```typescript
// Lines 12-16
const { quizIds } = req.body;

if (!Array.isArray(quizIds) || quizIds.length === 0) {
  ResponseWriter.invalid_data(res);
  return;
}
```

**Impact:** Unexpected Prisma errors on malformed input.

**Fix:** Add `quizIds.every(id => typeof id === 'string')` check.

---

#### Bug 26 -- `LOW` -- Lines 34, 58

Typos: `deletatbleQuizzes` should be `deletableQuizzes`. Log message: `"delete seleced quizzes"` should be `"delete selected quizzes"`.

```typescript
// Line 34
const deletatbleQuizzes = quizzes.filter(

// Line 58
console.error('Failed to delete seleced quizzes: ', err);
```

**Impact:** Code readability and log clarity.

**Fix:** Correct spellings.

---

### delete_trashed_quizzes_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/delete_trashed_quizzes_controller.ts`
**Bugs found:** 1

#### Bug 27 -- `HIGH` -- Line 12

`prisma.quiz.deleteMany` permanently deletes all trashed quizzes at once with no confirmation step and no check for LIVE status. If a quiz was trashed while LIVE (race condition), it would be permanently deleted. Also, `deleteMany` may fail on foreign key constraints for related records not configured with cascade delete.

```typescript
// Lines 12-17
const trashedQuizzes = await prisma.quiz.deleteMany({
  where: {
    hostId: String(req.user.id),
    isDeleted: true,
  },
});
```

**Impact:** Potential data loss from race condition; foreign key constraint failures.

**Fix:** Add a `status: { not: 'LIVE' }` filter, and ensure cascading deletes are properly configured or manually delete related records first.

---

### get_trashed_quizzes_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/get_trashed_quizzes_controller.ts`
**Bugs found:** 1

#### Bug 28 -- `LOW` -- Lines 43-63

Quizzes that have `daysLeft === 0` (past the 30-day window) are still returned in the list instead of being auto-deleted. The front-end sees items with `daysLeftUntilPermanentDeletion: 0` but they are never actually purged.

```typescript
// Lines 54-56
const remaining = MAX_TRASH_DAYS - diffDays;
daysLeft = Math.max(0, Math.ceil(remaining));
```

**Impact:** Expired trash items linger in the database and appear in the UI.

**Fix:** Either filter them out from the response, or add a background cron job that actually deletes quizzes past the 30-day window.

---

### get_favourite_quizzes_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/get_favourite_quizzes_controller.ts`
**Bugs found:** 2

#### Bug 29 -- `MEDIUM` -- Line 12

The query does not filter by `isDeleted: false`. This means trashed quizzes that are marked as favourite will appear in the favourite list.

```typescript
// Lines 12-16
const quizzes = await prisma.quiz.findMany({
    where: {
        hostId: req.user.id,
        isFavourite: true,
        // MISSING: isDeleted: false
    },
```

**Impact:** Trashed quizzes appear in favourites.

**Fix:** Add `isDeleted: false` to the `where` clause.

---

#### Bug 30 -- `LOW` -- Line 45

`if (!quizzes)` is a dead check. `findMany` always returns an array (possibly empty), never `null` or `undefined`. The condition will never be true.

```typescript
// Line 45
if (!quizzes) {
  ResponseWriter.not_found(res);
  return;
}
```

**Impact:** Dead code that never executes.

**Fix:** Check `quizzes.length === 0` if you want to handle the empty case.

---

### toggle_favourite_quiz_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/toggle_favourite_quiz_controller.ts`
**Bugs found:** 1

#### Bug 31 -- `LOW` -- Line 44

Typo: `'Removed quiz from faviorutes'` should be `'Removed quiz from favourites'`.

```typescript
// Line 44
data.isFavourite ? 'Added quiz to favourite' : 'Removed quiz from faviorutes',
```

**Impact:** Misspelled user-facing message.

**Fix:** Correct the spelling to `'Removed quiz from favourites'`.

---

### renameQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/renameQuizController.ts`
**Bugs found:** 1

#### Bug 32 -- `HIGH` -- Lines 19-29

`prisma.quiz.findMany` is used instead of `prisma.quiz.findUnique`. `findMany` returns an array, which is always truthy even when empty (`[]`). The `if (!quiz)` check on line 26 will never be true. This means if the quiz does not exist or the user is not the owner, the code falls through to `prisma.quiz.update` on line 31, which will throw a Prisma error, returning a generic 500 instead of a proper 404.

```typescript
// Lines 19-29
const quiz = await prisma.quiz.findMany({
  where: {
    id: data.quizId,
    hostId: req.user.id,
  },
});

if (!quiz) {
  // <-- always truthy (empty array is truthy)
  ResponseWriter.not_found(res);
  return;
}
```

**Impact:** Incorrect 500 error instead of proper 404 for non-existent quizzes.

**Fix:** Use `prisma.quiz.findUnique` instead of `findMany`, or check `quiz.length === 0`.

---

### duplicateQuizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/duplicateQuizController.ts`
**Bugs found:** 2

#### Bug 33 -- `HIGH` -- Line 6

`req.user.id` is accessed without optional chaining (`req.user?.id`). If `req.user` is `undefined`, this will throw a TypeError crash, and the `not_authorized` response is never sent.

```typescript
// Line 6
if (!req.user.id) {
  // <-- crashes if req.user is undefined
  ResponseWriter.not_authorized(res);
  return;
}
```

**Impact:** Server crash on unauthenticated requests.

**Fix:** Use `req.user?.id`.

---

#### Bug 34 -- `MEDIUM` -- Lines 34-77

The duplicated quiz copies `isFavourite: quiz.isFavourite`. A duplicate should probably start as non-favourite. Also, the duplicate does not include `templateId` -- the duplicated quiz loses its template association.

```typescript
// Line 45
isFavourite: quiz.isFavourite,  // <-- should be false for a duplicate
// templateId is missing from the create data
```

**Impact:** Misleading favourite state and missing template on duplicated quizzes.

**Fix:** Set `isFavourite: false` and add `templateId: quiz.templateId` to the create data.

---

### getQuestionsController.ts

**Path:** `apps/server/src/controllers/quiz-controller/getQuestionsController.ts`
**Bugs found:** 1

#### Bug 35 -- `MEDIUM` -- Lines 26-34

The collaborator check uses `some: { id: user.id }` which checks the collaborator's own primary key ID, not the `userId` field. This means it checks if the collaborator record's primary key matches the user's ID, which is wrong.

```typescript
// Lines 26-33
CollabSession: {
    collaborators: {
        some: {
            id: user.id,  // <-- should be userId: user.id
        },
    },
},
```

**Impact:** Collaborator access check always fails, blocking legitimate collaborators from viewing questions.

**Fix:** Change `id: user.id` to `userId: user.id`.

---

### get_recently_viewed_controller.ts

**Path:** `apps/server/src/controllers/quiz-controller/get_recently_viewed_controller.ts`
**Bugs found:** 1

#### Bug 36 -- `LOW` -- Line 54

Hardcoded `take: 50` limit with no pagination support. For users who view many quizzes, this is always a fixed window.

```typescript
// Line 54
take: 50,
```

**Impact:** No pagination flexibility for recently viewed quizzes.

**Fix:** Accept `limit` and `page` query parameters for flexible pagination.

---

### quizController.ts

**Path:** `apps/server/src/controllers/quiz-controller/quizController.ts`
**Bugs found:** 3

#### Bug 37 -- `HIGH` -- Lines 110-116

`handle_update_quiz` does NOT validate ownership. The comment on line 116 says "check for the valid owner, before calling this function" but if called directly via `update_quiz_status` with `QUIZ_STATUS.UPDATE_QUIZ`, there is no ownership check at all.

```typescript
// Lines 110-116
private async handle_update_quiz(
    quizId: string,
    quiz_data: CreateQuizType,
    questions: QuestionType[],
): Promise<quiz_controller> {
    try {
        // check for the valid owner, before calling this function
        const quiz = await prisma.$transaction(async (tx) => {
```

**Impact:** Any authenticated user could update any quiz if the route directly triggers `UPDATE_QUIZ`.

**Fix:** Add ownership validation inside `handle_update_quiz`, or ensure the calling route always validates ownership.

---

#### Bug 38 -- `MEDIUM` -- Lines 117-122

The update strategy deletes ALL existing questions and re-creates them. This is destructive -- it removes all question-related data such as responses, results, and analytics tied to question IDs.

```typescript
// Lines 117-122
const quiz = await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany({
        where: {
            quizId,
        },
    });
    // ... then re-creates questions
```

**Impact:** Historical response data referencing those question IDs will have dangling foreign keys or be cascade-deleted.

**Fix:** Use an upsert strategy that preserves existing question IDs where possible.

---

#### Bug 39 -- `LOW` -- Line 297

`data.quiz.id!` uses non-null assertion. If `data.quiz` is set but `data.quiz.id` is undefined (since `quiz` is `Partial<Quiz>`), this could pass `undefined` to `launch_quiz_tx`.

```typescript
// Line 297
launching_quiz = await this.launch_quiz_tx(data.quiz.id!);
```

**Impact:** Potential runtime error from undefined ID.

**Fix:** Validate `data.quiz.id` before using it.

---

### getLiveQuizDataController.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getLiveQuizDataController.ts`
**Bugs found:** 3

#### Bug 40 -- `HIGH` -- Line 115

`gameSession?.currentQuestionId!` uses non-null assertion on an optional chain. If `gameSession` is null, optional chaining returns `undefined`, but the `!` tells TypeScript to ignore it. This passes `undefined` to `get_question`, causing it to return a random unasked question instead of the actual current question.

```typescript
// Line 115
question = await get_question(userId, quizId, gameSession?.currentQuestionId!);
```

**Impact:** Wrong question returned to users in an active game.

**Fix:** Handle the `null` gameSession case explicitly before accessing `currentQuestionId`.

---

#### Bug 41 -- `MEDIUM` -- Lines 264-275

The `get_question` function, when no `question_id` is provided, filters by `hostId: host_id`. But the `host_id` parameter passed from the controller (line 111) is actually `userId` from the cookie, which could be a participant or spectator -- not the host. For non-host users in LOBBY phase, this query would return null.

```typescript
// Lines 270-274
const quiz = await prisma.quiz.findUnique({
    where: {
        id: quiz_id,
        hostId: host_id,  // <-- host_id is actually the current user's ID
    },
```

**Impact:** Non-host users in LOBBY phase get no question data.

**Fix:** Pass the actual quiz host ID, or remove the `hostId` filter from this query.

---

#### Bug 42 -- `LOW` -- Line 239

`responseData` is typed as `any`, bypassing all TypeScript type safety.

```typescript
// Line 239
const responseData: any = {
```

**Impact:** No compile-time type checking on response structure.

**Fix:** Define a proper interface for the response data.

---

### getLiveQuizSummarizedData.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getLiveQuizSummarizedData.ts`
**Bugs found:** 1

#### Bug 43 -- `MEDIUM` -- Line 49

`q.question.substring(0, 10) + '...'` will throw if `q.question` is `null` or `undefined`. Also, if the question is shorter than 10 characters, it still appends `'...'`, which looks wrong.

```typescript
// Line 49
title: q.question.substring(0, 10) + '...',
```

**Impact:** Runtime crash on null question text; ugly truncation on short questions.

**Fix:** Add null check and conditional truncation:

```typescript
(q.question?.length > 10 ? q.question.substring(0, 10) + "..." : q.question) ||
  "";
```

---

### getParticipantsOnCall.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getParticipantsOnCall.ts`
**Bugs found:** 3

#### Bug 44 -- `CRITICAL` -- Line 30

`skip: page + limit` is wrong. This adds `page` (0-indexed) to `limit` (18), so for page 0 it skips 18 records (should skip 0), for page 1 it skips 19 (should skip 18). Page 0 always returns data starting from offset 18, skipping the first 18 participants entirely.

```typescript
// Line 30
skip: page + limit,  // <-- should be page * limit
```

**Impact:** Pagination is completely broken. First page of participants is never shown.

**Fix:** Change `page + limit` to `page * limit`.

---

#### Bug 45 -- `MEDIUM` -- Line 31

`take: limit + 1` fetches 19 records but all 19 are returned to the client. The `+1` pattern is typically used to detect "has more" pages, but the extra record should be removed from the response.

```typescript
// Line 31
take: limit + 1,  // fetches 19 but returns all to client
```

**Impact:** Extra participant record leaked to the client.

**Fix:** Slice the result to `limit` entries: `participants.slice(0, limit)`.

---

#### Bug 46 -- `LOW` -- Lines 5-6

No authentication check. Any unauthenticated request with a valid `quizId` can enumerate all participants.

```typescript
// Lines 5-6
export default async function getParticipantsOnCall(req: Request, res: Response) {
    const { quizId } = req.params;
    // No req.user check
```

**Impact:** Participant data exposed to unauthenticated users.

**Fix:** Add user authentication/authorization check.

---

### getQuestionResults.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getQuestionResults.ts`
**Bugs found:** 3

#### Bug 47 -- `CRITICAL` -- Lines 73-78

In the catch block, `res.status(500).json(...)` is called on line 73, and then `ResponseWriter.system_error(res)` is called on line 78. This sends two responses to the same request, which will cause an Express `ERR_HTTP_HEADERS_SENT` error and crash the handler.

```typescript
// Lines 71-80
} catch (error) {
    console.error('Failed to fetch question results: ', error);
    res.status(500).json({
        success: false,
        message: 'failed to fetch question results',
        value: 'INTERNAL_SERVER_ERROR',
    });
    ResponseWriter.system_error(res);  // <-- second response!
    return;
}
```

**Impact:** Express crash from double response.

**Fix:** Remove either line 73-77 or line 78.

---

#### Bug 48 -- `HIGH` -- Lines 5-80

No authentication or authorization check. Any unauthenticated user can fetch question results for any quiz/question by providing IDs in the request body.

```typescript
// Lines 5-7
export default async function getQuestionResults(req: Request, res: Response) {
    try {
        const { quizId, questionId } = req.body;
        // No req.user check
```

**Impact:** Question results and participant scores exposed to unauthenticated users.

**Fix:** Add `req.user` check and verify the user is the host of the quiz.

---

#### Bug 49 -- `MEDIUM` -- Line 7

`quizId` and `questionId` are taken from `req.body`. For a GET-like data retrieval operation, these should come from `req.params` or `req.query`. Using `req.body` means this must be a POST endpoint for fetching data, which violates REST conventions.

```typescript
// Line 7
const { quizId, questionId } = req.body;
```

**Impact:** Violates REST conventions; data retrieval via POST body.

**Fix:** Use `req.params` or `req.query` for data retrieval endpoints.

---

### getSelectedQuestionDetails.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getSelectedQuestionDetails.ts`
**Bugs found:** 1

#### Bug 50 -- `MEDIUM` -- Lines 68-78

The algorithm to find an unasked question uses `currentIndex = targetOrderIndex % quiz.questions.length` and increments by 1. However, `quiz.questions.find((q) => q.orderIndex === currentIndex)` assumes `orderIndex` values are contiguous 0-based integers (0, 1, 2, ...). If `orderIndex` values are non-contiguous (e.g., 0, 2, 5), the `find` will return `undefined`, and the while loop exits immediately.

```typescript
// Lines 68-78
let currentIndex = targetOrderIndex % quiz.questions.length;
let attempts = 0;
const maxAttempts = quiz.questions.length;

let currentQuestion = quiz.questions.find((q) => q.orderIndex === currentIndex);

while (currentQuestion && currentQuestion.isAsked && attempts < maxAttempts) {
  currentIndex = (currentIndex + 1) % quiz.questions.length;
  currentQuestion = quiz.questions.find((q) => q.orderIndex === currentIndex);
  attempts++;
}
```

**Impact:** "No available question" returned even if unasked questions exist with non-contiguous orderIndex values.

**Fix:** Iterate over the actual sorted questions array by array index rather than by `orderIndex` value.

---

### getSpectatorOnCall.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getSpectatorOnCall.ts`
**Bugs found:** 2

#### Bug 51 -- `MEDIUM` -- Line 33

`take: limit + 1` fetches 19 spectators but returns all 19 to the client. The extra record is meant to detect "has more" but it leaks into the response.

```typescript
// Line 33
take: limit + 1,
```

**Impact:** Extra spectator record leaked to the client.

**Fix:** Return `spectators.slice(0, limit)`.

---

#### Bug 52 -- `LOW` -- Lines 5-6

No authentication check. Any unauthenticated user can enumerate spectators for any quiz.

```typescript
// Lines 5-6
export default async function getSpectatorOnCall(req: Request, res: Response) {
    const { quizId } = req.params;
    // No req.user check
```

**Impact:** Spectator data exposed to unauthenticated users.

**Fix:** Add authentication.

---

### getUnAskedQuestionController.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/getUnAskedQuestionController.ts`
**Bugs found:** 2

#### Bug 53 -- `MEDIUM` -- Lines 15-16, 25, 36, 61, 100, 125, 157

Excessive `console.log` statements throughout the controller dumping request params, query data, and database results. These leak sensitive quiz data in production logs.

```typescript
// Line 15-16
console.log("params quizid: ", req.params.quizId);
console.log("query: ", req.query);

// Line 25
console.log({ parsed_data });

// Line 36
console.log({ quiz_id });

// Line 61
console.log("after: ", questionAfterIndex);

// Line 100
console.log("before: ", questionBeforeIndex);

// Line 125
console.log("found quesion index: ", raw_question);

// Line 157
console.log("question is found and after is not provided: ", question);
```

**Impact:** Sensitive quiz data leaked to production logs.

**Fix:** Remove or gate behind `NODE_ENV === 'development'`.

---

#### Bug 54 -- `LOW` -- Lines 58-159

The entire question-fetching logic is wrapped in a `prisma.$transaction` but none of the queries write data -- they are all reads. Using a transaction for read-only operations adds unnecessary overhead.

```typescript
// Line 58
const question = await prisma.$transaction(async (tx) => {
    // ... only read operations inside
```

**Impact:** Unnecessary transaction overhead on read-only queries.

**Fix:** Remove the transaction wrapper and use regular queries.

---

### participantJoinController.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/participantJoinController.ts`
**Bugs found:** 1

#### Bug 55 -- `MEDIUM` -- Line 92

`redis_cache.set_participant(gameSession.id, participant.id, participant)` is called inside the Prisma transaction but is NOT awaited and is NOT a Prisma operation. If the Redis call fails, the Prisma transaction still commits. If the transaction itself later fails, the Redis cache will have stale data.

```typescript
// Line 92
redis_cache.set_participant(gameSession.id, participant.id, participant);
// <-- not awaited, not a Prisma operation, inside transaction
```

**Impact:** Data inconsistency between database and Redis cache.

**Fix:** Move the Redis call outside the transaction after it commits, and `await` it.

---

### spectatorJoinController.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/spectatorJoinController.ts`
**Bugs found:** 2

#### Bug 56 -- `CRITICAL` -- Line 81

`await prisma.spectator.create(...)` uses `prisma` (the global client) instead of `tx` (the transaction client). This means the spectator creation happens outside the transaction. If the subsequent `tx.gameSession.update` fails and the transaction rolls back, the spectator record will persist as an orphan, but the `totalSpectators` count will not be incremented.

```typescript
// Lines 80-88
const result = await prisma.$transaction(async (tx) => {
    const spectator = await prisma.spectator.create({  // <-- should be tx.spectator.create
        data: {
            quizId: quiz.id,
            nickname: GenerateUser.getRandomName(),
            avatar: GenerateUser.getRandomAvatar(),
            ipAddress: req.ip || 'unknown',
        },
    });
```

**Impact:** Orphan spectator records and inconsistent spectator counts on transaction rollback.

**Fix:** Change `prisma.spectator.create` to `tx.spectator.create`.

---

#### Bug 57 -- `LOW` -- Line 44

Typo: `'No new spectaors are allowed for this quiz.'` should be `'No new spectators are allowed for this quiz.'`.

```typescript
// Line 44
'No new spectaors are allowed for this quiz.',
```

**Impact:** Misspelled user-facing message.

**Fix:** Correct the spelling.

---

### spectatorJoinQuizViaURLController.ts

**Path:** `apps/server/src/controllers/live-quiz-controller/spectatorJoinQuizViaURLController.ts`
**Bugs found:** 2

#### Bug 58 -- `HIGH` -- Line 26

`QuizAction.verifyCookie(spectatorToken)` verifies the token but the decoded payload is never checked for validity. The token could be for any role (HOST, PARTICIPANT) or any quiz. There is no check that the token's `quizId` matches the URL's `quizId`.

```typescript
// Line 26
const verify_token = QuizAction.verifyCookie(spectatorToken);

if (!verify_token) {
  ResponseWriter.invalid_data(res, "Invalid token", 401);
  return;
}
// <-- no check on decoded token's quizId, role, etc.
```

**Impact:** An attacker could reuse any valid cookie token to join as a spectator.

**Fix:** Verify the decoded token contains the correct `quizId` and an appropriate role/type.

---

#### Bug 59 -- `MEDIUM` -- Lines 33-41

The quiz lookup does not check `allowNewSpectator`. Unlike `spectatorJoinController` which checks `quiz.allowNewSpectator`, this URL-based join skips that check entirely.

```typescript
// Lines 33-41
const quiz = await prisma.quiz.findUnique({
  where: {
    id: quizId,
  },
  select: {
    id: true,
    status: true,
    // MISSING: allowNewSpectator
  },
});
// No allowNewSpectator check follows
```

**Impact:** Spectators can join via URL even when the host has disabled new spectators.

**Fix:** Add the `allowNewSpectator` check.

---

### startCollaborationController.ts

**Path:** `apps/server/src/controllers/collaborator-controller/startCollaborationController.ts`
**Bugs found:** 2

#### Bug 60 -- `CRITICAL` -- Lines 72-107

The controller creates a collaboration session and member but never sends a response to the client. After the `prisma.$transaction` completes, the function falls through to the end of the try block without calling any `ResponseWriter` method or `res.json()`. The HTTP request will hang until it times out.

```typescript
// Lines 72-107
const collab = await prisma.$transaction(async (tx) => {
    const session = await tx.collabSession.create({ ... });
    const member = await tx.collaborator.create({ ... });
    return { session, member };
});

console.error('use this: ', collab);

// update the cache
// set the cookie
// connect to the ws server
// <-- NO RESPONSE SENT! Request hangs forever.
} catch (error) {
    console.error('error in start collaboration controller: ', error);
    ResponseWriter.system_error(res);
    return;
}
```

**Impact:** HTTP request hangs forever until client timeout.

**Fix:** Add `ResponseWriter.success(res, collab, 'Collaboration session created')` after line 96.

---

#### Bug 61 -- `LOW` -- Line 96

`console.error('use this: ', collab)` uses `console.error` for non-error logging and appears to be a debug leftover.

```typescript
// Line 96
console.error("use this: ", collab);
```

**Impact:** Misleading error-level log entry.

**Fix:** Remove this line or change to `console.log`.

---

### join_collaborator_controller.ts

**Path:** `apps/server/src/controllers/collaborator-controller/join_collaborator_controller.ts`
**Bugs found:** 1

#### Bug 62 -- `LOW` -- Lines 1-438

This file is misleadingly named. It contains the `Collaborator` class with invitation logic but is named "join" -- there is no actual "join" logic (accepting an invitation as a collaborator). The file appears to be a duplicate/sibling of `startCollaborationController.ts` functionality.

**Impact:** Code organization confusion and potential import conflicts.

**Fix:** Rename to match its purpose (e.g., `invite_collaborator_controller.ts`), and ensure there are no duplicate class definitions.

---

### createQuizUsingAIController.ts

**Path:** `apps/server/src/controllers/ai-controller/createQuizUsingAIController.ts`
**Bugs found:** 1

#### Bug 63 -- `CRITICAL` -- Lines 19-27

The entire AI logic is commented out (lines 20-22). After validating the data, the controller does nothing and never sends a response. The HTTP request will hang until timeout.

```typescript
// Lines 19-27
// send the instruction to the AI
// await chain.start(
//     res,
// )
} catch (error) {
    console.error('error in start with AI controller: ', error);
    ResponseWriter.system_error(res);
    return;
}
```

**Impact:** HTTP request hangs forever until client timeout.

**Fix:** Either implement the AI chain call or return a "not implemented" response:

```typescript
ResponseWriter.error(
  res,
  "NOT_IMPLEMENTED",
  "Feature not yet available",
  undefined,
  501,
);
```

---

### generateNewQuizController.ts

**Path:** `apps/server/src/controllers/ai-controller/generateNewQuizController.ts`
**Bugs found:** 3

#### Bug 64 -- `HIGH` -- Lines 33-41

If `sessionId` is provided but the session belongs to a different user (`session.userId !== user.id`), a new session is created, silently ignoring the provided `sessionId`. The user gets no indication that their session ID was invalid. The code first fetches ANY session by ID (no user filter), potentially leaking the existence of other users' sessions.

```typescript
// Lines 33-41
if (!session || session?.userId !== user.id) {
  session = await prisma.aiQuizChatSession.create({
    data: {
      userId: user.id.toString(),
      step: AgentStep.START,
      instruction: instruction,
    },
  });
}
```

**Impact:** Session existence information leak; silently ignoring invalid session IDs.

**Fix:** Return an error when `session.userId !== user.id` instead of silently creating a new session.

---

#### Bug 65 -- `MEDIUM` -- Line 16

`console.log('parsed data is : ', parsed_data)` logs the full parsed data including potentially sensitive AI instructions.

```typescript
// Line 16
console.log("parsed data is : ", parsed_data);
```

**Impact:** Sensitive data leaked to production logs.

**Fix:** Remove or gate behind development mode.

---

#### Bug 66 -- `LOW` -- Line 110

Typo: `'agent felt into unknown step'` should be `'agent fell into unknown step'`.

```typescript
// Line 110
'agent felt into unknown step',
```

**Impact:** Misspelled error message.

**Fix:** Correct the spelling.

---

### getPreSignedUrlController.ts

**Path:** `apps/server/src/controllers/s3-controller/getPreSignedUrlController.ts`
**Bugs found:** 2

#### Bug 67 -- `HIGH` -- Lines 7-56

No authentication check. Any unauthenticated user can request pre-signed S3 upload URLs, allowing anyone to upload arbitrary files to your S3 bucket.

```typescript
// Lines 7-9
export default async function getPreSignedUrlController(req: Request, res: Response) {
    try {
        const { fileType, fileSize } = req.body;
        // No req.user check
```

**Impact:** Open S3 upload to unauthenticated users. Potential abuse and cost escalation.

**Fix:** Add `if (!req.user?.id) { ResponseWriter.not_authorized(res); return; }`.

---

#### Bug 68 -- `HIGH` -- Lines 11-38

The `fileType` validation only checks if it contains a `/`. There is no whitelist of allowed MIME types. An attacker could upload executable files, HTML files with XSS payloads, or any other dangerous file type.

```typescript
// Line 32-38
if (!fileType.includes("/")) {
  ResponseWriter.invalid_data(
    res,
    "Invalid file type format. Expected format: 'image/png'",
  );
  return;
}
```

**Impact:** Arbitrary file type uploads to S3 (executables, XSS payloads, etc.).

**Fix:** Add a whitelist of allowed types: `['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']`.

---

### createCheckoutController.ts

**Path:** `apps/server/src/controllers/premium-controller/createCheckoutController.ts`
**Bugs found:** 1

#### Bug 69 -- `LOW` -- Lines 58-65

When a user already has an active subscription, the response returns `success: true` with `checkoutUrl: null`. The client must handle this special case. A more explicit response code or error would be clearer.

```typescript
// Lines 58-65
if (existing_subscription && existing_subscription.tier.name !== "FREE") {
  ResponseWriter.success(
    res,
    { checkoutUrl: null },
    `You already have an active subscription (${existing_subscription.tier.name}).`,
  );
  return;
}
```

**Impact:** Ambiguous response for clients to interpret.

**Fix:** Consider returning a specific status code (e.g., 409 Conflict) with an error type.

---

### getTiersController.ts

**Path:** `apps/server/src/controllers/premium-controller/getTiersController.ts`
**Bugs found:** 1

#### Bug 70 -- `LOW` -- Lines 5-39

No authentication check. Subscription tiers are publicly queryable. This may be intentional (for a pricing page), but if tiers contain internal/sensitive data, this could be an issue.

```typescript
// Lines 5-6
export default async function getTiersController(req: Request, res: Response) {
    try {
        // No req.user check
```

**Impact:** Potential information exposure if tier data is sensitive.

**Fix:** Determine if authentication is required; if so, add it.

---

### verifySessionController.ts

**Path:** `apps/server/src/controllers/premium-controller/verifySessionController.ts`
**Bugs found:** 2

#### Bug 71 -- `HIGH` -- Lines 5-131

No authentication check. Any unauthenticated user can probe checkout sessions and subscription statuses by guessing `session_id` or `subscription_id` values. This leaks subscription information (tier name, status, period end date) to unauthorized users.

```typescript
// Lines 5-7
export default async function verifySessionController(req: Request, res: Response) {
    try {
        const { session_id, subscription_id } = req.query;
        // No req.user check
```

**Impact:** Subscription information leaked to unauthenticated users.

**Fix:** Add `req.user` authentication check and verify the session/subscription belongs to the requesting user.

---

#### Bug 72 -- `MEDIUM` -- Line 97

`checkoutSession.expiresAt < new Date()` performs a date comparison but `checkoutSession.expiresAt` type is not guaranteed to be a `Date` object (it could be a string from the database).

```typescript
// Line 97
if (checkoutSession.status === 'PENDING' && checkoutSession.expiresAt < new Date()) {
```

**Impact:** Potential incorrect date comparison if type is string.

**Fix:** Ensure proper Date object: `new Date(checkoutSession.expiresAt) < new Date()`.

---

### getReviewController.ts

**Path:** `apps/server/src/controllers/appReview-controller/getReviewController.ts`
**Bugs found:** 2

#### Bug 73 -- `MEDIUM` -- Line 13

The query fetches ALL reviews with no pagination, no limit. For a popular app, this could return thousands of reviews in a single response.

```typescript
// Line 13
const response: ReviewDTO[] = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    // No take or skip
```

**Impact:** Performance degradation and excessive memory usage.

**Fix:** Add `take` limit and pagination.

---

#### Bug 74 -- `LOW` -- Line 34

Returns status code 201 (Created) for a GET request. 201 is for resource creation, not retrieval.

```typescript
// Line 34
ResponseWriter.success(res, response, "Reviews fetched successfully", 201);
```

**Impact:** Incorrect HTTP semantics.

**Fix:** Use status 200.

---

### readReviewController.ts

**Path:** `apps/server/src/controllers/appReview-controller/readReviewController.ts`
**Bugs found:** 3

#### Bug 75 -- `HIGH` -- Line 19

`orderByClause[sortBy as string] = ...` allows the user to inject arbitrary column names via the `sortBy` query parameter. If a non-existent column is provided, Prisma will throw an error. If a sensitive column exists, it could be used to infer data through sorting.

```typescript
// Lines 18-19
const orderByClause: any = {};
orderByClause[sortBy as string] = order === "desc" ? "desc" : "asc";
```

**Impact:** Prisma injection vector; information leakage through sorting.

**Fix:** Whitelist allowed `sortBy` values:

```typescript
if (!["createdAt", "rating"].includes(sortBy as string)) {
  sortBy = "createdAt";
}
```

---

#### Bug 76 -- `HIGH` -- Lines 5-89

No authentication check. Anyone can read all reviews including user IDs, names, and emails (lines 29-33). This leaks user PII.

```typescript
// Lines 5-6
export default async function readReviewController(req: Request, res: Response) {
    const { page = 1, ... } = req.query;
    // No req.user check

// Lines 28-33 -- exposes PII
include: {
    user: {
        select: {
            id: true,
            name: true,
            email: true,  // <-- leaks email
```

**Impact:** User PII (emails) exposed to unauthenticated users.

**Fix:** Add authentication, or remove sensitive user fields from the response.

---

#### Bug 77 -- `MEDIUM` -- Lines 9-11

`parseInt(page as string)` and `parseInt(limit as string)` will return `NaN` for non-numeric strings, and `NaN - 1` produces `NaN`, causing `skip: NaN` which Prisma will reject. The defaults only apply if query params are `undefined`, not if they are invalid strings.

```typescript
// Lines 9-11
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;
```

**Impact:** Prisma error on invalid query parameter input.

**Fix:** Add `isNaN` checks: `const pageNum = parseInt(page as string) || 1;`

---

### reviewAppController.ts

**Path:** `apps/server/src/controllers/appReview-controller/reviewAppController.ts`
**Bugs found:** 2

#### Bug 78 -- `HIGH` -- Line 7

`!comment.trim()` will throw a TypeError if `comment` is `undefined` or `null` (cannot call `.trim()` on undefined). The `rating` and `comment` values from `req.body` are not validated for type first.

```typescript
// Line 7
if (!rating || rating < 1 || rating > 5 || !comment.trim()) {
```

**Impact:** Server crash on request with missing `comment` field.

**Fix:** Check `typeof comment === 'string'` before calling `.trim()`, or use optional chaining: `!comment?.trim()`.

---

#### Bug 79 -- `MEDIUM` -- Line 7

`!rating` will be true if `rating` is `0`, but the check `rating < 1` catches that. More importantly, `rating` is not type-checked -- if the client sends `rating: "5"` (a string), the string would be stored in the database without conversion.

```typescript
// Line 7
if (!rating || rating < 1 || rating > 5 || !comment.trim()) {
```

**Impact:** String rating values stored instead of numbers.

**Fix:** Add `typeof rating !== 'number'` check, or use Zod validation.

---

### getChatsController.ts

**Path:** `apps/server/src/controllers/chat-controller/getChatsController.ts`
**Bugs found:** 1

#### Bug 80 -- `LOW` -- Lines 11-13

Participants are completely blocked from seeing chat messages (`role === USER_TYPE.PARTICIPANT` returns early with error). If this is intentional, it is fine, but it means participants in a live quiz with `liveChat` enabled can never retrieve chat history.

```typescript
// Lines 11-12
if (role === USER_TYPE.PARTICIPANT) {
  return { success: false, error: "Invalid role" };
}
```

**Impact:** Participants cannot access chat in quizzes with live chat enabled.

**Fix:** Verify this is the intended behavior; if not, allow participant access to chat.

---

### getAllTemplatesController.ts

**Path:** `apps/server/src/controllers/template-controller/getAllTemplatesController.ts`
**Bugs found:** 2

#### Bug 81 -- `HIGH` -- Line 6

`req.user.id` is accessed without optional chaining (`req.user?.id`). If `req.user` is `undefined`, this will throw a TypeError crash before the `not_authorized` response is sent.

```typescript
// Line 6
if (!req.user.id) {
  // <-- crashes if req.user is undefined
  ResponseWriter.not_authorized(res);
  return;
}
```

**Impact:** Server crash on unauthenticated requests.

**Fix:** Use `req.user?.id`.

---

#### Bug 82 -- `LOW` -- Line 34

Typo in log: `'Error in fetchinf templates'` should be `'Error in fetching templates'`.

```typescript
// Line 34
console.error("Error in fetchinf templates: ", error);
```

**Impact:** Typo in error logs.

**Fix:** Correct the spelling.

---

### dodoWebhookController.ts

**Path:** `apps/server/src/controllers/webhook-controller/dodoWebhookController.ts`
**Bugs found:** 1

#### Bug 83 -- `MEDIUM` -- Line 14

`const webhookId = req.headers['webhook-id'] as string` is cast to `string` but HTTP headers can be `undefined`. If the `webhook-id` header is missing, `webhookId` will be `undefined`, and the `prisma.webhookEvent.findUnique` call with `eventId: undefined` will throw an error.

```typescript
// Line 14
const webhookId = req.headers["webhook-id"] as string;
```

**Impact:** Unhandled Prisma error on missing webhook-id header.

**Fix:** Add a check:

```typescript
if (!webhookId) {
  ResponseWriter.error(
    res,
    "MISSING_WEBHOOK_ID",
    "webhook-id header is required",
  );
  return;
}
```

---

## Total Bug Count: 83

| Severity  | Count  | Percentage |
| --------- | ------ | ---------- |
| CRITICAL  | 7      | 8.4%       |
| HIGH      | 21     | 25.3%      |
| MEDIUM    | 30     | 36.1%      |
| LOW       | 25     | 30.1%      |
| **TOTAL** | **83** | **100%**   |

### Files with Zero Bugs

- `restore_trashed_quiz_controller.ts`
- `get_shared_quiz_controller.ts`
