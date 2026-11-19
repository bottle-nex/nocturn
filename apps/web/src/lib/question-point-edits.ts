import type { QuestionType } from '@nocturn/types';

export function broadcastQuestionPoints(
    questions: QuestionType[],
    points: number[],
    edit: (index: number, changes: Partial<QuestionType>) => void,
) {
    questions.forEach((question, index) => {
        const basePoints = points[index];
        if (basePoints === undefined || basePoints === question.basePoints) return;
        edit(index, { id: question.id, basePoints });
    });
}
