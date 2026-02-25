export const ONE_MINUTE = 60_000;
export const ONE_DAY = 86_400_000;

// ── Limit shapes ─────────────────────────────────────────────

export interface NumericDef { type: "numeric"; value: number | null }  // null = unlimited
export interface BooleanDef { type: "boolean"; enabled: boolean }
export interface RateDef { type: "rate"; limit: number | null; windowMs: number }

export type LimitDef = NumericDef | BooleanDef | RateDef;

// ── Feature definition shape ─────────────────────────────────

export type FeatureDef<T extends LimitDef> = { free: T; pro: T };

// ── Feature builders ─────────────────────────────────────────

export const numeric = (
    free: number | null,
    pro: number | null
): FeatureDef<NumericDef> => ({
    free: { type: "numeric", value: free },
    pro: { type: "numeric", value: pro },
});

export const gate = (
    free: boolean,
    pro: boolean
): FeatureDef<BooleanDef> => ({
    free: { type: "boolean", enabled: free },
    pro: { type: "boolean", enabled: pro },
});

export const rate = (
    windowMs: number,
    free: number | null,
    pro: number | null
): FeatureDef<RateDef> => ({
    free: { type: "rate", limit: free, windowMs },
    pro: { type: "rate", limit: pro, windowMs },
});