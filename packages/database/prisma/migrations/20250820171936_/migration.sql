-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('CREATED', 'SCHEDULED', 'PUBLISHED', 'LIVE', 'COMPLETED', 'CANCELLED', 'PAYOUT_PENDING', 'PAYOUT_COMPLETED', 'NULL');

-- CreateEnum
CREATE TYPE "Template" AS ENUM ('CLASSIC', 'MODERN', 'PASTEL', 'NEON', 'YELLOW', 'GREEN', 'BLUE');

-- CreateEnum
CREATE TYPE "Interactions" AS ENUM ('THUMBS_UP', 'DOLLAR', 'BULB', 'HEART', 'SMILE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'LIVE', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ParticipantScreen" AS ENUM ('LOBBY', 'COUNTDOWN', 'QUESTION_MOTIVATION', 'QUESTION_READING', 'QUESTION_ACTIVE', 'QUESTION_RESULTS');

-- CreateEnum
CREATE TYPE "SpectatorScreen" AS ENUM ('LOBBY', 'QUESTION_MOTIVATION', 'QUESTION_READING', 'QUESTION_ACTIVE', 'QUESTION_RESULTS');

-- CreateEnum
CREATE TYPE "HostScreen" AS ENUM ('LOBBY', 'QUESTION_PREVIEW', 'QUESTION_READING', 'QUESTION_ACTIVE', 'QUESTION_RESULTS');

-- CreateEnum
CREATE TYPE "QuizPhase" AS ENUM ('QUESTION_READING', 'QUESTION_ACTIVE', 'SHOW_RESULTS', 'WAITING_NEXT');

-- CreateEnum
CREATE TYPE "ReactorType" AS ENUM ('HOST', 'SPECTATOR');

-- CreateTable
CREATE TABLE "hosts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "walletAddress" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "theme" "Template" NOT NULL DEFAULT 'CLASSIC',
    "participantCode" TEXT,
    "spectatorCode" TEXT,
    "prizePool" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SOL',
    "basePointsPerQuestion" INTEGER NOT NULL DEFAULT 100,
    "pointsMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
    "timeBonus" BOOLEAN NOT NULL DEFAULT true,
    "eliminationThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "questionTimeLimit" INTEGER NOT NULL DEFAULT 30,
    "breakBetweenQuestions" INTEGER NOT NULL DEFAULT 5,
    "status" "QuizStatus" NOT NULL DEFAULT 'CREATED',
    "interactions" "Interactions"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "hostId" TEXT NOT NULL,
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "liveChat" BOOLEAN NOT NULL DEFAULT false,
    "spectatorMode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "readingTime" INTEGER NOT NULL DEFAULT 7,
    "basePoints" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "orderIndex" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "ipAddress" TEXT,
    "isNameChanged" BOOLEAN NOT NULL DEFAULT false,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "eliminatedAt" TIMESTAMP(3),
    "eliminatedAtQuestion" TEXT,
    "finalRank" INTEGER,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "walletAddress" TEXT,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spectators" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "isNameChanged" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "connectionId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "spectators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionId" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "hostScreen" "HostScreen" NOT NULL DEFAULT 'LOBBY',
    "participantScreen" "ParticipantScreen" NOT NULL DEFAULT 'LOBBY',
    "spectatorScreen" "SpectatorScreen" NOT NULL DEFAULT 'LOBBY',
    "questionStartedAt" TIMESTAMP(3),
    "questionEndsAt" TIMESTAMP(3),
    "lastEliminationAt" INTEGER,
    "nextEliminationAt" INTEGER,
    "totalParticipants" INTEGER NOT NULL DEFAULT 0,
    "activeParticipants" INTEGER NOT NULL DEFAULT 0,
    "totalSpectators" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "correctAnswerRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentPhase" "QuizPhase",
    "phaseStartTime" TIMESTAMP(3),
    "phaseEndTime" TIMESTAMP(3),
    "quizId" TEXT NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL,
    "selectedAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeToAnswer" INTEGER NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "timeBonus" INTEGER NOT NULL DEFAULT 0,
    "streakBonus" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eliminations" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "finalScore" INTEGER NOT NULL,
    "finalRank" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "eliminatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameSessionId" TEXT NOT NULL,

    CONSTRAINT "eliminations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAvatar" TEXT,
    "message" TEXT NOT NULL,
    "repliedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReaction" (
    "id" TEXT NOT NULL,
    "chatMessageId" TEXT NOT NULL,
    "reactorType" "ReactorType" NOT NULL,
    "reactorName" TEXT NOT NULL,
    "reactorAvatar" TEXT NOT NULL,
    "reaction" "Interactions" NOT NULL,
    "reactedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hosts_email_key" ON "hosts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_walletAddress_key" ON "hosts"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_participantCode_key" ON "quizzes"("participantCode");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_spectatorCode_key" ON "quizzes"("spectatorCode");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_quizId_key" ON "game_sessions"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "responses_participantId_questionId_key" ON "responses"("participantId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_key" ON "Review"("userId");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spectators" ADD CONSTRAINT "spectators_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eliminations" ADD CONSTRAINT "eliminations_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_repliedToId_fkey" FOREIGN KEY ("repliedToId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
