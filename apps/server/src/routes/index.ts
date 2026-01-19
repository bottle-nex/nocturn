import { Router } from 'express';
import signInController from '../controllers/user-controller/signInController';
import authMiddleware from '../middlewares/authMiddleware';
import getPreSignedUrlController from '../controllers/s3-controller/getPreSignedUrlController';
import upsertQuizController from '../controllers/quiz-controller/upsertQuizController';
import getQuizController from '../controllers/quiz-controller/getQuizController';
import getAllQuizController from '../controllers/quiz-controller/getAllQuizController';
import publishQuizController from '../controllers/quiz-controller/publishQuizController';
// import verifyQuizOwnershipMiddleware from '../middlewares/verifyQuizOwnershipMiddleware';
import launchQuizController from '../controllers/quiz-controller/launchQuizController';
import reviewAppController from '../controllers/appReview-controller/reviewAppController';
import participantJoinController from '../controllers/live-quiz-controller/participantJoinController';
import getLiveQuizDataController from '../controllers/live-quiz-controller/getLiveQuizDataController';
import spectatorJoinController from '../controllers/live-quiz-controller/spectatorJoinController';
import deleteQuizController from '../controllers/quiz-controller/deleteQuizController';
import getReviewController from '../controllers/appReview-controller/getReviewController';
import { getLiveQuizSummarizedData } from '../controllers/live-quiz-controller/getLiveQuizSummarizedData';
import getSelectedQuestionDetails from '../controllers/live-quiz-controller/getSelectedQuestionDetails';
import getSpectatorOnCall from '../controllers/live-quiz-controller/getSpectatorOnCall';
import getParticipantsOnCall from '../controllers/live-quiz-controller/getParticipantsOnCall';
import verifyQuizOwnershipMiddleware from '../middlewares/verifyQuizOwnershipMiddleware';
import getQuestionResults from '../controllers/live-quiz-controller/getQuestionResults';
import spectatorJoinQuizViaURLController from '../controllers/live-quiz-controller/spectatorJoinQuizViaURLController';

const router: Router = Router();

router.post('/sign-in', signInController);
router.post('/user/create-review', authMiddleware, reviewAppController);
router.get('/user/get-review', authMiddleware, getReviewController);

//quiz-routes
router.post('/quiz/create-quiz/:quizId', authMiddleware, upsertQuizController);
router.get('/quiz/get-quiz/:quizId', authMiddleware, getQuizController);
router.get('/quiz/get-user-quiz', authMiddleware, getAllQuizController);
router.delete('/quiz/delete-quiz/:quizId', authMiddleware, deleteQuizController);
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

export default router;
