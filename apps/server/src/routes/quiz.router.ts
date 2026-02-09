import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import upsertQuizController from '../controllers/quiz-controller/upsertQuizController';
import getQuizController from '../controllers/quiz-controller/getQuizController';
import getAllQuizController from '../controllers/quiz-controller/getAllQuizController';
import publishQuizController from '../controllers/quiz-controller/publishQuizController';
import launchQuizController from '../controllers/quiz-controller/launchQuizController';
import permanently_delete_quiz_controller from '../controllers/quiz-controller/permanently_delete_quiz_controller';
import deleteQuizController from '../controllers/quiz-controller/deleteQuizController';
import get_trashed_quizzes_controller from '../controllers/quiz-controller/get_trashed_quizzes_controller';
import delete_trashed_quizzes_controller from '../controllers/quiz-controller/delete_trashed_quizzes_controller';
import restore_trashed_quiz_controller from '../controllers/quiz-controller/restore_trashed_quiz_controller';
import createQuizController from '../controllers/quiz-controller/createQuizController';
import get_favourite_quizzes_controller from '../controllers/quiz-controller/get_favourite_quizzes_controller';
import toggle_favourite_quiz_controller from '../controllers/quiz-controller/toggle_favourite_quiz_controller';
import delete_selected_quizzes_controller from '../controllers/quiz-controller/delete_selected_quizzes_controller';
import renameQuizController from '../controllers/quiz-controller/renameQuizController';
import duplicateQuizController from '../controllers/quiz-controller/duplicateQuizController';
import getQuestionsController from '../controllers/quiz-controller/getQuestionsController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/authMiddleware';
import getSharedQuizController from '../controllers/quiz-controller/get_shared_quiz_controller';

// <---------------------- FAVOURITE-QUIZ-ROUTES ---------------------->
router.put('/quiz/toggle-favourite-quiz', authMiddleware, toggle_favourite_quiz_controller);
router.get('/quiz/get-favourite-quizzes', authMiddleware, get_favourite_quizzes_controller);

// <---------------------- QUIZ-ROUTES ---------------------->
router.post('/quiz/create-quiz/:quizId', authMiddleware, upsertQuizController);
router.post('/quiz/create-quiz', authMiddleware, createQuizController);
router.post('/quiz/duplicate-quiz/:quizId', authMiddleware, duplicateQuizController);

router.get('/quiz/get-quiz/:quizId', authMiddleware, getQuizController);
router.get('/quiz/get-user-quiz', authMiddleware, getAllQuizController);
router.get('/quiz/get-shared-quiz', authMiddleware, getSharedQuizController);

router.put('/quiz/update-title', authMiddleware, renameQuizController);
router.put('/quiz/restore-quiz/:quizId', authMiddleware, restore_trashed_quiz_controller);
router.put('/quiz/move-to-trash/:quizId', authMiddleware, deleteQuizController);
router.put('/quiz/move-quizzes-to-trash', authMiddleware, delete_selected_quizzes_controller);

router.get('/quiz/get-user-trashed-quiz', authMiddleware, get_trashed_quizzes_controller);
router.delete('/quiz/clear-trash', authMiddleware, delete_trashed_quizzes_controller);
router.delete('/quiz/delete-quiz/:quizId', authMiddleware, permanently_delete_quiz_controller);

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

router.get('/quiz/get-quiz-questions/:quizId', authMiddleware, getQuestionsController);

export default router;
