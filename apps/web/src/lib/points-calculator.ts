export default class PointsCalculator {
    private base_points: number;
    private point_multiplier: number;
    private no_of_question: number;

    constructor(no_of_question: number, base_points: number = 100) {
        this.base_points = base_points;
        this.point_multiplier = 1.2;
        this.no_of_question = no_of_question;
    }

    public calculate_linear_points(new_point_multiplier: number): number[] {
        const points: number[] = [];
        this.point_multiplier = new_point_multiplier;

        const increment = this.base_points * (new_point_multiplier - 1);

        for (let i = 0; i < this.no_of_question; i++) {
            const questionPoints = this.base_points + increment * i;
            points.push(Math.round(questionPoints));
        }
        return points;
    }

    public calculate_stepped_points(step_increment: number, batch_size: number = 3): number[] {
        const points: number[] = [];

        for (let i = 0; i < this.no_of_question; i++) {
            if (i === 0) {
                points.push(this.base_points);
            } else {
                const tier = Math.floor(i / batch_size);
                const tierMultiplier = 1 + tier * 0.5; // tier 0 = 1x, tier 1 = 1.5x, tier 2 = 2x, etc.
                const prevPoint = points[i - 1];
                if (prevPoint !== undefined) {
                    points.push(Math.round(prevPoint + step_increment * tierMultiplier));
                }
            }
        }

        const rounded_points = points.map((p) => Math.round(p / 5) * 5);
        return rounded_points;
    }

    public set_point_after_current_index(index: number, point: number): number[] {
        const points: number[] = [point];
        index++;

        while (index < this.no_of_question) {
            const prev_question_point = points[points.length - 1]!;
            const current_question_point = this.point_multiplier * prev_question_point;
            const rounded_value = this.round_to_two_decimals(current_question_point);
            points.push(rounded_value);
            index++;
        }

        return points;
    }

    public round_to_two_decimals(value: number): number {
        return Math.round(value * 100) / 100;
    }

    public round_to_integer(value: number): number {
        return Math.round(value);
    }
}
