---
title: Migrate Nocturn quiz-generation AI from Google Gemini (direct) to OpenRouter
date: 2026-09-17
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
depth: standard
risk: medium
---

# Migrate quiz-generation AI from direct Google Gemini to OpenRouter

## Goal

Route every LLM call in Nocturn's quiz-generation agent through OpenRouter instead of calling Google's Generative AI API directly, with **no change in user-visible behavior**: same prompts, same schemas (unchanged — no bound relaxed), same temperature, same SSE stream, same database writes. The model moves within the Gemini family (`gemini-2.5-flash` -> `gemini-2.5-flash-lite`) for cost.

## Critical context discovered during research

The request said "shift from OpenAI to OpenRouter". The codebase does **not** use OpenAI.

- The only LLM in the repo is **Google Gemini 2.5 Flash**, instantiated once in `apps/server/src/gen/agents/Model.ts:60` via `ChatGoogleGenerativeAI` from `@langchain/google-genai`.
- `@langchain/openai` (v1.2.2) is already installed in `apps/server/package.json` but is **imported nowhere** in source. Verified: `grep -rni "openai" apps/server/src apps/orchestrator/src apps/api/src packages/*/src` returns zero hits.
- The only AI env var is `SERVER_GEMINI_API_KEY` (`apps/server/src/configs/env.ts:25`). No OpenAI key exists in `.env`, `.env.prod`, or `apps/server/.env.test`.
- `apps/api` (Cloudflare Worker), `apps/orchestrator`, `apps/web`, and all `packages/*` have **no** LLM dependencies.

So the migration is **Gemini → OpenRouter**, and the user has chosen the target model `google/gemini-2.5-flash-lite` — the same Gemini family the prompts and schemas were written against, at roughly 5.4x lower cost (~$0.0016/quiz vs ~$0.0087).

**Consequence: zero new dependencies.** `@langchain/openai` is already installed and already covered by the esbuild `--external:@langchain/*` flag in `apps/server/package.json`. No build-config change is needed.

## Current architecture (what must not break)

```
POST /api/ai/generate  (SSE)
  └─ apps/server/src/controllers/ai-controller/generateNewQuizController.ts
       └─ quizAgentGraph.stream(...)              (LangGraph, streamMode: 'updates')
            └─ apps/server/src/gen/agents/Agent.ts  — 5 nodes
                 ├─ TOP_LEVEL_AGENT     → model.top_level_agent
                 ├─ DIFFICULTY_ASKER    → model.difficulty_asker
                 ├─ COMPUTE_DIFFICULTY  → model.text_to_number_difficulty
                 ├─ PLANNER             → model.planner
                 └─ EXECUTOR            → model.executor
                      └─ all five are RunnableSequence.from([prompt, model.withStructuredOutput(schema)])
                           └─ apps/server/src/gen/agents/Model.ts   ← THE ONLY FILE THAT TOUCHES THE PROVIDER
```

`Model` is constructed once in `apps/server/src/services/init.services.ts` (`model = new Model()`) and exported as a module singleton. `Agent.ts` only calls `model.<chain>.invoke(...)` — it never sees the provider. **The provider surface is exactly one file.**

## High-level technical design

Replace the single `ChatGoogleGenerativeAI` instantiation with a `ChatOpenAI` instance pointed at OpenRouter's OpenAI-compatible endpoint. Everything downstream — the five `RunnableSequence`s, their generic type parameters, `Agent.ts`, the graph, the controller, the SSE contract, the Prisma writes — is untouched.

```ts
// apps/server/src/gen/agents/Model.ts
import { ChatOpenAI } from '@langchain/openai';

this.model = new ChatOpenAI({
    model: 'google/gemini-2.5-flash-lite',
    temperature: 0.2,
    apiKey: env.SERVER_OPENROUTER_API_KEY,
    configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': env.SERVER_WEB_URL,
            'X-Title': 'Nocturn',
        },
    },
});
```

`configuration?: ClientOptions` is confirmed present on `ChatOpenAI` in the installed v1.2.2 (`apps/server/node_modules/@langchain/openai/dist/chat_models/base.d.ts:135`), and `ClientOptions` carries `baseURL` and `defaultHeaders`. The two headers are OpenRouter's optional attribution headers — harmless, and they make the app identifiable on the OpenRouter dashboard.

The public field type changes from `ChatGoogleGenerativeAI` to `ChatOpenAI`; nothing outside `Model.ts` references that type.

---

## The structured-output problem — found, verified, and solved

This was the one place where "same model, different route" did **not** mean "same code path". It was
verified by reading the installed library source, then confirmed against the live API.

### What the Gemini path did

`@langchain/google-genai/dist/chat_models.js:626-670` — `withStructuredOutput(schema)` with no config
falls to the `else` branch: `responseSchema` + a plain `JsonOutputParser`. The Zod bounds
(`.min(100)`, `.max(100)`, `.length(4)`, …) shipped to Gemini as JSON-Schema **hints** and were
**never enforced on the response**.

### What the naive OpenAI/OpenRouter swap did

Passing the **Zod object** to `ChatOpenAI.withStructuredOutput` triggers two changes at once:

1. `_getResponseFormat` (`@langchain/openai/dist/chat_models/base.js:249`) routes any Zod schema through
   `interopZodResponseFormat`, which for Zod v4 **hardcodes `strict: true`** and emits
   `additionalProperties: false`, an all-fields `required` array, and a `"title": "extract"` on every
   subschema. The `strict: config?.strict` at `base.js:512` is dead for Zod inputs.
2. The output parser becomes `StructuredOutputParser.fromZodSchema(schema)`, which runs `schema.parse()`.
   The Chat Completions path never populates `additional_kwargs.parsed` (only
   `dist/converters/responses.js` does, and `_modelPrefersResponsesAPI` matches only `gpt-5.2-pro`), so
   this parser is **always** active — not "likely".

Net effect: every Zod bound became a hard runtime throw. **Confirmed against the live API** — the
executor node failed on the very first real generation:

```
[FAIL] executor (120451ms) — ZodError: { "code": "too_big", "maximum": 100, "inclusive": true }
```

The 120s was LangChain retrying the failing strict request. On the `CHANGE_REQUEST` / `REPLACE` path this
is worse than a failed generation: `Agent.planner_node` commits `tx.question.deleteMany(...)` **before**
`executor_node` ever calls the model, so an executor throw would delete the user's existing questions and
produce nothing to replace them.

### The fix — bind a plain JSON Schema, not the Zod object

Both problem branches key on `isInteropZodSchema`. Handing `withStructuredOutput` a plain JSON Schema
instead makes `base.js:532` select `JsonOutputParser` and leaves `_getResponseFormat` untouched — which
reproduces the Gemini semantics exactly. `apps/server/src/gen/agents/Model.ts` now does:

```ts
import { toJsonSchema } from '@langchain/core/utils/json_schema';

function as_json_schema(schema: any): any {
    return toJsonSchema(schema);
}

// ...
this.model.withStructuredOutput(as_json_schema(executor_schema))
```

Every constraint and every `.describe()` string still reaches the model in the emitted schema, so
generation is steered exactly as before — they simply are not enforced on the way back, exactly as under
Gemini. **The schemas in `createNewQuizSchema.ts` are unchanged**; no bound was relaxed.

Verified live against the real `Model` class:

```
[PASS] top_level_agent             1507ms   intent=TOPIC_PROVIDED
[PASS] difficulty_asker            1274ms
[PASS] text_to_number_difficulty    957ms   difficulty=5
[PASS] planner                     1430ms   operationType=REPLACE
[PASS] executor                    5123ms   questions=8 options=4,4,4,4,4,4,4,4
                                            correctAnswers=2,0,1,0,1,1,1,0
```

Executor went from a 120.5s failure to a 5.1s success. One observed `userResponse` came back at 165
characters against a `.max(100)` bound — proof the bound is a hint, not a gate, which is what it always
was on Gemini.

## Implementation units

### U1 — Add `SERVER_OPENROUTER_API_KEY` to env validation

**Files:** `apps/server/src/configs/env.ts`

- Add `SERVER_OPENROUTER_API_KEY: z.string().min(1, 'OpenRouter API Key is required'),`
- Remove `SERVER_GEMINI_API_KEY: z.string().min(1, 'Gemini API Key is required'),` (line 25).

Removing the Gemini key from the Zod schema is safe — Zod object schemas here are non-strict, so a leftover `SERVER_GEMINI_API_KEY` in a `.env` file is ignored, not rejected. Leaving it *in* the schema would be worse: it would keep forcing operators to hold a Gemini key they no longer use.

> **Boot-failure ordering — read this before deploying.** `parseEnv()` calls `process.exit(1)` on any validation failure (`apps/server/src/configs/env.ts:65`). If the server image ships with this change before `SERVER_OPENROUTER_API_KEY` exists in the production `.env`, **the container will crash-loop on start**. See the Rollout section for the required ordering.

### U2 — Swap the provider in `Model.ts`  ✅ done

**Files:** `apps/server/src/gen/agents/Model.ts`

- Replace the `@langchain/google-genai` import with `import { ChatOpenAI } from '@langchain/openai';`
- Add `import { toJsonSchema } from '@langchain/core/utils/json_schema';`
- Change the field declaration `public model: ChatGoogleGenerativeAI;` → `public model: ChatOpenAI;`
- Replace the constructor call with the `ChatOpenAI` block from the design section above.
- Wrap every schema at its `withStructuredOutput` call site in the `as_json_schema` helper, so a plain
  JSON Schema is bound rather than the Zod object. This is what preserves Gemini's non-validating
  semantics — see the structured-output section for why it is mandatory, not cosmetic.
- **Do not touch** the five `RunnableSequence.from([...])` generic type parameters, and **do not** edit
  `createNewQuizSchema.ts`. Verified: `npx tsc --noEmit` reports 0 errors under `src/gen/`.

### U3 — Env files and documentation

**Files:** `.env.example`, `apps/server/.env.test`

- `.env.example`: under the `Server / Api` section, add `SERVER_OPENROUTER_API_KEY=your-openrouter-api-key`. Note this file currently does **not** list `SERVER_GEMINI_API_KEY` at all, nor `SERVER_PLATFORM_AUTHORITY_KEYPAIR`, `SERVER_SOLANA_RPC_URL`, `SERVER_DODO_PRO_PRODUCT_ID`, or `SERVER_DODO_ENTERPRISE_PRODUCT_ID` — it has drifted from `env.ts`. Adding the new key is in scope; fixing the whole drift is **out of scope** for this plan (flagged below).
- `apps/server/.env.test:29`: replace `SERVER_GEMINI_API_KEY=test-gemini-api-key-placeholder` with `SERVER_OPENROUTER_API_KEY=test-openrouter-api-key-placeholder`, keeping the existing "never called at runtime (LangChain/model is mocked)" comment.

- **The developer's local repo-root `.env`** also needs the key. `apps/server/src/configs/env.ts:5` calls `dotenv.config({ path: '../../.env' })`, so without it the server exits at boot before U5 can run.

Leaving `.env.test` stale would break the whole `vitest` suite at import time, since every test loads `configs/env.ts`.

### U4 — Dependency cleanup and lockfile

**Files:** `apps/server/package.json`, `pnpm-lock.yaml`

- Remove `"@langchain/google-genai": "^2.1.10"` from `apps/server/package.json` dependencies.
- **Do not** add `@langchain/openai` — it is already there at `^1.2.2`.
- **Do not** change the `build` script. Its `--external:@langchain/*` glob already covers `@langchain/openai`.
- Run `pnpm install` at the repo root and **commit the regenerated `pnpm-lock.yaml`**.

> **Docker build breaks without the lockfile commit.** `apps/server/Dockerfile:17` runs `pnpm install --frozen-lockfile`. A `package.json` change without a matching lockfile update fails the image build in `.github/workflows/deploy.yml`.

If you would rather minimise the diff, keeping `@langchain/google-genai` installed-but-unused is harmless at runtime (it is never imported, and esbuild externalises it). Removing it is the cleaner end state and costs one lockfile regeneration. Recommended: remove.

### U5 — Verification against a real key  ✅ done

Covered in Test Scenarios below. Not optional: it is the only thing that converts "the code compiles" into
"the quiz still generates" — and it is what caught the structured-output problem, which no automated check
in this repo would have.

---

## Edge cases and their treatment

| # | Edge case | Treatment |
|---|---|---|
| 1 | **Zod post-validation newly enforced** (see the structured-output section) | **Solved** by binding plain JSON Schema — `JsonOutputParser` is selected and no bound is enforced, matching Gemini. Schemas left untouched. |
| 2 | **Production boot crash on missing env var** — `parseEnv()` calls `process.exit(1)` | Ordering enforced in Rollout: add the key to the host `.env` **before** pulling the new image. |
| 3 | **`--frozen-lockfile` Docker failure** | U4 commits the regenerated `pnpm-lock.yaml`. |
| 4 | **Stale `apps/server/.env.test`** breaks the entire vitest suite at import | U3 updates it. |
| 5 | **OpenRouter rejects unsupported JSON-Schema keywords** (`minLength`, `maxLength`, `minimum`, `maximum`, `minItems`, `maxItems`, plus the root `$schema`) with a 400 | **Verified not to happen.** All five nodes returned successfully against the live API with every keyword present in the emitted schema. |
| 6 | **`strict` cannot be left unset while a Zod object is passed** — `interopZodResponseFormat` hardcodes `strict: true` for Zod v4, adding `additionalProperties: false`, all-fields-`required`, and a `"title": "extract"` on every subschema | **Solved.** Binding a plain JSON Schema via `toJsonSchema` bypasses `_getResponseFormat`'s rewrite entirely, so none of those are emitted. |
| 7 | **Zod v4 (`4.3.2`) with `z.int()`** — JSON Schema conversion | `z.int()` maps to `{type: "integer"}`; `@langchain/core` v1.1.15 handles Zod v4. Confirm in U5 by inspecting one outbound request. |
| 8 | **Gemini reasoning/thinking tokens** — `gemini-2.5-flash-lite` thinking defaults | The current direct call also does not set a thinking budget, so default-on thinking is already today's behaviour. Parity holds; change nothing. |
| 9 | **OpenRouter 402 (out of credits) / 429 (rate limited)** | The silent-SSE-close on error is a **pre-existing** weakness in `generateNewQuizController.ts:99-108` and stays out of scope. But prepaid-credit depletion is a *new* self-arriving failure mode: enable auto-top-up or a balance alert on the OpenRouter account (rollout step 4). |
| 10 | **Retry-count parity** | Both providers inherit the LangChain core retry default; neither sets a custom `maxRetries`. Leave unset. |
| 11 | **`nginx /api/` has no `proxy_read_timeout` or `proxy_buffering off`** (`deploy/nginx/nocturn.conf:18-26`) while `/ws` has `86400s` | Pre-existing 60s-default risk for long SSE generations, unchanged by this migration. Flagged below, not fixed here. |
| 12 | **The `model` singleton in tests** | `apps/server/src/__tests__/setup/test.setup.ts:80` mocks the whole `init.services` module with `model: {}`. No AI-specific tests exist. The mock is provider-agnostic and needs no change. |
| 13 | **Model-id typo is silent until runtime** | `google/gemini-2.5-flash-lite` — exact string. A wrong id returns an OpenRouter 404 only when a quiz is generated, never at boot. Caught by U5. |
| 14 | **`knip` unused-dependency check** | `knip.json` only configures the `apps/web` workspace, so removing a server dependency does not affect it. |
| 15 | **Frontend / contract / DB** | Zero changes. `Agent.ts` SSE message shapes, `packages/contract`, `packages/types`, and every Prisma write are untouched by design. |
| 16 | **`.env.prod` is tracked in git** despite `.gitignore:11` (gitignore does not apply to already-committed files) | **Never add `SERVER_OPENROUTER_API_KEY` there.** The production value goes only into the host-side `.env` that `docker-compose.prod.yml` mounts via `env_file`. The existing committed secrets in that file need their own remediation ticket. |
| 17 | **Data loss on `CHANGE_REQUEST`/`REPLACE` if the executor throws** — `planner_node` commits `question.deleteMany` before `executor_node` calls the model | No longer reachable via schema violations (edge case 1 solved), but the ordering stays fragile for any executor-side failure. Out of scope; worth its own ticket to move the delete into the executor transaction. |
| 18 | **CI does not guard this change** — `.github/workflows/ci.yaml` triggers only on PRs to `dev` and runs no `pnpm test`; `apps/server` has no `check-types` script; `pnpm build` is esbuild and does not typecheck | The automated checks below are **local pre-merge obligations**, not CI gates. Run them by hand. |

---

## Test scenarios

**Local pre-merge obligations (not CI gates — see edge case 18):**

1. `cd apps/server && pnpm test` — vitest suite. Guards edge cases 4 and 12. Note 2 failures in
   `createQuizController.test.ts` are **pre-existing** (confirmed identical on a stashed baseline).
2. `cd apps/server && pnpm lint` — 0 errors (75 pre-existing warnings).
2b. `cd apps/server && npx tsc --noEmit -p tsconfig.json` — nothing new under `src/gen/`. `pnpm build`
   is esbuild and does **not** typecheck, so this is the only check covering U2's field-type change.
   (Two pre-existing Prisma-drift errors in the template controllers are unrelated.)
3. `cd apps/server && pnpm build` — esbuild bundle succeeds. Guards the externals assumption in U4.

**Manual, against a real `SERVER_OPENROUTER_API_KEY` (this is U5 — all five nodes must be exercised).**
Use a separate, credit-capped verification key; the production key belongs only on the production host:

4. **TOP_LEVEL_AGENT + DIFFICULTY_ASKER** — send "make a quiz about the French Revolution" to a fresh session. Expect: intent `TOPIC_PROVIDED`, an agent message, and a `DIFFICULTY` system element streamed over SSE. Session step becomes `WAIT_DIFFICULTY`.
5. **COMPUTE_DIFFICULTY + PLANNER + EXECUTOR** — reply "make it hard". Expect: difficulty persisted as a 1–5 integer, a quiz row created with a title, then 1–10 questions each with exactly 4 options, a `correctAnswer` in 0–3, an explanation, a hint, and a difficulty. `STREAM.QUIZ` arrives last and the session step becomes `DONE`.
6. **IRRELEVANT branch** — send "hello there" to a fresh session. Expect a friendly agent reply, no quiz created, graph ends at `__end__`.
7. **CHANGE_REQUEST / REPLACE** — on a session with an existing quiz, send "make these harder". Expect old questions deleted and fresh ones created, `orderIndex` restarting at 0.
8. **CHANGE_REQUEST / APPEND** — send "add 3 more questions". Expect old questions kept and new `orderIndex` values continuing from `existingQuestionsCount`.
9. **Schema-bound probe (targets edge cases 1, 5, 6)** — instantiate the real `Model` class and invoke all
   five chains directly against the live API, logging the emitted JSON Schema and each parsed result.
   Confirm no Zod/`StructuredOutputParser` error is thrown. Already run: all five passed, executor at
   5.1s returning 8 questions × 4 options. A `userResponse` of 165 chars against a `.max(100)` bound
   confirms bounds are hints, not gates — as on Gemini.
**Manual, with the key deliberately absent:**

10. **Missing-key boot check (targets edge case 2)** — start the server with `SERVER_OPENROUTER_API_KEY` unset. Expect the Zod error block to name the variable and exit 1 cleanly. This is a deliberate check that the failure mode is loud, not a bug.

---

## Rollout and rollback

**The deploy is automatic, so the key must land on the host first.**
`.github/workflows/deploy.yml` triggers on `push: branches: [main]` and its job SSHes in and runs
`docker pull`, `prisma migrate deploy`, then `docker compose up -d` with **no manual gate**. Merging *is*
deploying — there is no window after the merge in which to add the env var. With
`restart: unless-stopped` (`docker-compose.prod.yml:14`) and `parseEnv()`'s `process.exit(1)`, a missing
`SERVER_OPENROUTER_API_KEY` crash-loops the container until someone SSHes in.

1. **On the production host, add `SERVER_OPENROUTER_API_KEY=...` to `.env`** — before the PR is merged.
   `docker-compose.prod.yml:17` mounts that file via `env_file`. Keep `SERVER_GEMINI_API_KEY` in place for
   now; it is ignored, and keeping it makes a revert a one-command operation. **Do not put the key in
   `.env.prod`** — that file is tracked in git (edge case 16).
2. Enable OpenRouter auto-top-up, or a credit-balance alert, on the account backing that key (edge case 9).
3. Run the local pre-merge checks below, then merge to `main`. The image build and deploy fire automatically.
4. Watch the first boot, then generate one quiz end-to-end against production as a smoke check.
5. Once the rollback window has passed, **revoke the Gemini API key** in the Google AI Studio console and
   remove `SERVER_GEMINI_API_KEY` from the host `.env`. Revocation — not deletion from `.env` — is what
   actually ends the exposure, which matters here because the same value also sits in the git-tracked
   `.env.prod`.

**Rollback:** `git revert` the commit and redeploy. Because `SERVER_GEMINI_API_KEY` stays in the host
`.env` until step 5, the reverted image boots with no further ops action.

## Explicitly out of scope

Real issues found during research and review that this change deliberately does **not** fix:

- **`.env.prod` is committed to git** with live `SERVER_AWS_SECRET_ACCESS_KEY`, `SERVER_JWT_SECRET`,
  `SERVER_DODO_API_KEY`, `SERVER_PLATFORM_AUTHORITY_KEYPAIR`, `GITHUB_TOKEN`, `DATABASE_URL` and
  `GOOGLE_CLIENT_SECRET`. `.gitignore:11` lists it but is inert — the file was committed first. Needs its
  own ticket: rotate every value, then `git rm --cached .env.prod`.
- `generateNewQuizController.ts:99-108` swallows mid-stream errors — on any model failure the SSE stream
  just ends and the user sees nothing.
- `Agent.planner_node` commits `question.deleteMany` before `executor_node` runs, so any executor-side
  failure on the REPLACE path destroys the user's questions with no replacement (edge case 17).
- `deploy/nginx/nocturn.conf:18-26` — the `/api/` block lacks `proxy_read_timeout` and
  `proxy_buffering off`, so long SSE generations can be cut at nginx's 60s default. Note the executor now
  runs ~5s, well inside that; the pre-broken Zod path took 120s and would have hit it.
- CI runs no tests and no server typecheck (edge case 18).
- `.env.example` has drifted from `env.ts` and is still missing four required variables after this change
  (`SERVER_PLATFORM_AUTHORITY_KEYPAIR`, `SERVER_SOLANA_RPC_URL`, `SERVER_DODO_PRO_PRODUCT_ID`,
  `SERVER_DODO_ENTERPRISE_PRODUCT_ID`).
- No fallback/secondary provider. OpenRouter already does model-level failover server-side.
- OpenRouter's data-handling posture (account prompt-logging/training setting, and whether provider
  routing for `google/gemini-2.5-flash-lite` is pinned) is a product decision, not a code one — worth
  confirming on the dashboard since user-authored quiz prompts now transit a new processor.

## Files changed (summary)

| File | Change |
|---|---|
| `apps/server/src/gen/agents/Model.ts` | `ChatGoogleGenerativeAI` → `ChatOpenAI` at OpenRouter; schemas bound as plain JSON Schema |
| `apps/server/src/configs/env.ts` | `SERVER_GEMINI_API_KEY` → `SERVER_OPENROUTER_API_KEY` |
| `apps/server/.env.test` | Same key rename |
| `.env.example` | Add `SERVER_OPENROUTER_API_KEY` |
| `apps/server/package.json` | Drop `@langchain/google-genai` |
| `pnpm-lock.yaml` | Regenerated (required by `--frozen-lockfile`) |
| `.env` (local, gitignored) | `SERVER_OPENROUTER_API_KEY` added |
| `.env.prod` | **No change — tracked in git, never put the key here** |
| `apps/server/src/gen/schemas/createNewQuizSchema.ts` | **No change** — the JSON-Schema binding removed the need |

Everything else — `Agent.ts`, the LangGraph state, the prompts, the controllers, the contract, the
frontend, the database — is untouched.
