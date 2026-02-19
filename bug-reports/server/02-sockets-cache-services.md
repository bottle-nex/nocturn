# Server Sockets, Cache & Services -- Deep Bug Report

**Date**: 2026-02-19
**Branch**: `dev`
**Scope**: Sockets, Cache, Classes, Queues, Services, AI Modules, Routes, Schemas, Middlewares, Types

---

## Severity Summary

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 4      |
| HIGH      | 18     |
| MEDIUM    | 31     |
| LOW       | 15     |
| **TOTAL** | **68** |

---

## Top 5 Critical / Must-Fix Bugs

### 1. PhaseQueue.ts -- Queue processor is commented out (CRITICAL)

- **File**: `apps/server/src/queue/PhaseQueue.ts`
- **Line**: 23
- **Impact**: The entire live quiz flow is broken. Quiz phases (question reading -> active -> results) never transition automatically because `elect_queue_processor()` is commented out, so `start_processing_jobs()` is never called.

```ts
// this.elect_queue_processor()
```

**Fix**: Uncomment the call or call `this.start_processing_jobs()` directly.

---

### 2. processor.database.queue.ts -- Missing spread operator corrupts Redis cache (CRITICAL)

- **File**: `apps/server/src/queue/database/processor.database.queue.ts`
- **Lines**: 292-293
- **Impact**: `update_question_processor` maps updated questions with `{ ...q, question_data }` instead of `{ ...q, ...question_data }`. The missing spread means instead of merging updated fields into the question, a nested `question_data` property is added. The Redis cache ends up with stale top-level fields and a nested `question_data` object.

```ts
{ ...q, question_data }   // BUG: nests the object
```

**Fix**: Change to `{ ...q, ...question_data }`.

---

### 3. HostManager.ts -- Deleting the wrong key from socketMapping (CRITICAL)

- **File**: `apps/server/src/sockets/HostManager.ts`
- **Line**: 107
- **Impact**: `this.socketMapping.delete(gameSessionId)` deletes using `gameSessionId`, but `socketMapping` is `Map<ws.id, ws>`. The old host socket entry (keyed by `ws.id`) is never removed, causing a memory leak. An unrelated entry could be accidentally deleted if a `ws.id` happened to equal a `gameSessionId`.

```ts
this.socketMapping.delete(gameSessionId);
```

**Fix**: Change to `this.sessionHostMapping.delete(gameSessionId)` or remove the line entirely since line 109 already deletes `ws.id`.

---

### 4. QuizManager.ts -- Wrong `PublicKey` type import for prize distribution (CRITICAL)

- **File**: `apps/server/src/sockets/QuizManager.ts`
- **Lines**: 303-309
- **Impact**: `distribute_prize` accepts `_first`, `_second`, `_third` typed as `PublicKey` from the `jsonwebtoken` module. This is completely wrong -- `PublicKey` from `jsonwebtoken` is for JWT verification, not a blockchain public key. The function body is also unimplemented (just a comment `// call the contract here`).

```ts
import { PublicKey } from 'jsonwebtoken';
// ...
distribute_prize(_first: PublicKey, _second: PublicKey, _third: PublicKey) {
    // call the contract here
}
```

**Fix**: Use the correct type for public keys (e.g., from Solana Web3.js) and implement the actual distribution logic.

---

### 5. SubscriberManager.ts -- Early return prevents messages to participants/spectators (HIGH)

- **File**: `apps/server/src/sockets/SubscriberManager.ts`
- **Lines**: 254-258
- **Impact**: In `broadcast_to_session`, when `messages_to` includes `HOST` and the host socket is not found, the function returns early. This prevents the message from being sent to PARTICIPANT and SPECTATOR recipients even if they were included in `messages_to`.

```ts
if (!host_socket_id) {
  return; // BUG: skips all remaining recipients
}
```

**Fix**: Remove the `return` or restructure so that the host block is skipped without aborting the entire function.

---

## All Bugs by File

---

### `apps/server/src/sockets/socket.server.ts`

**Bugs found**: 3

#### Bug 1 -- [HIGH] Async callback in jwt.verify causes unhandled rejections

- **Line**: 164
- **Description**: The `jwt.verify` callback is async, but errors thrown inside it (from the `await` calls on lines 187-210) will NOT be caught by the outer `try/catch` on line 213. The `jwt.verify` callback-based API does not propagate promise rejections. If `handle_connection` throws, it becomes an unhandled promise rejection that crashes the process.
- **Impact**: Server crash on any error during WebSocket connection handling.
- **Fix**: Use the synchronous/promise form of `jwt.verify` (wrap it in a promise or use `try/catch` inside the callback), or add a `try/catch` around the `await` calls inside the callback.

#### Bug 2 -- [MEDIUM] Redis subscription leak on disconnect

- **Line**: 182
- **Description**: `this.subscriber.subscribe(redis_key)` is called for every new connection but there is no corresponding `this.subscriber.unsubscribe(redis_key)` when all sockets for that session disconnect. The subscriber continues listening to channels for sessions that no longer have any connected sockets.
- **Impact**: Redis subscription count grows unboundedly over time, consuming memory and bandwidth.
- **Fix**: Track active session counts and unsubscribe when the last socket for a session disconnects.

#### Bug 3 -- [LOW] Empty default case leaves socket open and idle

- **Line**: 204
- **Description**: The `default` case in the switch statement is empty. If a token has an unrecognized role, the websocket is left open and idle without being assigned an ID or handler.
- **Impact**: Zombie WebSocket connections from tokens with unrecognized roles.
- **Fix**: Close the websocket in the default case with an appropriate error code.

---

### `apps/server/src/sockets/HostManager.ts`

**Bugs found**: 7

#### Bug 1 -- [CRITICAL] Deleting wrong key from socketMapping

- **Line**: 107
- **Description**: `this.socketMapping.delete(gameSessionId)` is deleting the wrong key. The `socketMapping` is a `Map<ws.id, ws>`, but this line deletes using `gameSessionId` instead of `ws.id`. The old host socket entry (the ws.id key) will never be removed from the map, causing a memory leak. Meanwhile, a valid unrelated entry could be accidentally deleted if a ws.id happened to equal a gameSessionId.
- **Impact**: Memory leak from accumulating stale socket entries; potential corruption of socket map.
- **Fix**: Change to `this.sessionHostMapping.delete(gameSessionId)` or remove this line entirely since line 109 already deletes `ws.id`.

#### Bug 2 -- [HIGH] Unhandled throw in websocket message handler

- **Lines**: 215, 220
- **Description**: `throw new Error("Quiz doesn't exist in game_session")` is thrown inside `handle_question_launch` which is called from a websocket message handler. This unhandled throw will crash the process since there is no `try/catch` around it.
- **Impact**: Server crash when a quiz is missing from a game session.
- **Fix**: Send an error message back to the client via the socket instead of throwing, or wrap the handler in try/catch.

#### Bug 3 -- [HIGH] Wrong first argument passed to update_game_session

- **Line**: 332
- **Description**: `this.database_queue.update_game_session(ws.user.userId, ...)` passes `ws.user.userId` as the first argument (`id`), but the processor uses `game_session_id` from `job.data` to update the session. The `id` field in `UpdateGameSessionJobtype` is unused by the processor (which uses `game_session_id`), so this is not directly breaking, but it is semantically confusing and indicates a design inconsistency. Other calls correctly pass `game_session_id` as the first argument.
- **Impact**: Misleading code that could cause bugs if the `id` field is ever used by the processor.
- **Fix**: Pass `game_session_id` as the first argument for consistency.

#### Bug 4 -- [HIGH] timeToAnswer computes a negative number

- **Line**: 494
- **Description**: `timeToAnswer: question_active_time - answeredAt` computes a negative number. `question_active_time` is a timestamp from `game_session.phaseStartTime` (the start of the active phase), and `answeredAt` is `Date.now()`. Since `answeredAt > question_active_time`, the result is always negative.
- **Impact**: All time-to-answer values are negative, breaking scoring and leaderboard logic.
- **Fix**: Use `answeredAt - question_active_time` to compute elapsed time.

#### Bug 5 -- [MEDIUM] Chat messages allowed even when chat is disabled

- **Lines**: 399-401 vs 352
- **Description**: `handle_incoming_chat_reaction_event` checks `is_chat_allowed` before processing reactions, but `handle_send_chat_message` on line 352 does NOT check `is_chat_allowed`. A host can send chat messages even when chat is disabled.
- **Impact**: Chat messages bypass the chat-disabled setting.
- **Fix**: Add the same `is_chat_allowed` check to `handle_send_chat_message`.

#### Bug 6 -- [MEDIUM] Prize distribution logic is inverted

- **Lines**: 498-507
- **Description**: `handle_quiz_results` distributes prize only when `!quiz.prizePool` (i.e., when there is NO prize). The logic is inverted: it should distribute prizes when `quiz.prizePool` is truthy.
- **Impact**: Prizes are never distributed when they should be; distribution is attempted when there is no prize pool.
- **Fix**: Change the condition to `if (quiz.prizePool)`.

#### Bug 7 -- [LOW] Typo in console error

- **Line**: 111
- **Description**: "closing host scket" should be "closing host socket".
- **Impact**: Minor log readability issue.
- **Fix**: Correct the typo.

---

### `apps/server/src/sockets/ParticipantManager.ts`

**Bugs found**: 5

#### Bug 1 -- [HIGH] timeToAnswer computes a negative value

- **Line**: 487
- **Description**: `timeToAnswer: question_active_time - answeredAt` computes a negative value. `question_active_time` is derived from `game_session.phaseStartTime` (a Date turned to Number), and `answeredAt` is `Date.now()`. Since answeredAt > phaseStartTime, this is always negative.
- **Impact**: All participant time-to-answer values are negative, breaking scoring.
- **Fix**: Use `answeredAt - question_active_time`.

#### Bug 2 -- [HIGH] Streak logic is broken

- **Lines**: 509-510
- **Description**: When the answer is correct, it sets `longestStreak` to `participant.longestStreak + 1` (or 1 if falsy). When incorrect, it sets `longestStreak` to 0. This means `longestStreak` gets RESET to 0 on any wrong answer. The field name "longestStreak" implies it should track the maximum streak ever achieved, but this logic uses it as a "current streak" counter.
- **Impact**: The "longest streak" stat is meaningless -- it only reflects the current streak, not the historical maximum.
- **Fix**: Introduce a `currentStreak` field, or rename the field and fix the logic to only update `longestStreak` if the new current streak exceeds it.

#### Bug 3 -- [MEDIUM] Premature session cleanup when last participant leaves

- **Lines**: 626-629
- **Description**: `cleanup_participant_socket` deletes the session from `session_participants_mapping` and calls `quiz_settings.cleanup_session` when the last participant leaves. But if there is still a host or spectators active, cleaning up the settings will break those users' sessions.
- **Impact**: Host and spectator sessions break when the last participant disconnects.
- **Fix**: Only clean up settings when ALL users (host, participants, spectators) have disconnected, not just when the last participant disconnects.

#### Bug 4 -- [MEDIUM] Destructuring Bull Job return instead of DB result

- **Lines**: 415-418
- **Description**: `handle_participant_name_change` calls `this.database_queue.update_participant(...)` and destructures the result as `{ data }`, but `database_queue.update_participant` returns a `Bull.Job` (from `this.database_queue.add(...)`), not `{ data }`. Accessing `.data` gives the job's input data, not the updated participant.
- **Impact**: Name change broadcast may use incorrect data.
- **Fix**: The name change broadcasting should rely on the input `choosenNickname` directly, not on the job result, since the job processes asynchronously.

#### Bug 5 -- [LOW] Typo in variable name

- **Line**: 405
- **Description**: `choosenNickname` should be `chosenNickname`.
- **Impact**: Minor code quality issue.
- **Fix**: Rename the variable.

---

### `apps/server/src/sockets/SpectatorManager.ts`

**Bugs found**: 5

#### Bug 1 -- [HIGH] Destructuring Bull Job return instead of DB result

- **Line**: 372
- **Description**: Same issue as ParticipantManager: `this.database_queue.update_spectator(...)` returns a Bull Job, but the code destructures `{ data }` from the job and accesses `data.spectator.nickname`. This will give the job input payload, not the actual DB-updated result.
- **Impact**: Spectator name change broadcast may use incorrect data.
- **Fix**: Use the provided `choosenNickname` directly instead of relying on the job return.

#### Bug 2 -- [MEDIUM] Missing private modifier on redis_cache

- **Line**: 39
- **Description**: `redis_cache` is declared without the `private` modifier, making it publicly accessible. All other managers declare it as `private`.
- **Impact**: Exposes internal cache to external modification.
- **Fix**: Add `private` modifier.

#### Bug 3 -- [MEDIUM] Unreliable setTimeout for socket deletion

- **Lines**: 120-121
- **Description**: `setTimeout(() => { this.socket_mapping.delete(existing_socket.id); }, 1000)` -- this delayed delete is unreliable. By line 128, the same socket id is already deleted from `socket_mapping` synchronously. When the timeout fires 1 second later, the new socket may have already been inserted. This could accidentally delete the new socket if timing is right.
- **Impact**: Potential accidental deletion of a valid new socket connection.
- **Fix**: Remove the `setTimeout` block entirely since line 128 already handles the deletion.

#### Bug 4 -- [MEDIUM] Premature session cleanup when last spectator leaves

- **Lines**: 331-333
- **Description**: Same issue as ParticipantManager -- calls `quiz_settings.cleanup_session` when the last spectator leaves, which could prematurely clean up settings while other user types are still active.
- **Impact**: Host and participant sessions break when the last spectator disconnects.
- **Fix**: Coordinate cleanup across all user types.

#### Bug 5 -- [LOW] Typo: "reactuon" should be "reaction"

- **Line**: 454
- **Description**: "chat reactuon payload" should be "chat reaction payload".
- **Impact**: Minor log readability issue.
- **Fix**: Correct the typo.

---

### `apps/server/src/sockets/QuizManager.ts`

**Bugs found**: 4

#### Bug 1 -- [CRITICAL] Wrong PublicKey type from jsonwebtoken

- **Lines**: 303-309
- **Description**: `distribute_prize` accepts `_first`, `_second`, `_third` as `PublicKey` from `jsonwebtoken` module. This is a completely wrong type -- `PublicKey` from `jsonwebtoken` is for JWT verification, not a blockchain public key. The `import { PublicKey } from 'jsonwebtoken'` on line 9 is misused. Additionally, the function body does nothing with the prize data (the `// call the contract here` comment indicates it is unimplemented).
- **Impact**: Prize distribution is completely non-functional and uses wrong types.
- **Fix**: Use the correct type for public keys (e.g., from Solana Web3.js) and implement the actual distribution logic.

#### Bug 2 -- [HIGH] Missing null check on spectator_cache

- **Lines**: 86-91
- **Description**: `onSpectatorConnect` does not check if `spectator_cache` is null before accessing `spectator_cache.id`. Unlike `onParticipantConnect` (which has a null check), if the spectator cache is empty, this will throw a runtime error.
- **Impact**: Server crash when spectator cache data is missing.
- **Fix**: Add a null check for `spectator_cache`.

#### Bug 3 -- [MEDIUM] Unhandled throws in onHostconnect

- **Lines**: 40, 53
- **Description**: `onHostconnect` throws `new Error('Game session not found')` and `new Error('Quiz not found')`. These throws propagate up to the socket connection handler, where they become unhandled promise rejections.
- **Impact**: Server crash when a host connects with invalid session data.
- **Fix**: Handle errors gracefully by closing the websocket with an error message instead of throwing.

#### Bug 4 -- [LOW] Inconsistent method casing

- **Line**: 34
- **Description**: Method name `onHostconnect` uses inconsistent casing (lowercase `c` in `connect`). Other methods use `onParticipantConnect` and `onSpectatorConnect` with uppercase `C`.
- **Impact**: Code consistency issue.
- **Fix**: Rename to `onHostConnect`.

---

### `apps/server/src/sockets/CollaborationManager.ts`

**Bugs found**: 3

#### Bug 1 -- [HIGH] Recursive close event from cleanup function

- **Lines**: 116-125
- **Description**: The `close` event handler calls `cleanup_existing_collaborator_socket(ws.collabUser.userId, ...)`, which will try to close the socket again (line 168: `existing_socket.close(...)`) if `readyState` is still `WebSocket.OPEN`. This can cause recursive close events or errors. The cleanup function was designed for cleaning up an OLD socket when a NEW one connects, not for handling the socket's own close event.
- **Impact**: Recursive close events or socket errors on disconnect.
- **Fix**: Create a separate lightweight cleanup function for the `close` handler that just removes map entries without trying to close the socket again.

#### Bug 2 -- [MEDIUM] Missing null check for ws.collabUser

- **Line**: 118
- **Description**: `ws.collabUser.collabSessionId` is accessed without checking if `ws.collabUser` exists. If the close event fires before `ws.collabUser` was set (e.g., if handle_connection failed early), this will throw.
- **Impact**: Server crash on premature WebSocket close.
- **Fix**: Add a null check for `ws.collabUser`.

#### Bug 3 -- [LOW] Typo: "exisiting" should be "existing"

- **Line**: 159
- **Description**: `exisiting_collaborator_socket_id` should be `existing_collaborator_socket_id`.
- **Impact**: Minor code quality issue.
- **Fix**: Correct the typo.

---

### `apps/server/src/sockets/CollaboratorsStateManager.ts`

**Bugs found**: 1

#### Bug 1 -- [MEDIUM] Redis state overwritten on every collaborator connection

- **Lines**: 18-19
- **Description**: `on_collaborators_connect` calls `populate_state_from_db_to_redis` on every collaborator connection. This means every time a new collaborator connects, the entire quiz state is re-fetched from DB and overwritten in Redis. If a collaborator made changes that are cached in Redis but not yet flushed to DB, those changes will be lost.
- **Impact**: Data loss of unsaved collaborator edits when a new collaborator connects.
- **Fix**: Check if the Redis cache already has data for this session before overwriting it, or only populate on the first connection.

---

### `apps/server/src/sockets/SubscriberManager.ts`

**Bugs found**: 3

#### Bug 1 -- [HIGH] Early return prevents messages to other recipients

- **Lines**: 254-258
- **Description**: In `broadcast_to_session`, when `messages_to` includes `HOST` and the host socket is not found (`!host_socket_id`), the function returns early on line 257. This prevents the message from being sent to PARTICIPANT and SPECTATOR recipients even if they were included in `messages_to`.
- **Impact**: Participants and spectators miss messages whenever the host socket is unavailable.
- **Fix**: Change `return` to just skip the host block (remove the `return` or restructure).

#### Bug 2 -- [MEDIUM] Early returns skip other recipient types

- **Lines**: 271-279, 296-304
- **Description**: When `only_socket_id` is provided for PARTICIPANT, after sending to that socket, the function `return`s, which prevents sending to SPECTATOR recipients if they were also in `messages_to`. Similarly for spectators.
- **Impact**: Messages intended for multiple recipient types only reach the first type processed.
- **Fix**: Use `break` pattern or restructure to avoid early returns that skip other recipient types.

#### Bug 3 -- [MEDIUM] extract_session_id_from_channel only matches game_session prefix

- **Line**: 321
- **Description**: `extract_session_id_from_channel` only matches `game_session:` prefix, but collab sessions use `collab_session:` prefix (as set in `socket.server.ts` line 174). Collaboration messages published to `collab_session:*` channels will fail to extract the session ID, returning `null`.
- **Impact**: Collaboration session messages are never delivered via the subscriber.
- **Fix**: Also match `collab_session:(.+)` pattern.

---

### `apps/server/src/cache/redis.cache.ts`

**Bugs found**: 4

#### Bug 1 -- [HIGH] Overly broad key filter in get_all_question_responses

- **Lines**: 262-265
- **Description**: The filter matches keys starting with `${question_id}` (line 264) OR `${question_id}_` (line 265). The first condition (without underscore) would match any key that starts with the question ID, including keys for other questions whose IDs happen to share the same prefix (e.g., question_id "abc" would match "abc123_participant1").
- **Impact**: Response queries may return data from unrelated questions.
- **Fix**: Only use the underscore-delimited filter: `unique_key.startsWith(\`${question*id}*\`)`.

#### Bug 2 -- [MEDIUM] Fragile colon-based key splitting

- **Line**: 137
- **Description**: In `get_all_participants`, `field.split(':')` on the hash field key assumes exactly one colon separator. If the field name itself contains a colon, the split will produce incorrect results. The `participant_id` would only capture the first segment.
- **Impact**: Participant data may be incorrectly parsed if IDs contain colons.
- **Fix**: Use `field.split(':', 2)` or `field.indexOf(':')` to split only on the first colon.

#### Bug 3 -- [MEDIUM] Race condition in lifeline response write

- **Lines**: 536-544
- **Description**: `add_spectator_lifeline_response` performs a read-modify-write on the lifeline session without any atomic guarantees. Two concurrent spectator votes could read the same session state, each add their response, and one write would overwrite the other.
- **Impact**: Lost spectator lifeline votes under concurrent usage.
- **Fix**: Use a Redis MULTI/EXEC transaction or a Lua script for atomic read-modify-write.

#### Bug 4 -- [LOW] KEYS command blocks Redis in production

- **Line**: 602
- **Description**: `cleanup_all_lifeline_sessions` uses `KEYS` command which is O(N) and blocks Redis. In production with many keys, this can cause performance issues.
- **Impact**: Redis latency spikes during cleanup.
- **Fix**: Use SCAN-based iteration instead.

---

### `apps/server/src/cache/collab_state.cache.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] Input object mutation via delete

- **Lines**: 17-18
- **Description**: `set_quiz_and_questions_state` mutates the input `quiz_state` object by deleting `questions` property from it (`delete quiz_state.questions`). This side effect modifies the caller's object, which could cause issues if the caller expects the quiz state to still have questions after this call.
- **Impact**: Caller's quiz state object is unexpectedly modified.
- **Fix**: Create a copy of the object before deleting properties: `const { questions, ...quizWithoutQuestions } = quiz_state`.

#### Bug 2 -- [LOW] Unnecessary additional Redis connection

- **Line**: 9
- **Description**: Creates a new Redis connection in the constructor, which is a separate connection from the main `RedisCache`. The application now has at least 4+ Redis connections (publisher, subscriber, RedisCache, CollabStateCache). While not a bug per se, it is wasteful and should be documented or consolidated.
- **Impact**: Wasteful resource usage.
- **Fix**: Share Redis connections where possible or use a connection pool.

---

### `apps/server/src/class/quizAction.ts`

**Bugs found**: 3

#### Bug 1 -- [HIGH] Insecure token generation with Math.random

- **Line**: 114
- **Description**: `Math.random().toString(36).substr(2)` -- `substr` is deprecated. More importantly, `Math.random()` is not cryptographically secure and produces predictable token IDs. Since `generateTokenId` is used in JWT token generation, this weakens token security.
- **Impact**: Predictable JWT token IDs that could be exploited.
- **Fix**: Use `crypto.randomUUID()` or `crypto.randomBytes()` for token generation, and replace `substr` with `substring`.

#### Bug 2 -- [MEDIUM] Hardcoded localhost URL in createSpectatorLink

- **Line**: 277
- **Description**: `createSpectatorLink` hardcodes `http://localhost:3000` which will not work in production.
- **Impact**: Spectator links are broken in production.
- **Fix**: Use `env.SERVER_WEB_URL` instead of the hardcoded URL.

#### Bug 3 -- [MEDIUM] Potential infinite loop in generateUniqueCode

- **Lines**: 25-38
- **Description**: `generateUniqueCode` has a theoretical infinite loop if all codes are taken. While extremely unlikely for a 12-char alphanumeric code, there is no maximum retry limit.
- **Impact**: Server hangs if code generation enters infinite loop.
- **Fix**: Add a maximum retry count (e.g., 100 iterations) and throw an error if no unique code is found.

---

### `apps/server/src/class/quizSettings.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] Public mutable access to quiz_settings_mapping

- **Line**: 14
- **Description**: `quiz_settings_mapping` is declared as `public`. This map is accessed directly by multiple other managers (ParticipantManager, SpectatorManager, HostManager) to check settings. Direct public mutable access allows any consumer to corrupt the map.
- **Impact**: Any consumer can accidentally corrupt quiz settings.
- **Fix**: Make it `private` and expose getter methods.

#### Bug 2 -- [LOW] Empty function fill_settings_on_boot

- **Line**: 115
- **Description**: `fill_settings_on_boot` is an empty function called in the constructor. It does nothing, suggesting an incomplete implementation.
- **Impact**: Settings are not populated on boot as intended.
- **Fix**: Either implement it or remove the call.

---

### `apps/server/src/class/response_writer.ts`

**Bugs found**: 2

#### Bug 1 -- [LOW] Typo: "successfull" should be "successful"

- **Lines**: 8, 25
- **Description**: The word "successfull" appears with double-l instead of the correct "successful".
- **Impact**: Minor text issue in API responses.
- **Fix**: Correct the typo.

#### Bug 2 -- [LOW] Parameter name typo: "messaage"

- **Line**: 87
- **Description**: `messaage` should be `message`.
- **Impact**: Minor code quality issue.
- **Fix**: Correct the typo.

---

### `apps/server/src/class/s3Client.ts`

**Bugs found**: 2

#### Bug 1 -- [HIGH] PDF uploads overwrite the same S3 key

- **Line**: 25
- **Description**: When `fileType` is `'application/pdf'`, the key is set to the static string `'ai-chat-pdfs'` without a unique filename. Every PDF upload will overwrite the same S3 key.
- **Impact**: All PDF uploads overwrite each other; only the last upload survives.
- **Fix**: Change to `` `ai-chat-pdfs/${fileName}` `` to include the unique filename.

#### Bug 2 -- [MEDIUM] No MIME type validation in getFileExtension

- **Lines**: 39-52
- **Description**: `getFileExtension` does not validate that the input `mimeType` is an allowed type. Any arbitrary MIME type will be accepted, and the fallback on line 52 (`mimeType.split('/')[1]`) could produce unexpected file extensions.
- **Impact**: Arbitrary file types can be uploaded to S3.
- **Fix**: Validate against an allowlist of permitted MIME types and reject unknown types.

---

### `apps/server/src/class/generateUser.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Potential out-of-bounds array access

- **Line**: 147
- **Description**: `users[position].avatar` could technically be undefined if `Math.random()` returns exactly 1.0 (yielding `position === users.length`), though in practice `Math.random()` is always `[0, 1)`. Same pattern on lines 151 and 157. The code works but lacks defensive programming.
- **Impact**: Negligible in practice.
- **Fix**: No significant fix needed; optionally use `Math.floor()` guard.

---

### `apps/server/src/queue/PhaseQueue.ts`

**Bugs found**: 4

#### Bug 1 -- [CRITICAL] Queue processor is commented out

- **Line**: 23
- **Description**: `elect_queue_processor()` is commented out (`// this.elect_queue_processor()`), meaning `start_processing_jobs()` is never called. The phase transition queue will never process any jobs, so quiz phases (question reading -> active -> results) will never transition automatically. The entire quiz flow is broken.
- **Impact**: Complete quiz flow failure.
- **Fix**: Uncomment the call or call `this.start_processing_jobs()` directly.

#### Bug 2 -- [HIGH] Missing await on handle_transition_phase

- **Lines**: 100-103
- **Description**: `start_processing_jobs` calls `this.phase_queue.process(...)` but does not `await` the result of `this.quiz_manager.handle_transition_phase(job.data)`. The processor function should return a promise, but since `handle_transition_phase` is async and is not awaited, Bull will not know if the job succeeded or failed. Errors inside `handle_transition_phase` will become unhandled promise rejections.
- **Impact**: Silent job failures and unhandled promise rejections.
- **Fix**: Add `await` before `this.quiz_manager.handle_transition_phase(job.data)` and add proper try/catch.

#### Bug 3 -- [HIGH] Non-cryptographic server ID generation

- **Line**: 18
- **Description**: `this.server_id = \`server\_${Math.random()}\`` produces non-cryptographic, potentially colliding server IDs. In a multi-server deployment, two servers could get the same ID.
- **Impact**: Server ID collisions in multi-server deployments.
- **Fix**: Use `crypto.randomUUID()` for a guaranteed unique server ID.

#### Bug 4 -- [MEDIUM] Forceful process.exit in shutdown hook

- **Line**: 91
- **Description**: `process.exit(0)` in the shutdown hook's `finally` block will forcefully exit even if the queue close fails. This could lead to data loss if there are in-flight jobs.
- **Impact**: Potential data loss on shutdown.
- **Fix**: Log the error and allow the process to terminate naturally, or use a more graceful shutdown mechanism.

---

### `apps/server/src/queue/database/database.queue.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] Default 1-second delay on all database operations

- **Lines**: 17-22
- **Description**: The `default_job_options` has `delay: 1000`, meaning every database operation is delayed by 1 second before processing. This adds unnecessary latency to all database writes, including time-sensitive operations like recording participant responses.
- **Impact**: 1-second latency on all DB writes, degrading real-time quiz experience.
- **Fix**: Remove or reduce the default delay, and only add delays where explicitly needed.

#### Bug 2 -- [MEDIUM] No concurrency limits on queue processors

- **Lines**: 34-69
- **Description**: All queue processors are registered without concurrency limits. By default, Bull processes one job at a time per named processor. But since there are multiple named processors, they all share the same queue. If one processor type floods the queue, other types are starved.
- **Impact**: Queue starvation under heavy load.
- **Fix**: Consider setting concurrency options for each processor, or use separate queues for time-critical operations.

---

### `apps/server/src/queue/database/processor.database.queue.ts`

**Bugs found**: 2

#### Bug 1 -- [CRITICAL] Missing spread operator corrupts Redis cache

- **Lines**: 292-293
- **Description**: `update_question_processor` maps updated questions with `{ ...q, question_data }` instead of `{ ...q, ...question_data }`. The spread operator is missing on `question_data`, so instead of merging the updated fields into the question, it adds a nested `question_data` property. The Redis cache will contain questions with stale top-level fields and a nested `question_data` object.
- **Impact**: Quiz questions in Redis cache are corrupted after any update.
- **Fix**: Change `{ ...q, question_data }` to `{ ...q, ...question_data }`.

#### Bug 2 -- [MEDIUM] Unused and misleading `id` field in job type

- **Line**: 116
- **Description**: In `update_game_session_processor`, the update uses `game_session_id` from `job.data` as the `where` clause, but the `id` field from `UpdateGameSessionJobtype` is ignored. Some callers pass `ws.user.userId` as the `id` (see HostManager line 332). The `id` field in the job type and the first argument of `update_game_session` are misleading dead code.
- **Impact**: Confusing interface that could lead to future bugs.
- **Fix**: Remove the unused `id` field or use it consistently.

---

### `apps/server/src/services/init.services.ts`

**Bugs found**: 2

#### Bug 1 -- [HIGH] Fragile initialization order dependency

- **Lines**: 16-30
- **Description**: All service instances are exported as `let` variables that are initially `undefined`. If any module imports these before `initServices()` is called (which happens in `index.ts`), they will get `undefined`. Since ES module `let` exports are live bindings, this works for direct property access, but it creates a fragile initialization order dependency.
- **Impact**: Potential undefined access if import order changes.
- **Fix**: Use a lazy initialization pattern or dependency injection.

#### Bug 2 -- [MEDIUM] Excessive Redis connections

- **Lines**: 33-34
- **Description**: Four separate Redis connections are created (publisher, subscriber, RedisCache constructor, CollabStateCache constructor), plus the Bull queues each create their own connections. This could be 8+ Redis connections per server instance, which is wasteful.
- **Impact**: Unnecessary resource consumption.
- **Fix**: Share Redis connections where possible or use a connection pool.

---

### `apps/server/src/services/cron.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Cron job does not specify timezone

- **Line**: 4
- **Description**: The cron job runs at 2 AM but does not specify a timezone. The execution time depends on the server's timezone, which could be UTC in production.
- **Impact**: Cron job may run at unexpected times depending on deployment timezone.
- **Fix**: Specify the timezone explicitly in the schedule options.

---

### `apps/server/src/services/email/email.services.ts`

**Bugs found**: 1

#### Bug 1 -- [MEDIUM] Email queue has no processor registered

- **Lines**: 23-27
- **Description**: The email queue is created with a Bull queue, but no processor is registered to actually send the emails. Jobs will be added to the queue but never processed (no `this.email_queue.process(...)` call).
- **Impact**: Emails are never sent; they accumulate in the queue forever.
- **Fix**: Register a processor function that actually sends the emails, or ensure there is a separate worker that processes this queue.

---

### `apps/server/src/services/premium/DodoPaymentService.ts`

**Bugs found**: 1

#### Bug 1 -- [MEDIUM] No validation of userId and tierId before checkout

- **Lines**: 30-66
- **Description**: `create_checkout_link` does not validate that the `userId` and `tierId` exist in the database before creating the checkout session. If invalid IDs are passed, the checkout session will be created with orphaned references.
- **Impact**: Orphaned payment sessions for non-existent users or tiers.
- **Fix**: Validate that the user and tier exist before creating the Dodo session and DB record.

---

### `apps/server/src/services/premium/DodoWebhookService.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] Using || instead of ?? for amount fallback

- **Line**: 57
- **Description**: `const amount = event.data.total_amount || event.data.amount || 0` -- using `||` means a legitimate amount of `0` would fall through to the next option. While unlikely, it is technically incorrect.
- **Impact**: A zero-value amount could be misinterpreted.
- **Fix**: Use `??` (nullish coalescing) instead of `||`.

#### Bug 2 -- [MEDIUM] Unsafe fallback for subscription_id

- **Line**: 284
- **Description**: `event.data.subscription_id || event.data.id` -- in `handleSubscriptionCancelled` and similar handlers, if `subscription_id` is not present, falling back to `event.data.id` (which could be a payment ID or other unrelated ID) could look up the wrong subscription.
- **Impact**: Wrong subscription could be cancelled or modified.
- **Fix**: Validate that `subscription_id` is present and throw/skip if not.

---

### `apps/server/src/services/premium/PremiumService.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Empty class / dead code

- **Line**: 1
- **Description**: The class is empty. This is dead code.
- **Impact**: Unnecessary code in the codebase.
- **Fix**: Remove it or implement the intended functionality.

---

### `apps/server/src/gen/agents/Agent.ts`

**Bugs found**: 2

#### Bug 1 -- [HIGH] HTTP response sent mid-graph, causing "headers already sent"

- **Line**: 50
- **Description**: `ResponseWriter.success(state.res, ...)` is called within `ask_difficulty_node`, which sends an HTTP response. But this function is part of a LangGraph state graph. If the graph continues to other nodes after this, the response will already be sent, and any subsequent attempt to write to `res` will throw "headers already sent".
- **Impact**: Server error when the graph continues past the node that already sent a response.
- **Fix**: Ensure the response is only sent at the terminal node of the graph.

#### Bug 2 -- [MEDIUM] Request hangs when quiz not found in revise_quiz_node

- **Lines**: 156-160
- **Description**: In `revise_quiz_node`, when the quiz is not found, the function returns the unchanged state without notifying the caller of the error. The HTTP response is never sent in this case, leaving the request hanging.
- **Impact**: Client request times out with no error message.
- **Fix**: Send an error response before returning.

---

### `apps/server/src/gen/agents/Chain.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] SSE headers never set (create_stream never called)

- **Lines**: 375-381
- **Description**: `create_stream` is a private method that sets SSE headers, but it is never called anywhere. The stream methods (`executor`, `reviser`, `ask_difficulty`, `plan`) write to `res` using `ResponseWriter.stream.write` without ever setting the SSE headers. The response will not be properly configured as an event stream.
- **Impact**: SSE streaming will not work correctly; clients may not receive streamed data.
- **Fix**: Call `create_stream(res)` at the beginning of the `start()` method.

#### Bug 2 -- [MEDIUM] Stream ended prematurely in ask_difficulty

- **Lines**: 98-101
- **Description**: In `ask_difficulty`, the `finally` block calls `ResponseWriter.stream.end(res)` which ends the stream. But the caller (`start()`) may continue execution after `ask_difficulty` returns (for the `START` case). Since the stream is ended, any subsequent writes by the caller would fail.
- **Impact**: Subsequent writes fail after ask_difficulty completes.
- **Fix**: Only end the stream at the final step of the chain.

---

### `apps/server/src/gen/prompts/createQuizPrompt.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Typo: "your'e" should be "you're"

- **Line**: 36
- **Description**: Grammatical typo in the prompt text.
- **Impact**: Minor text quality issue in AI prompts.
- **Fix**: Correct the typo.

---

### `apps/server/src/routes/live-quiz.router.ts`

**Bugs found**: 2

#### Bug 1 -- [HIGH] Missing authMiddleware on get-question-results

- **Line**: 37
- **Description**: `/quiz/get-question-results` endpoint has no `authMiddleware`, meaning anyone can access quiz question results without authentication.
- **Impact**: Unauthenticated access to quiz results data.
- **Fix**: Add `authMiddleware` to the route.

#### Bug 2 -- [MEDIUM] Missing auth/ownership middleware on get-live-quiz-data

- **Line**: 25
- **Description**: `/quiz/get-live-quiz-data/:quizId` has no `authMiddleware` or `verifyQuizOwnershipMiddleware`. Depending on the controller, this could expose quiz data (including answers) to unauthenticated users.
- **Impact**: Potential exposure of quiz answers to unauthenticated users.
- **Fix**: Add appropriate middleware for authorization.

---

### `apps/server/src/routes/premium.router.ts`

**Bugs found**: 1

#### Bug 1 -- [MEDIUM] Missing authMiddleware on verify-session

- **Line**: 11
- **Description**: `/premium/verify-session` has no `authMiddleware`. Anyone can verify payment sessions without being authenticated.
- **Impact**: Unauthorized payment session verification.
- **Fix**: Add `authMiddleware` to prevent unauthorized session verification.

---

### `apps/server/src/schemas/createQuizSchema.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] Typo in enum key: TUMBS_UP

- **Line**: 14
- **Description**: `TUMBS_UP = 'THUMBS_UP'` -- the key is `TUMBS_UP` (missing an 'H') but the value is correct. This could cause confusion when referencing the enum key.
- **Impact**: Developer confusion; potential bugs if the key is referenced directly.
- **Fix**: Rename to `THUMBS_UP`.

#### Bug 2 -- [MEDIUM] No maximum limit on quiz options array

- **Line**: 23
- **Description**: `options: z.array(z.string().min(1)).min(4)` -- validates minimum 4 options but has no maximum. A quiz question with 100 options would pass validation but break the frontend.
- **Impact**: Frontend breakage from excessively large option arrays.
- **Fix**: Add `.max(4)` or `.length(4)` to enforce exactly 4 options.

---

### `apps/server/src/schemas/generateNewQuizSchema.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Missing minimum length on instruction field

- **Line**: 4
- **Description**: `instruction: z.string()` has no minimum length validation, unlike `createQuizUsingAISchema` which has `.min(5).max(200)`. An empty instruction string would pass validation.
- **Impact**: Empty instructions sent to AI generation.
- **Fix**: Add `.min(1)` or `.min(5)`.

---

### `apps/server/src/middlewares/authMiddleware.ts`

**Bugs found**: 2

#### Bug 1 -- [MEDIUM] jwt.verify callback-style used in async function

- **Line**: 26
- **Description**: `jwt.verify` is called with a callback, making it asynchronous. The outer `try/catch` on line 25 will NOT catch errors thrown within the callback. If `jwt.verify` itself throws synchronously (e.g., malformed token before the callback is invoked), it would be caught, but the `async` function declaration suggests the intention was to use `await`.
- **Impact**: Unhandled errors from JWT verification could crash the server.
- **Fix**: Use the synchronous form of `jwt.verify` (without callback) wrapped in try/catch.

#### Bug 2 -- [LOW] Typo: "avilable" should be "available"

- **Line**: 21
- **Description**: Misspelling in error message or comment.
- **Impact**: Minor text quality issue.
- **Fix**: Correct the typo.

---

### `apps/server/src/middlewares/verifyQuizOwnershipMiddleware.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Misleading error message

- **Line**: 37
- **Description**: The error message "Error deleting quiz" is misleading -- this middleware verifies ownership, it does not delete anything.
- **Impact**: Confusing error messages in logs and responses.
- **Fix**: Change to "Error verifying quiz ownership".

---

### `apps/server/src/types/express.d.ts`

**Bugs found**: 1

#### Bug 1 -- [MEDIUM] req.user typed as non-optional

- **Line**: 12
- **Description**: `user: AuthUser` is not declared as optional (`user?: AuthUser`). TypeScript will believe `req.user` always exists, even on routes without `authMiddleware`. Accessing `req.user.id` on unauthenticated routes will not produce a type error but will crash at runtime.
- **Impact**: Runtime crashes on unauthenticated routes that access `req.user`.
- **Fix**: Change to `user?: AuthUser`.

---

### `apps/server/src/types/web-socket-types.ts`

**Bugs found**: 1

#### Bug 1 -- [MEDIUM] WebSocket properties typed as always-present

- **Lines**: 5-8
- **Description**: `CustomWebSocket` requires both `user: LiveGameTokenPayload` and `collabUser: CollabSessionTokenPayload` to always be present, but in practice only one is populated depending on whether it is a game or collaboration connection. The non-populated property will be `undefined` at runtime, but TypeScript considers both always present.
- **Impact**: Type-unsafe access to undefined WebSocket properties.
- **Fix**: Make both optional: `user?: LiveGameTokenPayload` and `collabUser?: CollabSessionTokenPayload`.

---

### `apps/server/src/jobs/clearnup-trashed-quizzes.ts`

**Bugs found**: 1

#### Bug 1 -- [LOW] Typo in filename

- **Filename**: `clearnup-trashed-quizzes.ts`
- **Description**: "clearnup" should be "cleanup" (typo in filename).
- **Impact**: Minor naming inconsistency.
- **Fix**: Rename the file to `cleanup-trashed-quizzes.ts`.

---

### `apps/server/src/index.ts`

**Bugs found**: 3

#### Bug 1 -- [HIGH] Hardcoded private IP in CORS origin

- **Line**: 20
- **Description**: CORS `origin` array includes a hardcoded private IP `'http://192.168.31.63:3000'`. This should not be in production code.
- **Impact**: Security issue; unnecessary CORS origin in production.
- **Fix**: Remove the hardcoded IP or make it environment-specific.

#### Bug 2 -- [MEDIUM] Debug garbage in console logs

- **Lines**: 36, 40
- **Description**: Console log says `' fsfsf'` which is debug garbage. Line 40 says `'logged"'` with mismatched quote.
- **Impact**: Unprofessional and meaningless log output.
- **Fix**: Use meaningful log messages like `` `Server running on port ${PORT}` ``.

#### Bug 3 -- [MEDIUM] express.json() parses body before webhook can access raw bytes

- **Line**: 16
- **Description**: Webhook routes typically need the raw body for signature verification. `express.json()` parses the body before the webhook middleware can access the raw bytes. If the webhook middleware needs the raw buffer, it will not get it because `express.json()` has already parsed it. The middleware does handle `Buffer.isBuffer(req.body)` check, but with `express.json()` applied globally, `req.body` will always be a parsed object.
- **Impact**: Webhook signature verification may fail.
- **Fix**: Exclude the webhook route from `express.json()` or use `express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })`.

---

### Files with No Bugs Found

The following files were reviewed and found to have no bugs:

- `apps/server/src/gen/agents/Model.ts`
- `apps/server/src/gen/schemas/createNewQuizSchema.ts`
- `apps/server/src/gen/state/quiz-agent.state.ts`
- `apps/server/src/gen/types/createNewQuizType.ts`
- `apps/server/src/routes/ai.router.ts`
- `apps/server/src/routes/auth.router.ts`
- `apps/server/src/routes/collaborator.router.ts`
- `apps/server/src/routes/review.router.ts`
- `apps/server/src/schemas/createQuizUsingAISchema.ts`
- `apps/server/src/schemas/favouriteQuizSchema.ts`
- `apps/server/src/schemas/getUnAskedQuestionSchema.ts`
- `apps/server/src/schemas/participantJoinSchema.ts`
- `apps/server/src/schemas/premium/createCheckoutSchema.ts`
- `apps/server/src/schemas/quizSettingsSchema.ts`
- `apps/server/src/schemas/renameQuizSchema.ts`
- `apps/server/src/schemas/spectatorJoinSchema.ts`
- `apps/server/src/middlewares/webhookVerificationMiddleware.ts`
- `apps/server/src/types/webhook-types.ts`
- `apps/server/src/types/database-queue-types.ts`
- `apps/server/src/types/job.database.types.ts`
- `apps/server/src/configs/env.ts`

---

## Total Bug Count: 68

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 4      |
| HIGH      | 18     |
| MEDIUM    | 31     |
| LOW       | 15     |
| **TOTAL** | **68** |
