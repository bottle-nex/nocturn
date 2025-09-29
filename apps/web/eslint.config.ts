import { nextJsConfig } from '@repo/eslint-config/next-js';
import prettierConfig from 'eslint-config-prettier';

const config = [
    {
        ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
    },
    ...(Array.isArray(nextJsConfig) ? nextJsConfig : [nextJsConfig]),
    {
        // Add this to fix the TypeScript parser issue
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname, // or process.cwd() for older Node versions
            },
        },
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
            'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
        },
    },
    prettierConfig,
];

export default config;
