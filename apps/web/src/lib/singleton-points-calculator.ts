import PointsCalculator from '@/lib/points-calculator';

let singletonPointsCalculator: PointsCalculator | null = null;
let cachedQuestionCount: number = 0;
let cachedBasePoints: number = 100;

export function getSingletonPointsCalculator(no_of_question: number, base_points: number = 100) {
    // Recreate if question count or base points changed
    if (
        !singletonPointsCalculator ||
        cachedQuestionCount !== no_of_question ||
        cachedBasePoints !== base_points
    ) {
        singletonPointsCalculator = new PointsCalculator(no_of_question, base_points);
        cachedQuestionCount = no_of_question;
        cachedBasePoints = base_points;
    }
    return singletonPointsCalculator;
}
