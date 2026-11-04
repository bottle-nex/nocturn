export interface SessionHistoryEntry {
  quizId: string;
  sessionId: string;
  title: string;
  date: string;
  joined: number;
  winner: string | null;
}

export interface SessionQuestionResult {
  id: string;
  number: number;
  question: string;
  correctAnswer: number;
  answered: number;
  correct: number;
  accuracy: number;
  averageAnswerMs: number | null;
  hardest: boolean;
  easiest: boolean;
  options: { label: string; count: number }[];
}

export interface SessionPlayerResult {
  id: string;
  name: string;
  rank: number;
  score: number;
  correct: number;
  answered: number;
  accuracy: number;
  longestStreak: number;
  usedLifeline: boolean;
  eliminated: boolean;
  eliminatedOn: number | null;
  answers: {
    questionId: string;
    selectedAnswer: number;
    correct: boolean;
    timeMs: number;
    points: number;
  }[];
}

export interface SessionReport {
  quizId: string;
  sessionId: string;
  title: string;
  date: string;
  fullAccess: boolean;
  summary: {
    joined: number;
    answered: number;
    finished: number;
    averageScore: number;
    accuracy: number;
    durationMs: number | null;
    durationEstimated: boolean;
    prizePool: number;
    currency: string;
    prizes: { name: string; rank: number; amount: number; status: string }[];
  };
  questions: SessionQuestionResult[];
  players: SessionPlayerResult[];
}
