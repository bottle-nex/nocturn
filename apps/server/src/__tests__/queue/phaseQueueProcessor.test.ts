import { beforeEach, describe, expect, it, vi } from 'vitest';
import PhaseQueueProcessor from '../../../../orchestrator/src/client/phase-queue-processor';

const { process_job, add_job, handle_transition_phase } = vi.hoisted(() => ({
    process_job:
        vi.fn<(name: string, handler: (job: { data: unknown }) => Promise<void>) => void>(),
    add_job: vi.fn(),
    handle_transition_phase: vi.fn(),
}));

vi.mock('bull', () => ({
    default: vi.fn(function () {
        return { process: process_job, add: add_job };
    }),
}));

vi.mock('../../../../orchestrator/src/services/init-services', () => ({
    transitionWorkerInstance: { handle_transition_phase },
}));

vi.mock('../../../../orchestrator/src/configs/env', () => ({
    Env: { ORCH_REDIS_URL: 'redis://localhost:6379' },
}));

describe('PhaseQueueProcessor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        ['QUESTION_READING', 'QUESTION_ACTIVE'],
        ['QUESTION_ACTIVE', 'SHOW_RESULTS'],
    ])(
        'waits for the %s to %s transition before completing the job',
        async (fromPhase, toPhase) => {
            let finish_transition = () => {};
            handle_transition_phase.mockReturnValueOnce(
                new Promise<void>((resolve) => {
                    finish_transition = resolve;
                }),
            );
            new PhaseQueueProcessor();
            const registration = process_job.mock.calls[0];
            if (!registration) throw new Error('Phase processor was not registered');
            const [name, handler] = registration;
            const data = { gameSessionId: 'session', questionId: 'question', fromPhase, toPhase };
            let completed = false;
            const job = handler({ data }).then(() => {
                completed = true;
            });

            await Promise.resolve();
            expect(name).toBe('phase_transition');
            expect(handle_transition_phase).toHaveBeenCalledWith(data);
            expect(completed).toBe(false);

            finish_transition();
            await job;
            expect(completed).toBe(true);
        },
    );

    it('passes transition errors back to Bull', async () => {
        const error = new Error('Failed to read quiz from Redis');
        // Reject only after Bull has attached its handler to the job promise.
        let fail_transition = (_error: Error) => {};
        handle_transition_phase.mockReturnValueOnce(
            new Promise<void>((_resolve, reject) => {
                fail_transition = reject;
            }),
        );
        new PhaseQueueProcessor();
        const registration = process_job.mock.calls[0];
        if (!registration) throw new Error('Phase processor was not registered');
        const handler = registration[1];
        const job = handler({ data: { gameSessionId: 'session' } });
        const assertion = expect(job).rejects.toBe(error);

        fail_transition(error);
        await assertion;
    });

    it('propagates failure to enqueue the next phase', async () => {
        const error = new Error('Failed to enqueue results timer');
        add_job.mockRejectedValueOnce(error);
        const processor = new PhaseQueueProcessor();

        await expect(
            processor.schedule_phase_transition({
                gameSessionId: 'session',
                questionId: 'question',
                questionIndex: 0,
                fromPhase: 'QUESTION_ACTIVE',
                toPhase: 'SHOW_RESULTS',
                executeAt: Date.now(),
            }),
        ).rejects.toBe(error);
    });
});
