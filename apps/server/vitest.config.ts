import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['./src/__tests__/setup/test.setup.ts'],
        include: ['src/__tests__/**/*.test.ts'],
        isolate: true,
        reporter: 'verbose',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/controllers/**', 'src/middlewares/**'],
        },
    },
});
