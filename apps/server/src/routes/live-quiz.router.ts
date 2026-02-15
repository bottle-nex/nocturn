import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import participantJoinController from '../controllers/live-quiz-controller/participantJoinController';
// import getLiveQuizDataController from '../controllers/live-quiz-controller/getLiveQuizDataController';
import spectatorJoinController from '../controllers/live-quiz-controller/spectatorJoinController';
import getLiveQuizSummarizedData from '../controllers/live-quiz-controller/getLiveQuizSummarizedData';
import getSelectedQuestionDetails from '../controllers/live-quiz-controller/getSelectedQuestionDetails';
import getSpectatorOnCall from '../controllers/live-quiz-controller/getSpectatorOnCall';
import getParticipantsOnCall from '../controllers/live-quiz-controller/getParticipantsOnCall';
import getQuestionResults from '../controllers/live-quiz-controller/getQuestionResults';
import spectatorJoinQuizViaURLController from '../controllers/live-quiz-controller/spectatorJoinQuizViaURLController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/authMiddleware';
import verifyQuizOwnershipMiddleware from '../middlewares/verifyQuizOwnershipMiddleware';
import getUnAskedQuestionController from '../controllers/live-quiz-controller/getUnAskedQuestionController';
import getLiveQuizDataController from '../controllers/live-quiz-controller/getLiveQuizDataController';

// <---------------------- LIVE-QUIZ-ROUTES ---------------------->
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
router.get('/quiz/get-un-asked-question/:quizId', authMiddleware, getUnAskedQuestionController);
router.get('/quiz/spectators/:quizId', authMiddleware, getSpectatorOnCall);
router.get('/quiz/participants/:quizId', authMiddleware, getParticipantsOnCall);
router.get('/quiz/get-question-results', getQuestionResults);

export default router;
