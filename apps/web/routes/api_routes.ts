const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const API_URL = BACKEND_URL + '/api/v1';
export const SIGNIN_URL = API_URL + '/sign-in';
export const QUIZ_URL = API_URL + '/quiz';
export const AI_URL = API_URL + '/ai';
export const CREATE_QUIZ_URL = QUIZ_URL + '/create-quiz';
export const UPLOAD_IMAGE_URL = API_URL + '/get-presigned-url';
export const GET_OWNER_QUIZ_URL = QUIZ_URL + '/get-quiz';
export const GET_ALL_OWNER_QUIZ_URL = QUIZ_URL + '/get-user-quiz';
export const PUBLISH_QUIZ_URL = QUIZ_URL + '/publish-quiz';
export const LAUNCH_QUIZ_URL = QUIZ_URL + '/launch-quiz';
export const PARTICIPANT_JOIN_QUIZ_URL = QUIZ_URL + '/participant-join-quiz';
export const SPECTATOR_JOIN_QUIZ_URL = QUIZ_URL + '/spectator-join-quiz';
export const LIVE_QUIZ_DATA_URL = QUIZ_URL + '/get-live-quiz-data';
export const CREATE_REVIEW_URL = API_URL + '/user/create-review';
export const GET_REVIEW_URL = API_URL + '/user/get-review';

export const RESTORE_TRASHED_QUIZ_URL = API_URL + '/quiz/restore-quiz';
export const DELETE_QUIZ_URL = API_URL + '/quiz/move-to-trash';
export const GET_TRASHED_QUIZZES_URL = API_URL + '/quiz/get-user-trashed-quiz';
export const CLEAR_TRASH_URL = API_URL + '/quiz/clear-trash';
export const PERMANENTLY_DELETE_QUIZ_URL = API_URL + '/quiz/delete-quiz';

export const GET_SELECTED_QUESTION_DATA = API_URL + '/quiz/get-selected-question-data';
export const SPECTATOR_JOIN_QUIZ_URL_VIA_LINK = QUIZ_URL + '/spectator-join-quiz-via-link';
export const CREATE_QUIZ_USING_AI = AI_URL + '/create-new-quiz';

export const SPECTATOR_URL = QUIZ_URL + '/spectators';
export const PARTICIPANT_URL = QUIZ_URL + '/participants';
export const GET_CHATS_URL = '/quiz/get-messages';
export const INVITE_COLLABORATOR_URL = QUIZ_URL + '/invite-collaborator';

export const ALL_CONTRIBUTORS_DETAILS_URL =
    'https://api.github.com/repos/bottle-nex/nocturn/contributors';
