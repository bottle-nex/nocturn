import {
  AgentStep,
  AiMessageElement,
  AiQuizChatRole,
  ClaimStatusEnum,
  CollabRole,
  Currency,
  HostScreenEnum,
  InteractionEnum,
  ParticipantScreenEnum,
  PointsMultiplier,
  QuizEndScreen,
  QuizPhaseEnum,
  QuizStatusEnum,
  SessionStatusEnum,
  SpectatorScreenEnum,
} from "./enums.prisma";

export interface UserType {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  walletAddress?: string | null;

  isTutorialCompleted: boolean;

  isVerified: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;

  Quiz: QuizType[];
}

export interface TemplateType {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  accentType: string;
  accentColor: string;
  itemsColor: string;
  bars: string[];
  src: string;
  userId?: string | null;
  user?: UserType | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizType {
  id: string;
  title: string;
  description?: string | null;

  templateId?: string;
  template: TemplateType;

  prizePool: number;
  currency: Currency;
  basePointsPerQuestion: number;
  pointsMultiplier?: PointsMultiplier;
  pointsIncrement?: number;
  batchSize?: number;
  timeBonus: boolean;
  eliminationThreshold: number;
  questionTimeLimit: number;
  breakBetweenQuestions: number;
  status: QuizStatusEnum;
  interactions: InteractionEnum[];

  participantCode?: string;
  spectatorCode?: string;
  spectatorLink?: string;

  isDeleted: boolean;
  deletedAt?: Date;

  isFavourite: boolean;

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
  aiChat?: AiQuizChatSession;
  CollabSession?: CollabSession;
  prizeDistributions?: PrizeDistributionType[];
  prizeClaims?: PrizeClaimType[];
  escrowPda?: string | null;
  quizAccountPda?: string | null;
  onChainTxSignature?: string | null;
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
  hintLaunched: boolean;
}

export interface QuizViewsType {
  id: string;
  quizId: string;
  userId: string;
  user: UserType;
  quiz: QuizType;
  viewedAt: Date;
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
  currentStreak: number;
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
  quizEndScreen?: QuizEndScreen;
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

export interface ReviewType {
  id: string;
  userId: string;
  user: UserType;
  rating: number;
  comment: string;
  createdAt: Date;
  updateAt: Date;
}
export interface AiQuizChatSession {
  id: string;
  userId: string;
  user: UserType;
  step: AgentStep;
  instruction?: string;
  difficulty?: string;
  quizId?: string;
  quiz?: QuizType;
  revisionFeedback?: string;
  messages: AiQuizMessage[];
  createdAt: Date;
  updatedAt: Date;
}
export interface Collaborator {
  id: string;
  sessionId: string;
  userId: string;
  role: CollabRole;
  color: string;
  isBlocked: boolean;
  joinedAt?: Date | null;
  session: CollabSession;
  user: UserType;
}

export interface CollabSession {
  id: string;
  hostId: string;
  quizId: string;
  host: UserType;
  quiz: QuizType;
  collaborators: Collaborator[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AiQuizMessage {
  id: string;
  aiQuizChatSessionId: string;
  aiQuizChatSession?: AiQuizChatSession;
  role: AiQuizChatRole;
  content: string;
  element?: AiMessageElement;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PrizeDistributionType {
  id: string;
  quizId: string;
  rank: number;
  percentage: number;
  amount?: number | null;
  amountBaseUnits?: bigint | null;
}

export interface PrizeClaimType {
  id: string;
  quizId: string;
  participantId: string;
  participant?: ParticipantType;
  rank: number;
  amount: number;
  amountBaseUnits: bigint;
  claimToken: string;
  claimTokenHash: string;
  emailHash: string;
  status: ClaimStatusEnum;
  claimedAt?: Date | null;
  claimerWallet?: string | null;
  txSignature?: string | null;
  expiresAt: Date;
  emailSentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
