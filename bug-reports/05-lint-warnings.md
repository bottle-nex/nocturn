# ESLint Warnings Report

**Total**: 57 warnings (0 errors)
**Breakdown**: 43x `no-explicit-any` | 10x `no-non-null-assertion` | 4x other

All warnings are in `apps/server`. The `apps/web` and `packages/ui` passed lint with 0 warnings.

---

## By File

### `src/cache/redis.cache.ts` (7 warnings)

- Line 26: `no-non-null-assertion`
- Lines 63, 72, 272, 337, 407, 418: `no-explicit-any`
- Line 570: `no-non-null-assertion`

### `src/class/quizAction.ts` (1 warning)

- Line 188: `no-explicit-any`

### `src/class/quizSettings.ts` (1 warning)

- Line 29: `no-explicit-any`

### `src/controllers/appReview-controller/readReviewController.ts` (3 warnings)

- Lines 13, 18, 84: `no-explicit-any`

### `src/controllers/live-quiz-controller/getLiveQuizDataController.ts` (2 warnings)

- Line 115: `no-non-null-assertion`
- Line 239: `no-explicit-any`

### `src/controllers/premium-controller/verifySessionController.ts` (1 warning)

- Line 23: `no-explicit-any`

### `src/controllers/quiz-controller/getQuizController.ts` (1 warning)

- Line 93: `no-non-null-assertion`

### `src/controllers/quiz-controller/launchQuizController.ts` (1 warning)

- Line 68: `no-non-null-assertion`

### `src/controllers/quiz-controller/quizController.ts` (1 warning)

- Line 297: `no-non-null-assertion`

### `src/controllers/webhook-controller/dodoWebhookController.ts` (1 warning)

- Line 42: `no-explicit-any`

### `src/gen/agents/Model.ts` (1 warning)

- Line 34: `no-explicit-any`

### `src/gen/state/quiz-agent.state.ts` (1 warning)

- Line 45: `no-explicit-any`

### `src/queue/database/processor.database.queue.ts` (1 warning)

- Line 32: `no-explicit-any`

### `src/scripts/remove-logs.ts` (1 warning)

- Line 67: `no-non-null-assertion`

### `src/sockets/CollaborationManager.ts` (4 warnings)

- Lines 138, 187, 210, 238: `no-explicit-any`

### `src/sockets/HostManager.ts` (6 warnings)

- Lines 117, 162, 187, 195, 207: `no-explicit-any`
- Line 259: `no-non-null-assertion`

### `src/sockets/ParticipantManager.ts` (8 warnings)

- Lines 143, 175, 335, 392, 432: `no-explicit-any`
- Lines 456, 487, 499: `no-non-null-assertion`

### `src/sockets/SpectatorManager.ts` (5 warnings)

- Lines 159, 192, 305, 350: `no-explicit-any`
- Line 299: `no-non-null-assertion`

### `src/sockets/SubscriberManager.ts` (3 warnings)

- Lines 47, 229, 249: `no-explicit-any`

### `src/types/webhook-types.ts` (1 warning)

- Line 22: `no-explicit-any`

---

## Recommendation

The `no-explicit-any` warnings cluster in socket managers and cache layers. These should be typed with proper interfaces to prevent runtime type errors in production. The `no-non-null-assertion` warnings indicate places where null checks are skipped — each one is a potential `Cannot read property of null` crash.
