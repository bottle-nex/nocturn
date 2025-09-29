export interface UserType {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    walletAddress?: string | null;

    isVerified: boolean;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;

    Quiz: QuizType[];
}

export interface QuizType {
    id: string;
    title: string;
    description?: string | null;
    theme: TemplateEnum;
    prizePool: number;
    currency: string;
    basePointsPerQuestion: number;
    pointsMultiplier: number;
    timeBonus: boolean;
    eliminationThreshold: number;
    questionTimeLimit: number;
    breakBetweenQuestions: number;
    status: QuizStatusEnum;
    interactions: InteractionEnum[];

    participantCode?: string;
    spectatorCode?: string;
    spectatorLink?: string;

    createdAt: Date;
    updatedAt: Date;
    scheduledAt?: Date | null;
    startedAt?: Date | null;
    endedAt?: Date | null;

    hostId?: string;
    host?: UserType;

    autoSave: boolean;
    liveChat: boolean;
    spectatorMode: boolean;
    allowNewSpectator: boolean;

    questions: QuestionType[];
    participants?: ParticipantType[];
    spectators?: SpectatorType[];
}

export interface QuestionType {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    hint?: string;
    difficulty: number;
    basePoints: number;
    timeLimit: number;
    readingTime: number;
    orderIndex: number;
    imageUrl?: string;
    quizId: string;
    quiz?: QuizType;
    isAsked: boolean;
}

export interface ParticipantType {
    id: string;
    nickname: string;
    avatar?: string | null;
    ipAddress?: string | null;
    isEliminated: boolean;
    isNameChanged: boolean;
    warningCount: number;
    isKicked: boolean;
    eliminatedAt?: Date | null;
    eliminatedAtQuestion?: string | null;
    finalRank?: number | null;
    totalScore: number;
    correctAnswers: number;
    longestStreak: number;
    walletAddress?: string | null;
    quizId: string;
    quiz?: QuizType;
}

export interface SpectatorType {
    id: string;
    nickname: string;
    isNameChanged: boolean;
    warningCount: number;
    isKicked: boolean;
    avatar?: string | null;
    ipAddress?: string | null;
    connectionId?: string | null;
    joinedAt: Date;
    quizId: string;
    quiz?: QuizType;
}

export interface GameSessionType {
    id: string;
    currentQuestionIndex: number;
    currentQuestionId?: string | null;
    status: SessionStatusEnum;
    hostScreen: HostScreenEnum;
    participantScreen: ParticipantScreenEnum;
    spectatorScreen: SpectatorScreenEnum;
    questionStartedAt?: Date | null;
    questionEndsAt?: Date | null;

    lastEliminationAt?: number | null;
    nextEliminationAt?: number | null;

    totalParticipants: number;
    activeParticipants: number;
    totalSpectators: number;

    avgResponseTime: number;
    correctAnswerRate: number;

    createdAt: Date;
    updatedAt: Date;

    currentPhase?: QuizPhaseEnum;
    phaseStartTime: number;
    phaseEndTime?: number;

    quizId: string;
    quiz?: QuizType;

    responses?: ResponseType[];
    eliminations?: EliminationType[];
}

export interface ResponseType {
    id: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeToAnswer: number;
    pointsEarned: number;

    timeBonus: number;
    streakBonus: number;
    answeredAt: Date;

    participantId: string;
    participant?: ParticipantType;

    questionId: string;
    question?: QuestionType;

    gameSessionId: string;
    gameSession?: GameSessionType;
}

export interface EliminationType {
    id: string;
    participantId: string;
    questionIndex: number;
    finalScore: number;
    finalRank: number;
    reason: string;
    eliminatedAt: Date;

    gameSessionId: string;
    gameSession?: GameSessionType;
}

export enum TemplateEnum {
    CLASSIC = 'CLASSIC',
    MODERN = 'MODERN',
    PASTEL = 'PASTEL',
    NEON = 'NEON',
    YELLOW = 'YELLOW',
    GREEN = 'GREEN',
    BLUE = 'BLUE',
}

export enum QuizStatusEnum {
    CREATED = 'CREATED',
    PUBLISHED = 'PUBLISHED',
    SCHEDULED = 'SCHEDULED',
    LIVE = 'LIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PAYOUT_PENDING = 'PAYOUT_PENDING',
    PAYOUT_COMPLETED = 'PAYOUT_COMPLETED',
    NULL = 'NULL',
}

export enum InteractionEnum {
    THUMBS_UP = 'THUMBS_UP',
    DOLLAR = 'DOLLAR',
    BULB = 'BULB',
    HEART = 'HEART',
    SMILE = 'SMILE',
}

export enum SessionStatusEnum {
    WAITING = 'WAITING',
    STARTING = 'STARTING',
    QUESTION_ACTIVE = 'QUESTION_ACTIVE',
    QUESTION_ENDED = 'QUESTION_ENDED',
    ELIMINATING = 'ELIMINATING',
    COMPLETED = 'COMPLETED',
    PAUSED = 'PAUSED',
}

export enum ParticipantScreenEnum {
    LOBBY = 'LOBBY',
    COUNTDOWN = 'COUNTDOWN',
    QUESTION_MOTIVATION = 'QUESTION_MOTIVATION',
    QUESTION_READING = 'QUESTION_READING',
    QUESTION_ACTIVE = 'QUESTION_ACTIVE',
    QUESTION_RESULTS = 'QUESTION_RESULTS',
}

export enum SpectatorScreenEnum {
    LOBBY = 'LOBBY',
    COUNTDOWN = 'COUNTDOWN',
    QUESTION_MOTIVATION = 'QUESTION_MOTIVATION',
    QUESTION_READING = 'QUESTION_READING',
    QUESTION_ACTIVE = 'QUESTION_ACTIVE',
    QUESTION_RESULTS = 'QUESTION_RESULTS',
}

export enum HostScreenEnum {
    LOBBY = 'LOBBY',
    QUESTION_PREVIEW = 'QUESTION_PREVIEW',
    QUESTION_READING = 'QUESTION_READING',
    QUESTION_ACTIVE = 'QUESTION_ACTIVE',
    QUESTION_RESULTS = 'QUESTION_RESULTS',
    LEADERBOARD = 'LEADERBOARD',
    FINAL_RESULTS = 'FINAL_RESULTS',
}

export enum USER_TYPE {
    HOST = 'HOST',
    PARTICIPANT = 'PARTICIPANT',
    SPECTATOR = 'SPECTATOR',
}

export enum QuizPhaseEnum {
    QUESTION_READING = 'QUESTION_READING',
    QUESTION_ACTIVE = 'QUESTION_ACTIVE',
    SHOW_RESULTS = 'SHOW_RESULTS',
    WAITING_NEXT = 'WAITING_NEXT',
}
