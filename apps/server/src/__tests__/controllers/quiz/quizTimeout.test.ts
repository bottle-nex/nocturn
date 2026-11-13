import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildRouteApp } from '../../helpers/app.helper.ts';
import { bearerHeader } from '../../helpers/auth.helper.ts';
import authMiddleware from '../../../middlewares/auth.middleware.ts';
import QuizController, {
    QuizControllerAction,
} from '../../../controllers/quiz-controller/quizController.ts';

vi.hoisted(() => {
    process.env.SERVER_PLATFORM_AUTHORITY_KEYPAIR = 'test-platform-key';
});

const mocks = vi.hoisted(() => ({
    findHost: vi.fn(),
    getEscrow: vi.fn(),
    subscription: vi.fn(),
    generateCode: vi.fn(),
    findSession: vi.fn(),
    findQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    updateSession: vi.fn(),
}));
vi.mock('../../../services/init.services.ts', () => ({
    solanaServiceInstance: { get_escrow_state: mocks.getEscrow },
}));
vi.mock('../../../middlewares/subscription.middleware.ts', () => ({
    default: { get_user_subscription: mocks.subscription },
}));
vi.mock('../../../class/quizAction.ts', () => ({
    default: { generateUniqueCode: mocks.generateCode },
}));
vi.mock('@nocturn/database', () => ({
    QuizStatus: { TIMED_OUT: 'TIMED_OUT' },
    SessionStatus: { TIMED_OUT: 'TIMED_OUT' },
    prisma: {
        gameSession: { findUnique: mocks.findSession },
        quiz: { findFirst: mocks.findQuiz, findUnique: mocks.findQuiz },
        user: { findUnique: mocks.findHost },
        $transaction: async (
            fn: (tx: {
                quiz: { updateMany: typeof mocks.updateQuiz };
                gameSession: { updateMany: typeof mocks.updateSession };
            }) => Promise<void>,
        ) =>
            fn({
                quiz: { updateMany: mocks.updateQuiz },
                gameSession: { updateMany: mocks.updateSession },
            }),
    },
}));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.findSession.mockResolvedValue({ status: 'LIVE' });
    mocks.findQuiz.mockResolvedValue({ id: 'quiz', status: 'LIVE' });
    mocks.updateQuiz.mockResolvedValue({ count: 1 });
    mocks.findHost.mockResolvedValue({ id: 'host' });
    mocks.subscription.mockResolvedValue('FREE');
    mocks.generateCode.mockResolvedValue('code');
});

describe('quiz timeout', () => {
    it('times out a live quiz so its stake can be refunded', async () => {
        await QuizController.handle_end('session');
        expect(mocks.updateQuiz).toHaveBeenCalledWith({
            where: { id: 'quiz', status: 'LIVE' },
            data: { status: 'TIMED_OUT', endedAt: expect.any(Date) },
        });
        expect(mocks.updateSession).toHaveBeenCalledOnce();
    });
    it.each(['CANCELLED', 'COMPLETED', 'PAYOUT_PENDING', 'PAYOUT_COMPLETED', 'TIMED_OUT'])(
        'preserves %s quizzes',
        async (status) => {
            mocks.findQuiz.mockResolvedValue({ id: 'quiz', status });
            await QuizController.handle_end('session');
            expect(mocks.updateQuiz).not.toHaveBeenCalled();
        },
    );
    it('does not overwrite a cancellation that wins the race with timeout', async () => {
        mocks.updateQuiz.mockResolvedValue({ count: 0 });
        await QuizController.handle_end('session');
        expect(mocks.updateQuiz).toHaveBeenCalledOnce();
        expect(mocks.updateSession).not.toHaveBeenCalled();
    });
});

const launchApp = buildRouteApp(
    'post',
    '/quiz/:quizId',
    authMiddleware,
    QuizController.process(QuizControllerAction.LAUNCH),
);
describe('launch after refund', () => {
    it('rejects a quiz already cancelled in the database', async () => {
        mocks.findQuiz.mockResolvedValue({ id: 'quiz', status: 'CANCELLED' });
        await request(launchApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send({ title: 'Quiz', questions: [] })
            .expect(409);
    });
    it('rejects an on-chain cancellation before database confirmation arrives', async () => {
        mocks.findQuiz.mockResolvedValue({
            id: 'quiz',
            status: 'CREATED',
            escrowPda: 'escrow',
            hostWalletPubkey: 'wallet',
        });
        mocks.getEscrow.mockResolvedValue({ cancelled: true });
        await request(launchApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send({ title: 'Quiz', questions: [] })
            .expect(409);
        expect(mocks.getEscrow).toHaveBeenCalledWith('quiz', 'wallet');
    });
});
