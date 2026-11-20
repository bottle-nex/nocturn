export function isQuestionAnswerable(
    startTime: number | undefined,
    endTime: number | undefined,
    now: number,
): boolean {
    return (
        startTime !== undefined &&
        endTime !== undefined &&
        Number.isFinite(startTime) &&
        Number.isFinite(endTime) &&
        now >= startTime &&
        now < endTime
    );
}
