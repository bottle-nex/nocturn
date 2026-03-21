module.exports = {
    apps: [
        {
            name: 'nocturn-web',
            cwd: './apps/web',
            script: 'node_modules/.bin/next',
            args: 'start',
            env: { NODE_ENV: 'production', PORT: 3000 },
            instances: 1,
            max_memory_restart: '1G',
        },
        {
            name: 'nocturn-server',
            cwd: './apps/server',
            script: 'dist/index.js',
            env: { NODE_ENV: 'production', SERVER_PORT: 8080 },
            instances: 1, // Must be 1 — WebSocket state is in-memory
            max_memory_restart: '1G',
            kill_timeout: 5000, // Allow 5s for graceful shutdown (2s drain + buffer)
        },
        {
            name: 'nocturn-orchestrator',
            cwd: './apps/orchestrator',
            script: 'dist/index.js',
            env: { NODE_ENV: 'production' },
            instances: 1,
            max_memory_restart: '512M',
        },
    ],
};
