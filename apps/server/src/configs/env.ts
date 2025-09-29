import dotenv from 'dotenv';
import { z } from 'zod';

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
    SERVER_WEB_URL: z.string().min(1),
});

function parseEnv() {
    try {
        return envSchema.parse(process.env);
    } catch {
        console.error('Environment validation failed:');
        process.exit(1);
    }
}

export const env = parseEnv();
export const isDevelopment = () => env.SERVER_NODE_ENV === 'development';
export const isProduction = () => env.SERVER_NODE_ENV === 'production';
