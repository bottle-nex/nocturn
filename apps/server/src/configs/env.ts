import dotenv from 'dotenv';
import { z } from 'zod';
import chalk from 'chalk';

dotenv.config({ path: '../../.env' });

const envSchema = z.object({
    SERVER_PORT: z
        .string()
        .default('8080')
        .transform((val) => parseInt(val, 10)),
    SERVER_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SERVER_JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    SERVER_AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS Access Key ID is required'),
    SERVER_AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS Secret Access Key is required'),
    SERVER_AWS_REGION: z.string().default('eu-north-1'),
    SERVER_AWS_BUCKET_NAME: z.string().min(1, 'AWS Bucket name is required'),
    SERVER_AWS_CLOUDFRONT_DOMAIN: z.string().min(1, 'CloudFront domain is required'),
    SERVER_REDIS_URL: z.url('Invalid Redis URL'),
    SERVER_WEB_URL: z.string().min(1, 'Web URL is required'),
    DATABASE_URL: z.string().min(1, 'Database URL is required'),
    SERVER_GEMINI_API_KEY: z.string().min(1, 'Gemini API Key is required'),
    SERVER_DODO_API_KEY: z.string().min(1, 'Dodo API Key is required'),
    SERVER_DODO_WEBHOOK_SECRET: z.string().min(1, 'Dodo Webhook Secret is required'),
    SERVER_DODO_ENVIRONMENT: z.enum(['test', 'production']).default('test'),
    SERVER_DODO_PRO_PRODUCT_ID: z.string().min(1, 'Dodo Pro Product ID is required'),
    SERVER_DODO_ENTERPRISE_PRODUCT_ID: z.string().min(1, 'Dodo Enterprise Product ID is required'),
});

function parseEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error(`\n${chalk.bold('Environment validation failed:')}`);

            err.issues.forEach((issue) => {
                const envVar = issue.path.join('.');

                if (issue.code === 'invalid_type') {
                    const received = 'received' in issue ? issue.received : 'unknown';
                    if (received === 'undefined') {
                        console.error(`   ${envVar}: ${chalk.red('not provided')}`);
                    } else {
                        console.error(
                            `   ${envVar}: ${chalk.red(`expected ${issue.expected}, received ${received}`)}`,
                        );
                    }
                } else if (issue.code === 'too_small') {
                    console.error(`   ${envVar}: ${chalk.red(issue.message)}`);
                } else {
                    console.error(`   ${envVar}: ${chalk.red(issue.message)}`);
                }
            });

            console.error('\n');
        } else {
            console.error('Environment validation failed:', err);
        }
        process.exit(1);
    }
}

export const env = parseEnv();
export const isDevelopment = () => env.SERVER_NODE_ENV === 'development';
export const isProduction = () => env.SERVER_NODE_ENV === 'production';
