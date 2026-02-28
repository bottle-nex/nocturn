import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// STEP 1: Populate process.env from .env.test BEFORE any module is imported.
//
// Why this must run first:
//   env.ts calls process.exit(1) when Zod validation fails. By loading
//   .env.test here — before controllers, middleware, or routes are imported
//   — we ensure env.ts sees valid values and does not exit the test process.
//
// dotenv does NOT overwrite existing env vars by default, so running the
// real server's dotenv.config (in env.ts) afterwards is harmless.
// We use override:true to guarantee .env.test wins over any ambient shell vars.
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

dotenv.config({
    path: resolve(__dir, '../../../.env.test'),
    override: true,
});

// ---------------------------------------------------------------------------
// STEP 2: Mock @nocturn/database globally.
//
// Every import of `prisma` across all controllers receives this mock.
// Individual tests override specific methods with vi.mocked(...).mockResolvedValueOnce()
// ---------------------------------------------------------------------------
vi.mock('@nocturn/database', () => ({
    prisma: {
        quiz: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            deleteMany: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        collaboratorInvitation: {
            findMany: vi.fn().mockResolvedValue([]),
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        collaborator: {
            createMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        // $transaction receives an async callback — invoke it with a mock tx object
        $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
            fn({
                collaboratorInvitation: {
                    findMany: vi.fn().mockResolvedValue([]),
                    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
                },
                collaborator: {
                    createMany: vi.fn().mockResolvedValue({ count: 0 }),
                },
            }),
        ),
        $queryRawUnsafe: vi.fn().mockResolvedValue([]),
    },
}));

// ---------------------------------------------------------------------------
// STEP 3: Mock init.services.ts globally.
//
// Path is resolved relative to THIS file's location:
//   src/__tests__/setup/test.setup.ts → ../../.. → src/services/init.services.ts
//
// This prevents ioredis, Bull, and LangChain from attempting real connections.
// Controllers that import named singletons (publisherInstance, etc.) receive
// these mock objects instead.
// ---------------------------------------------------------------------------
vi.mock('../../services/init.services.ts', () => ({
    publisherInstance: {
        set: vi.fn().mockResolvedValue('OK'),
        get: vi.fn().mockResolvedValue(null),
        del: vi.fn().mockResolvedValue(1),
    },
    subscriberInstance: {
        subscribe: vi.fn(),
        on: vi.fn(),
    },
    redisCacheInstance: {
        get: vi.fn(),
        set: vi.fn(),
    },
    email_service_queue_instance: {
        email_send_otp: vi.fn().mockResolvedValue(undefined),
        email_to_add_collaborators: vi.fn().mockResolvedValue(undefined),
    },
    phaseQueueInstance: {},
    quizManagerInstance: {},
    quizSettingInstance: {},
    collabStateCacheInstance: {},
    databaseQueueInstance: {},
    dodo_payment_service: {},
    dodo_webhook_service: {},
    chain: {},
    model: {},
    default: vi.fn(),
}));

// ---------------------------------------------------------------------------
// STEP 4: Suppress console output during test runs.
//
// Controllers log errors on failures. Suppress them so test output stays clean.
// Individual tests can restore with vi.spyOn(console, 'error') if needed.
// ---------------------------------------------------------------------------
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
