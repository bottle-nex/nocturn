export function required<T>(value: T | undefined): T {
    if (value === undefined) throw new Error('Expected test fixture value to be defined');
    return value;
}
