import { Router } from 'express';
const router: Router = Router();

// <---------------------- controllers ----------------------> //
import signInController from '../controllers/user-controller/signInController';
import getPreSignedUrlController from '../controllers/s3-controller/getPreSignedUrlController';
import upsertQuizController from '../controllers/quiz-controller/upsertQuizController';
import getQuizController from '../controllers/quiz-controller/getQuizController';
import getAllQuizController from '../controllers/quiz-controller/getAllQuizController';
import publishQuizController from '../controllers/quiz-controller/publishQuizController';
import launchQuizController from '../controllers/quiz-controller/launchQuizController';
import reviewAppController from '../controllers/appReview-controller/reviewAppController';
import participantJoinController from '../controllers/live-quiz-controller/participantJoinController';
import getLiveQuizDataController from '../controllers/live-quiz-controller/getLiveQuizDataController';
import spectatorJoinController from '../controllers/live-quiz-controller/spectatorJoinController';
import getReviewController from '../controllers/appReview-controller/getReviewController';
import getLiveQuizSummarizedData from '../controllers/live-quiz-controller/getLiveQuizSummarizedData';
import getSelectedQuestionDetails from '../controllers/live-quiz-controller/getSelectedQuestionDetails';
import getSpectatorOnCall from '../controllers/live-quiz-controller/getSpectatorOnCall';
import getParticipantsOnCall from '../controllers/live-quiz-controller/getParticipantsOnCall';
import getQuestionResults from '../controllers/live-quiz-controller/getQuestionResults';
import spectatorJoinQuizViaURLController from '../controllers/live-quiz-controller/spectatorJoinQuizViaURLController';
import permanently_delete_quiz_controller from '../controllers/quiz-controller/permanently_delete_quiz_controller';
import deleteQuizController from '../controllers/quiz-controller/deleteQuizController';
import get_trashed_quizzes_controller from '../controllers/quiz-controller/get_trashed_quizzes_controller';
import delete_trashed_quizzes_controller from '../controllers/quiz-controller/delete_trashed_quizzes_controller';
import restore_trashed_quiz_controller from '../controllers/quiz-controller/restore_trashed_quiz_controller';
import createQuizUsingAIController from '../controllers/ai-controller/createQuizUsingAIController';

// <---------------------- middlewares ----------------------> //
import authMiddleware from '../middlewares/authMiddleware';
import verifyQuizOwnershipMiddleware from '../middlewares/verifyQuizOwnershipMiddleware';
import Collaborator from '../controllers/collaborator-controller/join_collaborator_controller';
import chatWithAiController from '../controllers/ai-controller/chatWithAiController';

// <---------------------- AUTH-ROUTES ---------------------->
router.post('/sign-in', signInController);

// <---------------------- REVIEW-ROUTES ---------------------->
router.post('/user/create-review', authMiddleware, reviewAppController);
router.get('/user/get-review', authMiddleware, getReviewController);

// <---------------------- QUIZ-ROUTES ---------------------->
router.post('/quiz/create-quiz/:quizId', authMiddleware, upsertQuizController);
router.get('/quiz/get-quiz/:quizId', authMiddleware, getQuizController);
router.get('/quiz/get-user-quiz', authMiddleware, getAllQuizController);

router.put('/quiz/restore-quiz/:quizId', authMiddleware, restore_trashed_quiz_controller);
router.put('/quiz/move-to-trash/:quizId', authMiddleware, deleteQuizController);
router.get('/quiz/get-user-trashed-quiz', authMiddleware, get_trashed_quizzes_controller);
router.delete('/quiz/clear-trash', authMiddleware, delete_trashed_quizzes_controller);
router.delete('/quiz/delete-quiz/:quizId', authMiddleware, permanently_delete_quiz_controller);

router.post('/get-presigned-url', getPreSignedUrlController);
router.post(
    '/quiz/publish-quiz/:quizId',
    authMiddleware,
    // verifyQuizOwnershipMiddleware,
    publishQuizController,
);
router.post(
    '/quiz/launch-quiz/:quizId',
    authMiddleware,
    // verifyQuizOwnershipMiddleware,
    launchQuizController,
);
router.post('/quiz/participant-join-quiz', participantJoinController);
router.get('/quiz/spectator-join-quiz-via-link', spectatorJoinQuizViaURLController);
router.post('/quiz/spectator-join-quiz', spectatorJoinController);
router.get('/quiz/get-live-quiz-data/:quizId', getLiveQuizDataController);

router.get('/quiz/get-sumarized-quiz/:quizId', authMiddleware, getLiveQuizSummarizedData);
router.get(
    '/quiz/get-selected-question-data/:quizId/:questionIndex',
    authMiddleware,
    verifyQuizOwnershipMiddleware,
    getSelectedQuestionDetails,
);
router.get('/quiz/spectators/:quizId', authMiddleware, getSpectatorOnCall);
router.get('/quiz/participants/:quizId', authMiddleware, getParticipantsOnCall);
router.get('/quiz/get-question-results', getQuestionResults);

// collaborator routes
router.post('/quiz/invite-collaborator/:quizId', authMiddleware, Collaborator.process);

// ai routes
router.post('/ai/create-new-quiz', authMiddleware, chatWithAiController);

export default router;
