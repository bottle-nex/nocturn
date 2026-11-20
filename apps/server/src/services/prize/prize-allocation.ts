export interface PrizeDistributionEntry {
    rank: number;
    percentage: number;
}

export interface RankedParticipant {
    id: string;
    totalScore: number;
}

export function percentageBaseUnits(percentage: number): bigint {
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
        throw new Error('Percentages must be positive and at most 100');
    }
    const scaled = Math.round(percentage * 100);
    if (Math.abs(scaled / 100 - percentage) > 1e-9) {
        throw new Error('Percentages may have at most two decimal places');
    }
    return BigInt(scaled);
}

export function validateDistributions(distributions: PrizeDistributionEntry[]) {
    if (!distributions.length || distributions.length > 255) {
        throw new Error('Between 1 and 255 prize ranks are required');
    }
    const sorted = [...distributions].sort((a, b) => a.rank - b.rank);
    let total = BigInt(0);
    sorted.forEach((entry, index) => {
        if (entry.rank !== index + 1) throw new Error('Ranks must be sequential starting from 1');
        total += percentageBaseUnits(entry.percentage);
    });
    if (total !== BigInt(10000)) throw new Error('Percentages must sum to 100');
    return sorted;
}

export function allocatePrizes(
    fundedBaseUnits: bigint,
    distributions: PrizeDistributionEntry[],
    participants: RankedParticipant[],
) {
    if (fundedBaseUnits < BigInt(0)) throw new Error('Funded pool cannot be negative');
    const sorted = validateDistributions(distributions);
    const seen = new Set<string>();
    participants.forEach((participant, index) => {
        if (seen.has(participant.id) || !Number.isFinite(participant.totalScore)) {
            throw new Error('Invalid leaderboard');
        }
        if (index > 0 && participant.totalScore > participants[index - 1]!.totalScore) {
            throw new Error('Leaderboard must be sorted by score');
        }
        seen.add(participant.id);
    });
    const claims: { participantId: string; rank: number; amountBaseUnits: bigint }[] = [];
    const ranks: { participantId: string; rank: number }[] = [];
    for (let start = 0; start < participants.length; ) {
        let end = start + 1;
        while (
            end < participants.length &&
            participants[end]!.totalScore === participants[start]!.totalScore
        )
            end++;
        let pooled = BigInt(0);
        for (let position = start; position < end; position++) {
            const distribution = sorted[position];
            if (distribution)
                pooled +=
                    (fundedBaseUnits * percentageBaseUnits(distribution.percentage)) /
                    BigInt(10000);
        }
        const amountBaseUnits = pooled / BigInt(end - start);
        for (let index = start; index < end; index++) {
            const participantId = participants[index]!.id;
            ranks.push({ participantId, rank: start + 1 });
            if (amountBaseUnits > BigInt(0))
                claims.push({ participantId, rank: start + 1, amountBaseUnits });
        }
        start = end;
    }
    const allocated = claims.reduce((sum, claim) => sum + claim.amountBaseUnits, BigInt(0));
    return { claims, ranks, surplusBaseUnits: fundedBaseUnits - allocated };
}
