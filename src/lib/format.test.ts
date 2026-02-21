import { describe, expect, it } from "vitest";
import { formatNumber, formatPercent, getWinRateColor } from "./format";

describe("getWinRateColor", () => {
	it("returns red for win rate below 48%", () => {
		expect(getWinRateColor(47.99)).toBe("red");
	});

	it("returns yellow for win rate exactly 48%", () => {
		expect(getWinRateColor(48)).toBe("yellow");
	});

	it("returns yellow for win rate exactly 52%", () => {
		expect(getWinRateColor(52)).toBe("yellow");
	});

	it("returns green for win rate above 52%", () => {
		expect(getWinRateColor(52.01)).toBe("green");
	});

	it("returns yellow for win rate of 50%", () => {
		expect(getWinRateColor(50)).toBe("yellow");
	});

	it("returns red for win rate of 0", () => {
		expect(getWinRateColor(0)).toBe("red");
	});
});

describe("formatNumber", () => {
	it("formats numbers with comma separation", () => {
		expect(formatNumber(1234567)).toBe("1,234,567");
	});

	it("formats zero as 0", () => {
		expect(formatNumber(0)).toBe("0");
	});

	it("formats small numbers without commas", () => {
		expect(formatNumber(999)).toBe("999");
	});
});

describe("formatPercent", () => {
	it("formats percentage to one decimal place", () => {
		expect(formatPercent(52.34)).toBe("52.3%");
	});

	it("formats integer percentage with one decimal", () => {
		expect(formatPercent(50)).toBe("50.0%");
	});

	it("formats zero as 0.0%", () => {
		expect(formatPercent(0)).toBe("0.0%");
	});
});
