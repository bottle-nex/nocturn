# Nocturn Bug Report Summary

**Date**: 2026-02-19
**Branch**: `dev`
**Tooling Results**: Build PASS | Lint PASS (57 warnings) | Type-check PASS
**Review Method**: Deep per-file review of every source file across all apps and packages

---

## Severity Legend

| Severity | Meaning                                                         |
| -------- | --------------------------------------------------------------- |
| CRITICAL | Security vulnerability, data loss, or production-breaking issue |
| HIGH     | Logic bug that causes incorrect behavior in real usage          |
| MEDIUM   | Missing validation, race condition, or code quality issue       |
| LOW      | Cosmetic, naming, or style issue                                |

---

## Bug Count by Module (Deep Review)

| Module                                                                   | Critical | High   | Medium  | Low    | Total   |
| ------------------------------------------------------------------------ | -------- | ------ | ------- | ------ | ------- |
| [Server - Controllers](./server/01-controllers.md)                       | 7        | 21     | 30      | 25     | 83      |
| [Server - Sockets/Cache/Services](./server/02-sockets-cache-services.md) | 4        | 18     | 31      | 15     | 68      |
| [Orchestrator](./orchestrator/01-full-review.md)                         | 9        | 20     | 14      | 5      | 48      |
| [Web (Frontend)](./web/01-full-review.md)                                | 4        | 13     | 20      | 12     | 49      |
| [Packages](./packages/01-full-review.md)                                 | 1        | 4      | 15      | 5      | 25      |
| **Total**                                                                | **25**   | **76** | **110** | **62** | **273** |

---

## Top 20 Must-Fix Before Production

| #   | Severity | Module       | Bug                                                                                                           | File                              |
| --- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | CRITICAL | server       | OAuth signin trusts client data -- no token verification                                                      | `signInController.ts:11`          |
| 2   | CRITICAL | server       | S3 presigned URL endpoint has NO auth middleware                                                              | `s3.router.ts:8`                  |
| 3   | CRITICAL | server       | JWT auth tokens never expire                                                                                  | `signInController.ts:44`          |
| 4   | CRITICAL | server       | `verifyQuizOwnershipMiddleware` commented out on publish/launch                                               | `quiz.router.ts:55,61`            |
| 5   | CRITICAL | server       | `spectatorJoinController` uses `prisma` instead of `tx` inside transaction                                    | `spectatorJoinController.ts:81`   |
| 6   | CRITICAL | server       | `permanently_delete_quiz` has no hostId filter -- any user can delete any quiz                                | `quizController.ts`               |
| 7   | CRITICAL | server       | PhaseQueue `elect_queue_processor()` is commented out -- entire quiz phase flow broken                        | `PhaseQueue.ts:23`                |
| 8   | CRITICAL | orchestrator | `phase-queue-processor` missing `await` on `handle_transition_phase` -- errors swallowed                      | `phase-queue-processor.ts:21`     |
| 9   | CRITICAL | orchestrator | Non-atomic `hset` + `expire` in all Redis cache `set_*` methods (5 instances) -- data can persist without TTL | `redis-cache.ts`                  |
| 10  | CRITICAL | server       | Spectator link hardcoded to `localhost:3000`                                                                  | `quizAction.ts:277`               |
| 11  | CRITICAL | server       | `generateUniqueCode` infinite loop risk if DB fails                                                           | `quizAction.ts:26`                |
| 12  | CRITICAL | server       | CORS allows hardcoded private IP                                                                              | `index.ts:20`                     |
| 13  | CRITICAL | packages     | `.env` with real secrets likely committed to git                                                              | `.env`                            |
| 14  | CRITICAL | web          | Middleware route matcher incomplete -- dynamic routes bypass auth                                             | `middleware.ts:3`                 |
| 15  | CRITICAL | web          | OAuth secrets fallback to empty string instead of failing fast                                                | `auth/options.ts`                 |
| 16  | CRITICAL | server       | Missing spread operator corrupts Redis cache in database queue processor                                      | `processor.database.queue.ts:293` |
| 17  | HIGH     | server       | Prize distribution logic is inverted (`!quiz.prizePool`)                                                      | `HostManager.ts:498`              |
| 18  | HIGH     | server       | `timeToAnswer` is always negative                                                                             | `ParticipantManager.ts:494`       |
| 19  | HIGH     | server       | `longestStreak` resets to 0 on wrong answer -- should track max                                               | `ParticipantManager.ts:508`       |
| 20  | HIGH     | server       | Host close handler deletes wrong key from wrong map                                                           | `HostManager.ts:107`              |

---

## Detailed Reports (Deep Review)

### Server (`apps/server`) -- 151 bugs total

- [01-controllers.md](./server/01-controllers.md) -- All controller files (83 bugs: 7 CRITICAL, 21 HIGH, 30 MEDIUM, 25 LOW)
- [02-sockets-cache-services.md](./server/02-sockets-cache-services.md) -- Sockets, cache, classes, queues, services, AI, routes, middlewares (68 bugs: 4 CRITICAL, 18 HIGH, 31 MEDIUM, 15 LOW)

### Orchestrator (`apps/orchestrator`) -- 48 bugs total

- [01-full-review.md](./orchestrator/01-full-review.md) -- All 13 orchestrator files (48 bugs: 9 CRITICAL, 20 HIGH, 14 MEDIUM, 5 LOW)

### Web (`apps/web`) -- 49 bugs total

- [01-full-review.md](./web/01-full-review.md) -- Pages, hooks, stores, middleware, routes, server actions (49 bugs: 4 CRITICAL, 13 HIGH, 20 MEDIUM, 12 LOW)

### Packages (`packages/`) -- 25 bugs total

- [01-full-review.md](./packages/01-full-review.md) -- Database schemas, types, UI components (25 bugs: 1 CRITICAL, 4 HIGH, 15 MEDIUM, 5 LOW)

### Supplementary

- [05-lint-warnings.md](./05-lint-warnings.md) -- All 57 ESLint warnings breakdown (43x `no-explicit-any`, 10x `no-non-null-assertion`, 4x other)
