import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		handler: (fn: (...args: never[]) => unknown) => fn,
		inputValidator: (validator: (d: unknown) => unknown) => ({
			handler:
				(fn: (ctx: { data: unknown }) => unknown) =>
				(input: { data: unknown }) =>
					fn({ data: validator(input.data) }),
		}),
	}),
}));

vi.mock("./cache", () => ({
	buildCacheKey: vi.fn(
		(fn: string, params: Record<string, string | undefined>) => {
			const sorted = Object.entries(params)
				.filter(([, v]) => v !== undefined)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => `${k}=${v}`)
				.join("&");
			return `${fn}:${sorted}`;
		},
	),
	get: vi.fn(() => undefined),
	set: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);
process.env.HEROESPROFILE_API_TOKEN = "test-api-token";

import {
	getHeroes,
	getHeroStats,
	getHeroTalents,
	getPatches,
	getTalentBuilds,
	getTalentDetails,
} from "./api";
import * as cache from "./cache";

function makeJsonResponse(data: unknown, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => data,
	};
}

describe("getPatches", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.mocked(cache.get).mockReturnValue(undefined);
		vi.mocked(cache.set).mockClear();
	});

	it("returns parsed patch data on successful API response", async () => {
		const patchData = { "2.55": ["2.55.1.90000", "2.55.2.90500"] };
		mockFetch.mockResolvedValueOnce(makeJsonResponse(patchData));

		const result = await getPatches();
		expect(result).toEqual({ data: patchData });
	});

	it("includes api_token and mode=json in the request URL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getPatches();

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("api_token=test-api-token");
		expect(url).toContain("mode=json");
		expect(url).toContain("/api/Patches");
	});

	it("sets a 10-second abort timeout on the fetch request", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getPatches();

		const [, options] = mockFetch.mock.calls[0] as [
			string,
			{ signal: AbortSignal },
		];
		expect(options.signal).toBeDefined();
	});

	it("returns upstream_unavailable error when fetch throws a network error", async () => {
		mockFetch.mockRejectedValueOnce(new Error("network failure"));

		const result = await getPatches();
		expect(result).toEqual({
			error: "upstream_unavailable",
			message: "HeroesProfile API is not responding",
		});
	});

	it("returns upstream_error with status when API returns non-200 response", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse(null, 503));

		const result = await getPatches();
		expect(result).toEqual({
			error: "upstream_error",
			message: "HeroesProfile API returned 503",
			status: 503,
		});
	});

	it("returns parse_error when response body is not valid JSON", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => {
				throw new SyntaxError("Unexpected token");
			},
		});

		const result = await getPatches();
		expect(result).toEqual({
			error: "parse_error",
			message: "Failed to parse API response",
		});
	});

	it("caches successful responses with 60-minute TTL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({ "2.55": [] }));

		await getPatches();

		expect(cache.set).toHaveBeenCalledWith(
			expect.any(String),
			{ data: { "2.55": [] } },
			60 * 60 * 1000,
		);
	});

	it("does not cache error responses", async () => {
		mockFetch.mockRejectedValueOnce(new Error("network failure"));

		await getPatches();

		expect(cache.set).not.toHaveBeenCalled();
	});

	it("returns cached result without calling fetch when cache hit occurs", async () => {
		const cachedResult = { data: { "2.55": ["2.55.1.90000"] } };
		vi.mocked(cache.get).mockReturnValueOnce(cachedResult);

		const result = await getPatches();

		expect(result).toEqual(cachedResult);
		expect(mockFetch).not.toHaveBeenCalled();
	});
});

describe("getHeroes", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.mocked(cache.get).mockReturnValue(undefined);
		vi.mocked(cache.set).mockClear();
	});

	it("requests from /api/Heroes endpoint", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroes();

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("/api/Heroes");
		expect(url).not.toContain("/api/Heroes/");
	});

	it("caches successful responses with 60-minute TTL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroes();

		expect(cache.set).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ data: expect.any(Object) }),
			60 * 60 * 1000,
		);
	});
});

describe("getHeroStats", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.mocked(cache.get).mockReturnValue(undefined);
		vi.mocked(cache.set).mockClear();
	});

	it("passes timeframe_type=minor, game_type, and timeframe to the API URL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroStats({
			data: { timeframe: "2.55.3.90876", gameType: "Storm League" },
		});

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("timeframe_type=minor");
		expect(url).toContain("timeframe=2.55.3.90876");
		expect(url).toContain("game_type=Storm+League");
	});

	it("includes league_tier in the URL when provided", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroStats({
			data: {
				timeframe: "2.55.3.90876",
				gameType: "Storm League",
				leagueTier: "6",
			},
		});

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("league_tier=6");
	});

	it("omits league_tier from the URL when undefined", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroStats({
			data: { timeframe: "2.55.3.90876", gameType: "Storm League" },
		});

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).not.toContain("league_tier");
	});

	it("caches successful responses with 15-minute TTL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroStats({
			data: { timeframe: "2.55.3.90876", gameType: "Storm League" },
		});

		expect(cache.set).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ data: expect.any(Object) }),
			15 * 60 * 1000,
		);
	});
});

describe("getTalentDetails", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.mocked(cache.get).mockReturnValue(undefined);
		vi.mocked(cache.set).mockClear();
	});

	it("includes hero name in the request URL to /api/Heroes/Talents/Details", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getTalentDetails({
			data: {
				timeframe: "2.55.3.90876",
				gameType: "Storm League",
				hero: "Maiev",
			},
		});

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("/api/Heroes/Talents/Details");
		expect(url).toContain("hero=Maiev");
	});

	it("caches successful responses with 15-minute TTL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getTalentDetails({
			data: {
				timeframe: "2.55.3.90876",
				gameType: "Storm League",
				hero: "Maiev",
			},
		});

		expect(cache.set).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Object),
			15 * 60 * 1000,
		);
	});
});

describe("getTalentBuilds", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.mocked(cache.get).mockReturnValue(undefined);
		vi.mocked(cache.set).mockClear();
	});

	it("requests from /api/Heroes/Talents/Builds with hero name", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getTalentBuilds({
			data: {
				timeframe: "2.55.3.90876",
				gameType: "Storm League",
				hero: "Li-Ming",
			},
		});

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("/api/Heroes/Talents/Builds");
		expect(url).toContain("hero=Li-Ming");
	});

	it("caches successful responses with 15-minute TTL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getTalentBuilds({
			data: {
				timeframe: "2.55.3.90876",
				gameType: "Storm League",
				hero: "Li-Ming",
			},
		});

		expect(cache.set).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Object),
			15 * 60 * 1000,
		);
	});
});

describe("getHeroTalents", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.mocked(cache.get).mockReturnValue(undefined);
		vi.mocked(cache.set).mockClear();
	});

	it("requests from /api/Heroes/Talents with hero name", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroTalents({ data: { hero: "Maiev" } });

		const [url] = mockFetch.mock.calls[0] as [string];
		expect(url).toContain("/api/Heroes/Talents");
		expect(url).toContain("hero=Maiev");
	});

	it("caches successful responses with 60-minute TTL", async () => {
		mockFetch.mockResolvedValueOnce(makeJsonResponse({}));

		await getHeroTalents({ data: { hero: "Maiev" } });

		expect(cache.set).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Object),
			60 * 60 * 1000,
		);
	});
});
