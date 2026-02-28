import { z } from 'zod';
import chalk from 'chalk';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
    ORCH_REDIS_URL: z.url(),
    ORCH_REDIS_QUEUE_URL: z.url(),
    ORCH_RESEND_KEY: z.string(),
});

function validateUrl() {
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

export const Env = validateUrl();
