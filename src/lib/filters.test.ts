import { describe, expect, it } from "vitest";
import { filterSearchSchema, GAME_MODES, MMR_TIERS } from "./filters";

describe("GAME_MODES", () => {
	it("maps sl to API value Storm League", () => {
		expect(GAME_MODES.sl.apiValue).toBe("Storm League");
	});

	it("maps qm to API value Quick Match", () => {
		expect(GAME_MODES.qm.apiValue).toBe("Quick Match");
	});

	it("maps aram to API value ARAM", () => {
		expect(GAME_MODES.aram.apiValue).toBe("ARAM");
	});

	it("maps ud to API value Unranked Draft", () => {
		expect(GAME_MODES.ud.apiValue).toBe("Unranked Draft");
	});
});

describe("MMR_TIERS", () => {
	it("maps all to undefined API value to omit from API calls", () => {
		expect(MMR_TIERS.all.apiValue).toBeUndefined();
	});

	it("maps 6 to API value 6 with display Master", () => {
		expect(MMR_TIERS["6"].apiValue).toBe("6");
		expect(MMR_TIERS["6"].display).toBe("Master");
	});

	it("maps 0 to API value 0 with display Wood", () => {
		expect(MMR_TIERS["0"].apiValue).toBe("0");
		expect(MMR_TIERS["0"].display).toBe("Wood");
	});
});

describe("filterSearchSchema", () => {
	it("returns defaults { mode: sl, tier: all } for empty input", () => {
		expect(filterSearchSchema({})).toEqual({ mode: "sl", tier: "all" });
	});

	it("preserves valid mode and tier values", () => {
		expect(filterSearchSchema({ mode: "qm", tier: "6" })).toEqual({
			mode: "qm",
			tier: "6",
		});
	});

	it("falls back to default mode sl for invalid mode values", () => {
		expect(filterSearchSchema({ mode: "invalid" })).toEqual({
			mode: "sl",
			tier: "all",
		});
	});

	it("falls back to default tier all for invalid tier values", () => {
		expect(filterSearchSchema({ mode: "aram", tier: "99" })).toEqual({
			mode: "aram",
			tier: "all",
		});
	});
});
