import { afterEach, describe, expect, it } from "vitest";
import { getApiToken, HEROESPROFILE_API_BASE_URL } from "./env";

describe("HEROESPROFILE_API_BASE_URL", () => {
	it("points to the HeroesProfile API", () => {
		expect(HEROESPROFILE_API_BASE_URL).toBe("https://api.heroesprofile.com");
	});
});

describe("getApiToken", () => {
	const original = process.env.HEROESPROFILE_API_TOKEN;

	afterEach(() => {
		if (original !== undefined) {
			process.env.HEROESPROFILE_API_TOKEN = original;
		} else {
			delete process.env.HEROESPROFILE_API_TOKEN;
		}
	});

	it("throws with a descriptive message when HEROESPROFILE_API_TOKEN is not set", () => {
		delete process.env.HEROESPROFILE_API_TOKEN;
		expect(() => getApiToken()).toThrow(
			"HEROESPROFILE_API_TOKEN environment variable is required but not set.",
		);
	});

	it("throws when HEROESPROFILE_API_TOKEN is an empty string", () => {
		process.env.HEROESPROFILE_API_TOKEN = "";
		expect(() => getApiToken()).toThrow(
			"HEROESPROFILE_API_TOKEN environment variable is required but not set.",
		);
	});

	it("returns the token value when HEROESPROFILE_API_TOKEN is set", () => {
		process.env.HEROESPROFILE_API_TOKEN = "my-secret-token";
		expect(getApiToken()).toBe("my-secret-token");
	});
});
