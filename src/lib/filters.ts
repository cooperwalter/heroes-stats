interface GameModeEntry {
	apiValue: string;
	display: string;
}

interface TierEntry {
	apiValue: string | undefined;
	display: string;
}

export const GAME_MODES: Record<string, GameModeEntry> = {
	sl: { apiValue: "Storm League", display: "Storm League" },
	qm: { apiValue: "Quick Match", display: "Quick Match" },
	aram: { apiValue: "ARAM", display: "ARAM" },
	ud: { apiValue: "Unranked Draft", display: "Unranked Draft" },
};

export const MMR_TIERS: Record<string, TierEntry> = {
	all: { apiValue: undefined, display: "All Ranks" },
	"6": { apiValue: "6", display: "Master" },
	"5": { apiValue: "5", display: "Diamond" },
	"4": { apiValue: "4", display: "Platinum" },
	"3": { apiValue: "3", display: "Gold" },
	"2": { apiValue: "2", display: "Silver" },
	"1": { apiValue: "1", display: "Bronze" },
	"0": { apiValue: "0", display: "Wood" },
};

export type ModeKey = keyof typeof GAME_MODES;
export type TierKey = keyof typeof MMR_TIERS;

export const filterSearchSchema = (
	input: Record<string, unknown>,
): { mode: ModeKey; tier: TierKey } => {
	const mode =
		typeof input.mode === "string" && input.mode in GAME_MODES
			? (input.mode as ModeKey)
			: "sl";
	const tier =
		typeof input.tier === "string" && input.tier in MMR_TIERS
			? (input.tier as TierKey)
			: "all";
	return { mode, tier };
};
