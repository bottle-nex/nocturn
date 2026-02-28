import express, { type Express, type Router, type RequestHandler } from 'express';
import cookieParser from 'cookie-parser';

interface BuildTestAppOptions {
    /** Base path to mount the router. Defaults to '/api/v1'. */
    mountPath?: string;
    /** Enable cookie-parser for refresh-token cookie tests. Defaults to true. */
    withCookies?: boolean;
}

/**
 * Creates a minimal Express app with a full router mounted at a base path.
 *
 * Why this exists:
 *   apps/server/src/index.ts cannot be imported in tests — it calls
 *   server.listen(), initialises WebSockets, and starts cron jobs.
 *   Each test file calls buildTestApp() with only the router it needs,
 *   giving complete isolation between test suites.
 *
 * What is included:
 *   - express.json()           body parsing for all non-webhook routes
 *   - cookie-parser            for refresh-token cookie tests (optional)
 *   - the provided router      mounted at mountPath
 *
 * What is deliberately excluded:
 *   - WebSocket server
 *   - CORS headers (irrelevant for Supertest, which does not enforce CORS)
 *   - server.listen()          Supertest manages its own in-process connection
 *   - initServices()           mocked globally in test.setup.ts
 */
export function buildTestApp(router: Router, options: BuildTestAppOptions = {}): Express {
    const { mountPath = '/api/v1', withCookies = true } = options;

    const app = express();
    app.use(express.json());

    if (withCookies) {
        app.use(cookieParser());
    }

    app.use(mountPath, router);

    return app;
}

/**
 * Creates a minimal Express app with a single route handler.
 *
 * Useful for testing individual controllers or middleware in total isolation
 * without importing any router file.
 *
 * Example:
 *   const app = buildRouteApp('post', '/quiz/create-quiz',
 *     authMiddleware, createQuizController);
 */
export function buildRouteApp(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    path: string,
    ...handlers: RequestHandler[]
): Express {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app[method](path, ...handlers);
    return app;
}
