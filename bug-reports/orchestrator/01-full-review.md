# Orchestrator -- Deep Bug Report

**Date**: 2026-02-19
**Reviewed by**: Automated Deep Code Review Agent
**Branch**: `dev`

---

## Summary

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 9      |
| HIGH      | 20     |
| MEDIUM    | 14     |
| LOW       | 5      |
| **TOTAL** | **48** |

### Severity Breakdown by File

| File                                          | Critical | High | Medium | Low | Total |
| --------------------------------------------- | -------- | ---- | ------ | --- | ----- |
| `index.ts`                                    | 0        | 0    | 1      | 0   | 1     |
| `configs/env.ts`                              | 0        | 0    | 1      | 1   | 2     |
| `services/init-services.ts`                   | 0        | 2    | 3      | 0   | 5     |
| `job/transition-worker.ts`                    | 2        | 3    | 2      | 0   | 7     |
| `queue/database.queue.ts`                     | 1        | 4    | 2      | 1   | 8     |
| `queue/email_service.queue.ts`                | 0        | 2    | 1      | 0   | 3     |
| `cache/redis-cache.ts`                        | 5        | 2    | 1      | 0   | 8     |
| `client/phase-queue-processor.ts`             | 1        | 2    | 1      | 0   | 4     |
| `client/publisher.ts`                         | 0        | 2    | 1      | 0   | 3     |
| `services/email/resend.services.ts`           | 0        | 1    | 1      | 1   | 3     |
| `services/email/templates/email.templates.ts` | 0        | 1    | 0      | 1   | 2     |
| `types/types.ts`                              | 0        | 1    | 1      | 1   | 3     |
| `types/database-queue-types.ts`               | 0        | 0    | 0      | 1   | 1     |

---

## Top 5 Critical / Must-Fix Bugs

### 1. Missing `await` on phase transition handler -- games freeze silently

- **File**: `apps/orchestrator/src/client/phase-queue-processor.ts`, Line 21
- **Severity**: CRITICAL
- `handle_transition_phase()` is async but is not awaited. Bull marks the job as complete immediately. If the handler throws asynchronously, the error becomes an unhandled promise rejection, the job is already "completed", and the phase transition is silently lost. Games freeze mid-question with no recovery.

### 2. Bull retry logic is completely non-functional for all database processors

- **File**: `apps/orchestrator/src/queue/database.queue.ts`, all processors
- **Severity**: HIGH (systemic)
- Every processor returns `{ success: false, error: ... }` instead of throwing. Bull only retries when a processor throws. The `attempts: 3` configuration does nothing. Every transient database error (connection timeout, deadlock) results in permanent data loss.

### 3. Non-atomic Redis `hset` + `expire` causes memory leaks

- **File**: `apps/orchestrator/src/cache/redis-cache.ts`, all `set_*` methods
- **Severity**: CRITICAL (5 instances)
- If the process crashes between `hset` and `expire`, the key persists in Redis forever with no TTL. Under sustained load, this is a slow memory leak that will eventually exhaust Redis memory.

### 4. False-positive prefix matching corrupts question response data

- **File**: `apps/orchestrator/src/cache/redis-cache.ts`, Line 199
- **Severity**: HIGH
- `unique_key.startsWith(question_id)` matches any key whose ID shares a prefix (e.g., question `"abc"` also matches `"abcdef_participant1"`). This causes responses from different questions to cross-contaminate each other, producing wrong scores for participants.

### 5. Redis `publish()` not awaited -- all real-time updates silently fail

- **File**: `apps/orchestrator/src/client/publisher.ts`, Line 14
- **Severity**: HIGH
- `publish()` returns a Promise that is not awaited. The try/catch only catches synchronous errors. Under Redis failover or network partition, every publish fails silently with no error logged or handled. All real-time game updates stop.

---

## All Bugs by File

---

### `index.ts`

**Path**: `apps/orchestrator/src/index.ts`
**Bugs found**: 1

#### Bug 1 -- `[MEDIUM]` Line 2

```ts
import initServices from "./services/init-services";
initServices();
```

**Description**: `initServices()` is called without `await` and without `.catch()`, yet it initializes Redis connections and Bull queues that could throw. If any constructor fails (e.g., Redis unreachable), the error is unhandled and the process may crash without a useful stack trace or exit silently.

**Impact**: Undiagnosable startup crashes in production.

**Fix**: Wrap in a top-level async IIFE with try/catch, or add a global `process.on('unhandledRejection', ...)` handler, or make `initServices` async and await it.

---

### `configs/env.ts`

**Path**: `apps/orchestrator/src/configs/env.ts`
**Bugs found**: 2

#### Bug 1 -- `[MEDIUM]` Line 4

```ts
dotenv.config({ path: "../../.env" });
```

**Description**: Uses a relative path. This path is relative to the current working directory at runtime, NOT relative to the file. If the orchestrator is started from a different directory (e.g., via Docker, systemd, or a monorepo root script), the `.env` file will not be found.

**Impact**: Environment variables silently missing in non-standard execution contexts.

**Fix**: Use `path.resolve(__dirname, '../../.env')` or an absolute path derived from `__dirname`.

#### Bug 2 -- `[LOW]` Line 11

```ts
function validateUrl() {
```

**Description**: The function is named `validateUrl` but it validates all environment variables, not just URLs. Misleading name harms maintainability.

**Impact**: Code readability / maintainability.

**Fix**: Rename to `validateEnv` or `parseEnv`.

---

### `services/init-services.ts`

**Path**: `apps/orchestrator/src/services/init-services.ts`
**Bugs found**: 5

#### Bug 1 -- `[HIGH]` Line 11

```ts
dotenv.config();
```

**Description**: `dotenv.config()` is called again here (already called in `env.ts` with a specific path). This call uses no path argument, so it loads `.env` from the CWD. Redundant and may silently override or conflict with the earlier load.

**Impact**: Environment variable confusion across deployment contexts.

**Fix**: Remove this duplicate `dotenv.config()` call.

#### Bug 2 -- `[HIGH]` Lines 13-18

```ts
export let redisCacheInstance: RedisCache;
export let databaseQueueInstance: DatabaseQueue;
export let phaseQueueProcessorInstance: PhaseQueueProcessor;
export let transitionWorkerInstance: TransitionWorker;
export let emailServiceProcessor: EmailServiceProcessor;
export let redisPublisherInstance: Redis;
export let publisherInstnace: Publisher;
```

**Description**: All service instances are declared as `let` exports initialized to `undefined`. Any module that imports these values at the top level (and stores the reference at import time) will capture `undefined` if it runs before `initServices()` is called. The ordering within `initServices()` is critical -- `TransitionWorker`'s constructor captures these imports. If the order is ever changed, constructors get `undefined`.

**Impact**: Fragile initialization order; silent `undefined` references that cause runtime crashes.

**Fix**: Use a dependency injection pattern or a lazy accessor that fails loudly if the instance is not yet initialized.

#### Bug 3 -- `[HIGH]` Line 23

```ts
redisPublisherInstance = new Redis(REDIS_URL!);
```

**Description**: No error event handler on this Redis instance. If the connection fails, ioredis emits an `error` event, and unhandled `error` events on EventEmitters crash the process. The `!` non-null assertion is unnecessary since zod validation guarantees the value.

**Impact**: Process crash on Redis connection failure with no recovery.

**Fix**: Add `redisPublisherInstance.on('error', (err) => { console.error('Redis publisher error:', err); })`.

#### Bug 4 -- `[MEDIUM]` Line 19

```ts
export let publisherInstnace: Publisher;
```

**Description**: Typo in variable name `publisherInstnace` (should be `publisherInstance`). Propagates to every file that imports it.

**Impact**: Code maintainability; confusing for new developers.

**Fix**: Rename to `publisherInstance` everywhere.

#### Bug 5 -- `[MEDIUM]` Lines 22-33

```ts
export default function initServices() {
  redisPublisherInstance = new Redis(REDIS_URL!);
  // ...
}
```

**Description**: No graceful shutdown handling. When the process receives SIGTERM/SIGINT, there is no code to close Redis connections, drain Bull queues, or stop workers.

**Impact**: Data loss (in-flight jobs) and Redis connection leaks on shutdown.

**Fix**: Add `process.on('SIGTERM', ...)` / `process.on('SIGINT', ...)` handlers that call `queue.close()`, `redis.quit()`, etc.

---

### `job/transition-worker.ts`

**Path**: `apps/orchestrator/src/job/transition-worker.ts`
**Bugs found**: 7

#### Bug 1 -- `[CRITICAL]` Lines 64-79

```ts
this.database_queue
  .update_game_session(
    data.gameSessionId,
    {
      /* ... */
    },
    data.gameSessionId,
  )
  .catch((err) => {
    console.error("Failed to enqueue question active phase:", err);
  });
```

**Description**: The database update is fire-and-forget with only a `.catch()` that logs. The code then immediately publishes WebSocket messages (lines 90-112) and schedules the next phase transition (line 114). If the DB update fails, clients receive the "QUESTION_ACTIVE" event but the database still shows the old phase. On server restart, it resumes from the wrong phase.

**Impact**: Data integrity / race condition. Game state in DB diverges from client state.

**Fix**: Either await the DB queue job completion before publishing, or accept eventual consistency and document this decision explicitly.

#### Bug 2 -- `[CRITICAL]` Lines 144-159

```ts
this.database_queue
  .update_game_session(
    data.gameSessionId,
    {
      /* ... */
    },
    data.gameSessionId,
  )
  .catch((err) => {
    console.error("Failed to enqueue show result phase:", err);
  });
```

**Description**: Same fire-and-forget database update problem in `handle_active_to_results_transition_phase`.

**Impact**: Same as Bug 1 -- data integrity issue.

**Fix**: Same as Bug 1.

#### Bug 3 -- `[HIGH]` Line 50

```ts
const question = quiz.questions?.find((q) => q.id === data.questionId);
```

**Description**: If `quiz.questions` is `undefined` (e.g., the questions field was not cached or failed to parse in `get_quiz`), the early return only logs to console and does NOT notify any client. The game silently stalls with a frozen screen.

**Impact**: Silent game freeze with no user feedback.

**Fix**: Publish an error event to the game session via the publisher so clients can display an error or retry.

#### Bug 4 -- `[HIGH]` Lines 42-48

```ts
if (!quiz) {
  console.error("Quiz not found");
  return;
}
```

**Description**: If `quiz` is null, the game silently stalls. No notification is sent to the host or participants.

**Impact**: Silent game freeze.

**Fix**: Publish an error event.

#### Bug 5 -- `[HIGH]` Lines 90, 101, 112

```ts
this.publisher.publish_event_to_redis(
  data.gameSessionId,
  pub_sub_message_to_participant,
);
```

**Description**: `publish_event_to_redis` is not awaited. The publisher's internal `publish()` call is also not awaited (see publisher.ts bugs). If any publish fails, the error is swallowed silently. Some clients may get the event while others do not.

**Impact**: Partial event delivery; some users see stale game state.

**Fix**: Make `publish_event_to_redis` async, await the `publish` call, and handle errors properly in the transition worker.

#### Bug 6 -- `[MEDIUM]` Lines 57-62

```ts
const buffer = 2 * SECONDS; // 2 seconds
const question_active_time = question.timeLimit * SECONDS;
```

**Description**: Uses `SECONDS = 1000` (milliseconds) from `types.ts`. If `question.timeLimit` is stored as seconds in the database (e.g., `30`), then `30 * 1000 = 30000ms` is correct. But if `question.timeLimit` is already in milliseconds, this produces an astronomically large timeout. There is no validation of `question.timeLimit` being a reasonable value.

**Impact**: Potentially infinite or absurdly long question timers.

**Fix**: Add validation that `question.timeLimit` is within reasonable bounds (e.g., 5-300 seconds).

#### Bug 7 -- `[MEDIUM]` Line 120 (relates to types.ts Line 152)

```ts
await this.phase_queue_processor.schedule_phase_transition({
  // ...
  executeAt: end_time, // number passed, but type says Date
});
```

**Description**: `PhaseQueueJobDataType.executeAt` is typed as `Date`, but `end_time` is a `number` (milliseconds since epoch). `PhaseTransitionJob` correctly types it as `number`. The inconsistency means TypeScript is not catching type errors.

**Impact**: Type system is misleading; potential `NaN` if a `Date` object is ever actually passed.

**Fix**: Change `PhaseQueueJobDataType.executeAt` from `Date` to `number`.

---

### `queue/database.queue.ts`

**Path**: `apps/orchestrator/src/queue/database.queue.ts`
**Bugs found**: 8

#### Bug 1 -- `[CRITICAL]` Line 149

```ts
this.redis_cache.set_spectator(
  game_session_id,
  updatedSpectator.id,
  updatedSpectator,
);
```

**Description**: `set_spectator` is async but NOT awaited in `update_spectator_processor`. If the cache update fails, the error is swallowed silently, causing the database and cache to be out of sync.

**Impact**: Database-cache inconsistency for spectator data.

**Fix**: Add `await` before the call.

#### Bug 2 -- `[HIGH]` All processors (Lines 136-233)

```ts
} catch (error) {
    console.error(`Error while updating spectator: `, error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
    };
}
```

**Description**: All processors return `{ success: false, error: ... }` on failure instead of throwing. In Bull, a processor must throw for the job to be retried. By returning a "success-like" object, Bull considers the job completed successfully and will NOT retry. The `attempts: 3` configuration is effectively useless.

**Impact**: No database write retries. Every transient DB error results in permanent data loss.

**Fix**: Throw the error instead of returning it. E.g., `throw error;` after logging.

#### Bug 3 -- `[HIGH]` Lines 90-95

```ts
private default_job_options: JobOptions = {
    attempts: 3,
    delay: 1000,
    removeOnFail: 5,
    removeOnComplete: 10,
};
```

**Description**: `delay: 1000` means every database write is artificially delayed by 1 second. During a fast-paced quiz game, this creates a 1-second lag for every database operation. Combined with 3 retry attempts, a failing job could take 3+ seconds.

**Impact**: Unnecessary 1-second latency on all database writes.

**Fix**: Remove `delay: 1000` from default options, or reduce it to 0. Use Bull's `backoff` option if retry delay is needed.

#### Bug 4 -- `[HIGH]` Lines 433-439

```ts
public async create_chat_reaction(/* ... */) {
    return await this.database_queue
        .add(/* ... */)
        .catch((err) => console.error('Failed to enqueue chat reaction:', err));
}
```

**Description**: `.catch()` swallows the error from `queue.add()` and returns `undefined`. The caller receives `undefined` instead of the Bull Job object, which may cause a `TypeError` if the caller tries to access job properties.

**Impact**: Silent failure; potential downstream TypeError.

**Fix**: Re-throw the error or return a sentinel value.

#### Bug 5 -- `[HIGH]` Lines 457-463

```ts
public async create_participant_response(/* ... */) {
    return await this.database_queue
        .add(/* ... */)
        .catch((err) => console.error('Failed to enqueue participant response: ', err));
}
```

**Description**: Same problem as Bug 4 -- `.catch()` swallows the error and returns `undefined`.

**Impact**: Silent failure; potential downstream TypeError.

**Fix**: Same as Bug 4.

#### Bug 6 -- `[HIGH]` Lines 278-303

```ts
const createChatReaction = await prisma.chatReaction.create({
  data: {
    ...chat_reaction,
    chatMessage: { connect: { id: chat_message_id } },
    reactorName: chat_reaction.reactorName,
    reactorAvatar: chat_reaction.reactorAvatar,
    reactedAt: chat_reaction.reactedAt,
    reaction: chat_reaction.reaction,
    reactorType: chat_reaction.reactorType,
  },
});
```

**Description**: Spreads `...chat_reaction` into the Prisma `data` field and then also explicitly sets individual fields from `chat_reaction`. The spread could introduce unexpected fields (like `id` or `chatMessageId` from the job data) into the create payload, potentially causing a Prisma validation error. Duplicate fields are also set redundantly.

**Impact**: Potential Prisma validation errors; unexpected data in DB records.

**Fix**: Remove the spread `...chat_reaction` and only use the explicit field assignments, or remove the explicit fields and only use the spread.

#### Bug 7 -- `[MEDIUM]` Line 93

```ts
removeOnFail: 5,
```

**Description**: Only the last 5 failed jobs are kept. In a high-throughput quiz game, failed jobs could be rotated out before an operator can investigate. Combined with Bug 2 (jobs never actually fail because errors are caught and returned), this setting has no practical effect.

**Impact**: Lost debugging information for failed jobs.

**Fix**: Increase `removeOnFail` or fix the retry logic first.

#### Bug 8 -- `[MEDIUM]` Line 100

```ts
this.database_queue = new Bull("database-operations", {
  redis: REDIS_URL,
});
```

**Description**: Bull internally uses ioredis, which may not support all URL formats that zod's `z.url()` considers valid. If the URL contains special characters in the password, this could fail.

**Impact**: Connection failure with special characters in Redis password.

**Fix**: Consider parsing the URL and passing structured options, or add error handling for the Bull queue connection.

---

### `queue/email_service.queue.ts`

**Path**: `apps/orchestrator/src/queue/email_service.queue.ts`
**Bugs found**: 3

#### Bug 1 -- `[HIGH]` Line 33

```ts
default:
    throw new Error(`Unknown job type: ${job.data.type}`);
```

**Description**: When an unknown job type is received, the code throws. However, there are no retry options configured on this queue (no `defaultJobOptions`). A job with an unknown type will be attempted once and then permanently fail. If a legitimate job type is misspelled by the producer, there is no alerting mechanism.

**Impact**: Permanently lost emails for misspelled job types; no retry for transient errors.

**Fix**: Add default job options with retry logic.

#### Bug 2 -- `[HIGH]` Lines 37-47

```ts
private async handle_collaborator_added_email(data: CollaboratorAddedEmailData) {
    await ResendService.send_collaborator_added_email(data);
}
```

**Description**: The email handler methods do not catch errors from `ResendService`. If the Resend API call fails (network error, rate limit, invalid API key), the error propagates up and Bull marks the job as failed with no retry (since no retry options are set). Transient email failures result in permanently lost emails.

**Impact**: Permanently lost emails on transient failures.

**Fix**: Configure retry options: `this.email_queue = new Bull(queue_name, url, { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } } })`.

#### Bug 3 -- `[MEDIUM]` Lines 27-31

```ts
case EmailJobType.COLLABORATOR_ADDED:
    return this.handle_collaborator_added_email(data as CollaboratorAddedEmailData);
```

**Description**: Unsafe type casting with `as`. If the job data does not match the expected shape (e.g., a producer sends malformed data), the cast suppresses TypeScript's type checking, and the code fails at runtime deep inside `ResendService` with an unhelpful error.

**Impact**: Runtime errors with poor diagnostics for malformed job data.

**Fix**: Validate the data shape before casting, using zod or a runtime type guard.

---

### `cache/redis-cache.ts`

**Path**: `apps/orchestrator/src/cache/redis-cache.ts`
**Bugs found**: 8

#### Bug 1 -- `[CRITICAL]` Lines 29-39

```ts
await this.redis_cache.hset(key, ...entries.flat());
await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
```

**Description**: `set_game_session` uses two separate Redis commands: `hset` then `expire`. If the process crashes between the two calls, the key persists forever with no TTL -- a **memory leak** in Redis.

**Impact**: Permanent Redis memory leak on crash between commands.

**Fix**: Use a Redis pipeline with `MULTI/EXEC` to make both operations atomic.

#### Bug 2 -- `[CRITICAL]` Lines 120-131

```ts
await this.redis_cache.hset(key, participant_id, JSON.stringify(particpant));
await this.redis_cache.expire(key, 60 * 60 * 24);
```

**Description**: Same atomicity issue in `set_participants` -- `hset` and `expire` are not atomic.

**Impact**: Same as Bug 1.

**Fix**: Same as Bug 1.

#### Bug 3 -- `[CRITICAL]` Lines 149-163

```ts
await this.redis_cache.hset(key, unique_key, JSON.stringify(response));
await this.redis_cache.expire(key, 60 * 60 * 24);
```

**Description**: Same atomicity issue in `set_participant_response`.

**Impact**: Same as Bug 1.

**Fix**: Same as Bug 1.

#### Bug 4 -- `[CRITICAL]` Lines 244-255

```ts
await this.redis_cache.hset(key, spectator_id, JSON.stringify(spectator));
await this.redis_cache.expire(key, 60 * 60 * 24);
```

**Description**: Same atomicity issue in `set_spectator`.

**Impact**: Same as Bug 1.

**Fix**: Same as Bug 1.

#### Bug 5 -- `[CRITICAL]` Lines 284-296

```ts
await this.redis_cache.hset(key, ...entries.flat());
await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
```

**Description**: Same atomicity issue in `set_quiz`.

**Impact**: Same as Bug 1.

**Fix**: Same as Bug 1.

#### Bug 6 -- `[HIGH]` Lines 196-201

```ts
.filter(
    ([unique_key]) =>
        unique_key.startsWith(`${question_id}`) ||
        unique_key.startsWith(`${question_id}_`),
)
```

**Description**: The first condition `startsWith(question_id)` is a superset of the second. More critically, it causes **false positives**: if `question_id` is `"abc"`, it also matches `"abcdef_participant1"`. Responses from a different question whose ID shares a prefix are incorrectly included.

**Impact**: Wrong scores displayed to participants; data integrity corruption.

**Fix**: Remove the first condition and only use `unique_key.startsWith(`${question*id}*`)`.

#### Bug 7 -- `[HIGH]` Line 36

```ts
await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
```

**Description**: Constants in this file: `SECONDS=60`, `MINUTES=60`, `HOURS=24`. In `types.ts`, `SECONDS=1000` (milliseconds). Two different constants named `SECONDS` in different files with different values. The TTL calculation here (`60 * 60 * 24 = 86400` seconds = 24 hours) happens to be correct, but the naming is extremely confusing and error-prone.

**Impact**: High risk of future bugs when developers assume `SECONDS` means the same thing everywhere.

**Fix**: Rename constants to be unambiguous: `SECONDS_PER_MINUTE = 60`, `MINUTES_PER_HOUR = 60`, `HOURS_PER_DAY = 24`, and compute `TTL_24H = SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY`.

#### Bug 8 -- `[MEDIUM]` Lines 338-351

```ts
public async try_acquire_lock(lock_key: string, lock_value: string, ttl_seconds: number) {
    try {
        const result = await this.redis_cache.set(lock_key, lock_value, 'EX', ttl_seconds, 'NX');
        return result === 'OK';
    } catch (err) {
        console.error('error in try_acquire_lock', err);
    }
}
```

**Description**: Returns `undefined` if an exception occurs (no return in the catch block). The caller cannot distinguish "lock held by someone else" (`false`) from "Redis error" (`undefined`).

**Impact**: Ambiguous lock state on Redis errors; potential double-acquisition or deadlock.

**Fix**: Return `false` in the catch block, or throw to let the caller handle the Redis error.

---

### `client/phase-queue-processor.ts`

**Path**: `apps/orchestrator/src/client/phase-queue-processor.ts`
**Bugs found**: 4

#### Bug 1 -- `[CRITICAL]` Line 21

```ts
this.phase_queue.process("phase_transition", async (job) => {
  this.transition_worker.handle_transition_phase(job.data);
});
```

**Description**: `handle_transition_phase()` is async but NOT awaited. Bull considers the job complete immediately (the processor callback returns a resolved promise of `undefined`). If `handle_transition_phase` throws asynchronously, the error is an unhandled promise rejection, the job is already marked as "completed", and the phase transition is silently lost.

**Impact**: Phase transitions silently lost; games freeze mid-question.

**Fix**: Add `await`: `await this.transition_worker.handle_transition_phase(job.data);`

#### Bug 2 -- `[HIGH]` Lines 28-34

```ts
await this.phase_queue.add("phase_transition", data, {
  delay,
  jobId: `${data.gameSessionId}_${data.questionIndex}_${data.fromPhase}_${data.toPhase}`,
});
```

**Description**: Phase transition jobs use a static `jobId`. In Bull, if a job with the same `jobId` already exists (even in a completed/failed state), Bull rejects the new job. If a phase needs to be re-triggered (e.g., after crash recovery), the same `jobId` collides with the already-completed job.

**Impact**: Phase transitions cannot be retried after failure; game permanently stuck.

**Fix**: Remove completed jobs before re-scheduling, append a timestamp/random suffix to the jobId, or use Bull's `removeOnComplete` option for this queue.

#### Bug 3 -- `[HIGH]` Lines 12-14

```ts
this.phase_queue = new Bull("phase-transitions", {
  redis: Env.ORCH_REDIS_URL,
});
```

**Description**: The Bull queue is created without `defaultJobOptions`. No retries (`attempts` defaults to 1), no `removeOnComplete`, no `removeOnFail`. Failed phase transitions are never retried, and completed/failed jobs accumulate in Redis forever -- a **memory leak**.

**Impact**: No retries for failed transitions; Redis memory leak from accumulated jobs.

**Fix**: Add `defaultJobOptions: { attempts: 3, removeOnComplete: 100, removeOnFail: 50, backoff: { type: 'exponential', delay: 2000 } }`.

#### Bug 4 -- `[MEDIUM]` Line 15

```ts
this.transition_worker = transitionWorkerInstance;
```

**Description**: Captures the value of `transitionWorkerInstance` at construction time. This is `undefined` since `transitionWorkerInstance` is not yet assigned when `PhaseQueueProcessor` is constructed (assigned on line 28 of init-services.ts, but `PhaseQueueProcessor` is constructed on line 27). If a job arrives between construction and the `set_transition_worker()` call, it calls `.handle_transition_phase()` on `undefined`, causing a crash.

**Impact**: Crash if a job arrives during the initialization window.

**Fix**: Defer `start_consuming()` to after `set_transition_worker()` is called, or throw a clear error if `transition_worker` is not set.

---

### `client/publisher.ts`

**Path**: `apps/orchestrator/src/client/publisher.ts`
**Bugs found**: 3

#### Bug 1 -- `[HIGH]` Line 14

```ts
this.publisher.publish(key, JSON.stringify(event));
```

**Description**: The ioredis `publish` method returns a Promise, but it is NOT awaited. The surrounding try/catch will NOT catch async rejections. If Redis is disconnected, the publish fails silently.

**Impact**: All real-time game updates silently fail under Redis issues.

**Fix**: Add `await` and make the method `async`: `await this.publisher.publish(key, JSON.stringify(event));`

#### Bug 2 -- `[HIGH]` Lines 12-17

```ts
public publish_event_to_redis(game_session_id: string, event: PubSubMessageTypes) {
    try {
        const key = this.get_redis_key(game_session_id);
        this.publisher.publish(key, JSON.stringify(event));
    } catch (err) {
        console.error('Error while publishing event to redis', err);
    }
}
```

**Description**: Because `publish` is not awaited, the try/catch only catches synchronous errors (e.g., `JSON.stringify` throwing on circular references). Any Redis connection error becomes an unhandled promise rejection.

**Impact**: Unhandled promise rejections; silent failures.

**Fix**: Make the method async and await the publish call.

#### Bug 3 -- `[MEDIUM]` Line 8

```ts
this.publisher = redisPublisherInstance;
```

**Description**: Captures the value at construction time. If `Publisher` is constructed before `redisPublisherInstance` is assigned in `initServices()`, `this.publisher` will be `undefined`. In the current order, assignment happens on line 23 and Publisher is constructed on line 24, so this works -- but it is fragile.

**Impact**: Any reordering of initServices() silently breaks Publisher.

**Fix**: Use a getter that accesses the instance lazily, or pass the dependency explicitly via a constructor parameter.

---

### `services/email/resend.services.ts`

**Path**: `apps/orchestrator/src/services/email/resend.services.ts`
**Bugs found**: 3

#### Bug 1 -- `[HIGH]` Lines 21-27, 36-41, 47-52

```ts
await resend.emails.send({
  from: "Nocturn <noreply@nocturn.app>",
  to: data.email,
  subject: `You've been added as a collaborator on "${data.quizTitle}"`,
  html,
});
```

**Description**: None of the `resend.emails.send()` calls have error handling. If the Resend API returns an error (rate limit, invalid email, network timeout), the error propagates uncaught. Since these are called from Bull job processors without retry configuration, the email is permanently lost.

**Impact**: Permanently lost emails on API failures.

**Fix**: Add try/catch with appropriate error handling, or ensure the calling Bull queue has retry configuration.

#### Bug 2 -- `[MEDIUM]` Line 18

```ts
quizUrl: `${process.env.WEB_URL || 'http://localhost:3000'}/new/${data.quizId}`,
```

**Description**: `WEB_URL` is not validated by the zod schema in `env.ts`. If `WEB_URL` is not set in production, emails contain `http://localhost:3000` links, which are broken for end users.

**Impact**: Broken links in production emails.

**Fix**: Add `WEB_URL` to the zod env schema in `env.ts`, or at minimum add a warning log when the fallback is used.

#### Bug 3 -- `[LOW]` Lines 13-53

```ts
export default class ResendService {
  static async send_collaborator_added_email(data: CollaboratorAddedEmailData) {
    /* ... */
  }
  // ...
}
```

**Description**: The `ResendService` class uses only static methods and has no instance state. It could simply be a module with exported functions. This is a design issue, not a runtime bug.

**Impact**: Code design / maintainability.

**Fix**: Convert to a module with exported functions, or keep as-is if the pattern is intentional.

---

### `services/email/templates/email.templates.ts`

**Path**: `apps/orchestrator/src/services/email/templates/email.templates.ts`
**Bugs found**: 2

#### Bug 1 -- `[HIGH]` Lines 42, 46, 61, 117, 120, 124, 139, 199

```ts
<strong style="color: #4f46e5; font-weight: 600;">${data.inviterName}</strong>
// ...
${data.quizTitle}
// ...
${data.userName}
// ...
${otp}
```

**Description**: Template string interpolation of user-provided data is injected directly into HTML without sanitization. This is an **HTML injection / XSS vulnerability**. If a user sets their name to `<script>alert('xss')</script>` or `<img src=x onerror=alert(1)>`, it will be rendered as HTML in the recipient's email client. While most modern email clients strip `<script>` tags, other HTML payloads (phishing links, CSS-based attacks, image-based tracking) can still work.

**Impact**: HTML injection in emails; potential phishing and tracking attacks.

**Fix**: HTML-escape all user-provided data before interpolation:

```ts
const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
```

#### Bug 2 -- `[LOW]` Line 155

```ts
${new Date().getFullYear()}
```

**Description**: Generates the copyright year at email-send time on the server. If the server clock is wrong, the year will be wrong.

**Impact**: Minor cosmetic issue.

**Fix**: Use a hardcoded year or accept the minor risk.

---

### `types/types.ts`

**Path**: `apps/orchestrator/src/types/types.ts`
**Bugs found**: 3

#### Bug 1 -- `[HIGH]` Line 152

```ts
export interface PhaseQueueJobDataType {
  // ...
  executeAt: Date;
}
```

**Description**: `executeAt` is typed as `Date`, but everywhere it is used (transition-worker.ts lines 114-121), a `number` (milliseconds since epoch) is passed. The companion `PhaseTransitionJob` interface correctly types it as `number`. The type mismatch means TypeScript is not catching errors.

**Impact**: Type system is misleading; potential `NaN` if a `Date` object is ever actually passed.

**Fix**: Change `executeAt: Date` to `executeAt: number`.

#### Bug 2 -- `[MEDIUM]` Lines 50-56

```ts
export enum Interactions {
  THUMBS_UP = "THUMBS_UP",
  DOLLAR = "DOLLAR",
  BULB = "BULB",
  HEART = "HEART",
  SMILE = "SMILE",
}
```

**Description**: The `Interactions` enum duplicates the one from `@nocturn/database`. `database.queue.ts` imports `Interactions` from `@nocturn/database`, while this file defines its own. If these ever diverge, it causes silent data mismatches.

**Impact**: Risk of silent data mismatches if enums diverge.

**Fix**: Remove the local `Interactions` enum and use the one from `@nocturn/database` everywhere.

#### Bug 3 -- `[LOW]` Lines 36-48

```ts
export type PubSubMessageTypes = {
  type: MESSAGE_TYPES;
  payload: any;
  // ...
};
```

**Description**: `payload: any` defeats TypeScript's type safety. Any payload shape will compile, making it easy to send malformed events.

**Impact**: No compile-time type checking on event payloads.

**Fix**: Define specific payload types for each `MESSAGE_TYPES` and use a discriminated union.

---

### `types/database-queue-types.ts`

**Path**: `apps/orchestrator/src/types/database-queue-types.ts`
**Bugs found**: 1

#### Bug 1 -- `[LOW]` Lines 1-6

```ts
export interface JobOption {
  attempts?: number;
  delay?: number;
  removeOnComplete?: number;
  removeOnFail?: number;
}
```

**Description**: All fields are optional. When spread with `default_job_options` in `database.queue.ts`, passing `{}` is valid but meaningless. This interface also duplicates Bull's own `JobOptions` type.

**Impact**: Redundant type definition; no additional type safety.

**Fix**: Use Bull's `JobOptions` directly, or make required fields non-optional.

---

## Total Bug Count: 48

| Severity  | Count  |
| --------- | ------ |
| CRITICAL  | 9      |
| HIGH      | 20     |
| MEDIUM    | 14     |
| LOW       | 5      |
| **TOTAL** | **48** |
