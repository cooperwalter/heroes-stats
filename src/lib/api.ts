import { createServerFn } from "@tanstack/react-start";
import * as cache from "./cache";
import { getApiToken, HEROESPROFILE_API_BASE_URL } from "./env";
import type {
	ApiResult,
	HeroesResponse,
	HeroStatsResponse,
	PatchesResponse,
	TalentBuildsResponse,
	TalentDetailsResponse,
	TalentMetaResponse,
} from "./types";

const TTL_60MIN = 60 * 60 * 1000;
const TTL_15MIN = 15 * 60 * 1000;

async function fetchJson<T>(
	path: string,
	params: Record<string, string | undefined>,
): Promise<ApiResult<T>> {
	const url = new URL(`${HEROESPROFILE_API_BASE_URL}${path}`);
	url.searchParams.set("mode", "json");
	url.searchParams.set("api_token", getApiToken());
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined) {
			url.searchParams.set(k, v);
		}
	}

	let response: Response;
	try {
		response = await fetch(url.toString(), {
			signal: AbortSignal.timeout(10000),
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Network error";
		return { error: "upstream_unavailable", message };
	}

	if (!response.ok) {
		return {
			error: "upstream_error",
			message: `Upstream returned ${response.status}`,
			status: response.status,
		};
	}

	let data: T;
	try {
		data = (await response.json()) as T;
	} catch {
		return { error: "parse_error", message: "Failed to parse JSON response" };
	}

	return { data };
}

export const getPatches = createServerFn({ method: "GET" }).handler(
	async (): Promise<ApiResult<PatchesResponse>> => {
		const key = cache.buildCacheKey("getPatches", {});
		const cached = cache.get<ApiResult<PatchesResponse>>(key);
		if (cached) return cached;

		const result = await fetchJson<PatchesResponse>("/api/Patches", {});
		if (!result.error) {
			cache.set(key, result, TTL_60MIN);
		}
		return result;
	},
);

export const getHeroes = createServerFn({ method: "GET" }).handler(
	async (): Promise<ApiResult<HeroesResponse>> => {
		const key = cache.buildCacheKey("getHeroes", {});
		const cached = cache.get<ApiResult<HeroesResponse>>(key);
		if (cached) return cached;

		const result = await fetchJson<HeroesResponse>("/api/Heroes", {});
		if (!result.error) {
			cache.set(key, result, TTL_60MIN);
		}
		return result;
	},
);

export const getHeroStats = createServerFn({ method: "GET" })
	.inputValidator(
		(d: { timeframe: string; gameType: string; leagueTier?: string }) => d,
	)
	.handler(async ({ data }): Promise<ApiResult<HeroStatsResponse>> => {
		const key = cache.buildCacheKey("getHeroStats", {
			timeframe: data.timeframe,
			game_type: data.gameType,
			league_tier: data.leagueTier,
		});
		const cached = cache.get<ApiResult<HeroStatsResponse>>(key);
		if (cached) return cached;

		const result = await fetchJson<HeroStatsResponse>("/api/Heroes/Stats", {
			timeframe_type: "minor",
			timeframe: data.timeframe,
			game_type: data.gameType,
			league_tier: data.leagueTier,
		});
		if (!result.error) {
			cache.set(key, result, TTL_15MIN);
		}
		return result;
	});

export const getTalentDetails = createServerFn({ method: "GET" })
	.inputValidator(
		(d: {
			timeframe: string;
			gameType: string;
			hero: string;
			leagueTier?: string;
		}) => d,
	)
	.handler(async ({ data }): Promise<ApiResult<TalentDetailsResponse>> => {
		const key = cache.buildCacheKey("getTalentDetails", {
			timeframe: data.timeframe,
			game_type: data.gameType,
			hero: data.hero,
			league_tier: data.leagueTier,
		});
		const cached = cache.get<ApiResult<TalentDetailsResponse>>(key);
		if (cached) return cached;

		const result = await fetchJson<TalentDetailsResponse>(
			"/api/Heroes/Talents/Details",
			{
				timeframe_type: "minor",
				timeframe: data.timeframe,
				game_type: data.gameType,
				hero: data.hero,
				league_tier: data.leagueTier,
			},
		);
		if (!result.error) {
			cache.set(key, result, TTL_15MIN);
		}
		return result;
	});

export const getTalentBuilds = createServerFn({ method: "GET" })
	.inputValidator(
		(d: {
			timeframe: string;
			gameType: string;
			hero: string;
			leagueTier?: string;
		}) => d,
	)
	.handler(async ({ data }): Promise<ApiResult<TalentBuildsResponse>> => {
		const key = cache.buildCacheKey("getTalentBuilds", {
			timeframe: data.timeframe,
			game_type: data.gameType,
			hero: data.hero,
			league_tier: data.leagueTier,
		});
		const cached = cache.get<ApiResult<TalentBuildsResponse>>(key);
		if (cached) return cached;

		const result = await fetchJson<TalentBuildsResponse>(
			"/api/Heroes/Talents/Builds",
			{
				timeframe_type: "minor",
				timeframe: data.timeframe,
				game_type: data.gameType,
				hero: data.hero,
				league_tier: data.leagueTier,
			},
		);
		if (!result.error) {
			cache.set(key, result, TTL_15MIN);
		}
		return result;
	});

export const getHeroTalents = createServerFn({ method: "GET" })
	.inputValidator((d: { hero: string }) => d)
	.handler(async ({ data }): Promise<ApiResult<TalentMetaResponse>> => {
		const key = cache.buildCacheKey("getHeroTalents", { hero: data.hero });
		const cached = cache.get<ApiResult<TalentMetaResponse>>(key);
		if (cached) return cached;

		const result = await fetchJson<TalentMetaResponse>("/api/Heroes/Talents", {
			hero: data.hero,
		});
		if (!result.error) {
			cache.set(key, result, TTL_60MIN);
		}
		return result;
	});
