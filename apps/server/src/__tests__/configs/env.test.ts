import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import dotenv from 'dotenv';
import { buildSync } from 'esbuild';
import { describe, expect, it } from 'vitest';

const serverDir = resolve(__dirname, '../../..');
const repoDir = resolve(serverDir, '../..');
const fixtureEnv = {
    ...dotenv.parse(readFileSync(join(serverDir, '.env.test'))),
    SERVER_PORT: '4321',
    SERVER_PLATFORM_AUTHORITY_KEYPAIR: 'test-platform-authority-keypair',
    ORCH_REDIS_URL: 'redis://localhost:6379',
    ORCH_RESEND_KEY: 'workspace-env-test',
};

describe.each(['server', 'orchestrator'])('%s root environment', (app) => {
    it.each([false, true])('loads from any working directory (bundled: %s)', (bundle) => {
        const workspaceDir = mkdtempSync(join(serverDir, '.env-path-test-'));
        try {
            const appDir = join(workspaceDir, 'apps', app);
            const outfile = join(appDir, bundle ? 'dist/index.cjs' : 'src/configs/env.cjs');
            mkdirSync(dirname(outfile), { recursive: true });
            writeFileSync(join(workspaceDir, 'pnpm-workspace.yaml'), 'packages: []\n');
            writeFileSync(
                join(workspaceDir, '.env'),
                Object.entries(fixtureEnv)
                    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                    .join('\n'),
            );
            // A local .env must not take precedence over the workspace file.
            writeFileSync(join(appDir, '.env'), 'SERVER_PORT=9999\nORCH_RESEND_KEY=wrong\n');
            buildSync({
                entryPoints: [join(repoDir, 'apps', app, 'src/configs/env.ts')],
                outfile,
                bundle,
                platform: 'node',
                format: 'cjs',
                packages: 'external',
            });
            const childEnv = { ...process.env };
            for (const key of Object.keys(fixtureEnv)) {
                delete childEnv[key];
            }
            const readEnv = `const config = require(${JSON.stringify(outfile)});
                console.log(JSON.stringify(config.env || config.Env));`;
            for (const cwd of [workspaceDir, appDir, serverDir]) {
                const output = execFileSync(process.execPath, ['-e', readEnv], {
                    cwd,
                    env: childEnv,
                    encoding: 'utf8',
                });
                const lastLine = output.trim().split('\n').pop();
                if (!lastLine) {
                    throw new Error('Environment loader produced no output');
                }
                const loadedEnv = JSON.parse(lastLine);
                if (app === 'server') {
                    expect(loadedEnv.SERVER_PORT).toBe(4321);
                } else {
                    expect(loadedEnv.ORCH_RESEND_KEY).toBe('workspace-env-test');
                }
            }
        } finally {
            rmSync(workspaceDir, { recursive: true, force: true });
        }
    });
});
