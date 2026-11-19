ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_sessionId_fkey";
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "collab_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "collab_sessions" DROP CONSTRAINT "collab_sessions_quizId_fkey";
ALTER TABLE "collab_sessions" ADD CONSTRAINT "collab_sessions_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
