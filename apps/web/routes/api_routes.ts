const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const API_URL = BACKEND_URL + '/api/v1';

export const SIGNIN_URL = API_URL + '/sign-in';
export const LEARNING_JOURNEY_URL = API_URL + '/learning-journey';
export const COMPLETE_TUTORIAL_URL = API_URL + '/tutorial-complete';
export const GET_TUTORIAL_STATUS_URL = API_URL + '/get-tutorial-status';
export const SEND_OTP_URL = API_URL + '/send-otp';
export const VERIFY_OTP_URL = API_URL + '/verify-otp';
export const REFRESH_TOKEN_URL = API_URL + '/refresh-token';
export const INIT_REFRESH_URL = API_URL + '/init-refresh';
export const LOGOUT_URL = API_URL + '/logout';
export const QUIZ_URL = API_URL + '/quiz';
export const FOLDER_URL = API_URL + '/folder';
export const AI_URL = API_URL + '/ai';

export const CREATE_QUIZ_URL = QUIZ_URL + '/create-quiz';
export const GET_PRESIGNED_URL = API_URL + '/get-presigned-url';
export const GET_OWNER_QUIZ_URL = QUIZ_URL + '/get-quiz';
export const GET_ALL_OWNER_QUIZ_URL = QUIZ_URL + '/get-user-quiz';
export const GET_SHARED_QUIZ_URL = QUIZ_URL + '/get-shared-quiz';
export const GET_RECENTLY_VIEWED_URL = QUIZ_URL + '/get-recently-viewed';
export const PUBLISH_QUIZ_URL = QUIZ_URL + '/publish-quiz';
export const LAUNCH_QUIZ_URL = QUIZ_URL + '/launch-quiz';
export const HOST_JOIN_QUIZ_URL = QUIZ_URL + '/host-join-quiz';
export const PARTICIPANT_JOIN_QUIZ_URL = QUIZ_URL + '/participant-join-quiz';
export const SPECTATOR_JOIN_QUIZ_URL = QUIZ_URL + '/spectator-join-quiz';
export const LIVE_QUIZ_DATA_URL = QUIZ_URL + '/get-live-quiz-data';
export const CREATE_REVIEW_URL = API_URL + '/user/create-review';
export const GET_REVIEW_URL = API_URL + '/user/get-review';
export const GET_UN_ASKED_QUESTION_URL = QUIZ_URL + '/get-un-asked-question';

// template routes
export const GET_QUIZ_TEMPLATES = QUIZ_URL + '/get-templates';

// favourite quiz routes
export const TOGGLE_FAVOURITE_QUIZ_URL = QUIZ_URL + '/toggle-favourite-quiz';
export const GET_FAVOURITE_QUIZZES_URL = QUIZ_URL + '/get-favourite-quizzes';

export const RESTORE_TRASHED_QUIZ_URL = QUIZ_URL + '/restore-quiz';
export const DELETE_QUIZ_URL = QUIZ_URL + '/move-to-trash';
export const DUPLICATE_QUIZ_URL = QUIZ_URL + '/duplicate-quiz';
export const CHANGE_QUIZ_TITLE_URL = QUIZ_URL + '/update-title';
export const DELETE_SELECTED_QUIZZES_URL = QUIZ_URL + '/move-quizzes-to-trash';
export const GET_TRASHED_QUIZZES_URL = QUIZ_URL + '/get-user-trashed-quiz';
export const CLEAR_TRASH_URL = QUIZ_URL + '/clear-trash';
export const PERMANENTLY_DELETE_SELECTED_QUIZ_URL = QUIZ_URL + '/permanently-delete-selected-quiz';
export const PERMANENTLY_DELETE_QUIZ_URL = QUIZ_URL + '/delete-quiz';
export const GET_QUIZ_QUESTIONS = QUIZ_URL + '/get-quiz-questions';

export const GET_SELECTED_QUESTION_DATA = QUIZ_URL + '/get-selected-question-data';
export const SPECTATOR_JOIN_QUIZ_URL_VIA_LINK = QUIZ_URL + '/spectator-join-quiz-via-link';

export const GENERATE_NEW_QUIZ = AI_URL + '/generate-new-quiz';
export const ACCEPT_OR_DECLINE_GENERATED_QUIZ = AI_URL + '/accept-or-decline-generated-quiz';
export const GET_LAST_AI_CHAT = AI_URL + '/get-last-ai-chat';

export const SPECTATOR_URL = QUIZ_URL + '/spectators';
export const PARTICIPANT_URL = QUIZ_URL + '/participants';
export const GET_CHATS_URL = '/quiz/get-messages';
export const INVITE_COLLABORATOR_URL = QUIZ_URL + '/invite-collaborator';

export const ALL_CONTRIBUTORS_DETAILS_URL =
    'https://api.github.com/repos/bottle-nex/nocturn/contributors';

// Premium routes
export const PREMIUM_URL = API_URL + '/premium';
export const GET_TIERS_URL = PREMIUM_URL + '/tiers';
export const CREATE_CHECKOUT_URL = PREMIUM_URL + '/create-checkout-session';

// Prize routes
export const PRIZE_URL = API_URL + '/prize';
export const SET_PRIZE_DISTRIBUTION_URL = PRIZE_URL + '/distribution';
export const CONFIRM_STAKE_URL = PRIZE_URL + '/confirm-stake';
export const AUTHORIZE_CONFIRM_URL = PRIZE_URL + '/authorize-confirm';
export const GET_PRIZE_CLAIMS_URL = PRIZE_URL + '/claims';
export const GET_CLAIM_URL = PRIZE_URL + '/claim';
export const CONFIRM_CLAIM_URL = PRIZE_URL + '/claim';
