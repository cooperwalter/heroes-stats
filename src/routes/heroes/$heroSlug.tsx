import {
	createFileRoute,
	Link,
	notFound,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { BuildRow } from "~/components/BuildRow";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FilterBar } from "~/components/FilterBar";
import { SkeletonCard } from "~/components/SkeletonCard";
import { TalentCard } from "~/components/TalentCard";
import {
	getHeroes,
	getHeroTalents,
	getTalentBuilds,
	getTalentDetails,
} from "~/lib/api";
import { filterSearchSchema, GAME_MODES, MMR_TIERS } from "~/lib/filters";
import { resolveLatestPatch } from "~/lib/patches";
import type {
	ApiResult,
	TalentBuildsResponse,
	TalentDetail,
	TalentDetailsResponse,
	TalentMeta,
	TalentMetaResponse,
} from "~/lib/types";
import "./$heroSlug.css";

const TALENT_LEVELS = [1, 4, 7, 10, 13, 16, 20] as const;

export const Route = createFileRoute("/heroes/$heroSlug")({
	validateSearch: filterSearchSchema,
	loaderDeps: ({ search }) => ({ mode: search.mode, tier: search.tier }),
	component: HeroTalentPage,
	pendingComponent: HeroTalentPendingComponent,
	loader: async ({ params, deps }) => {
		let currentPatch: string;
		try {
			const patches = await resolveLatestPatch();
			currentPatch = patches.currentPatch;
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to load patch data";
			const errorResult: ApiResult<never> = {
				error: "upstream_unavailable",
				message,
			};
			return {
				hero: {
					id: 0,
					name: params.heroSlug,
					short_name: params.heroSlug,
					role: "",
					new_role: "",
					type: "",
					attribute_id: "",
				},
				heroName: params.heroSlug,
				talentDetailsResult: errorResult as ApiResult<TalentDetailsResponse>,
				talentBuildsResult: errorResult as ApiResult<TalentBuildsResponse>,
				heroTalentsResult: errorResult as ApiResult<TalentMetaResponse>,
			};
		}

		const heroesResult = await getHeroes();
		if (heroesResult.error) {
			const errorResult: ApiResult<never> = {
				error: heroesResult.error,
				message: heroesResult.message,
			};
			return {
				hero: {
					id: 0,
					name: params.heroSlug,
					short_name: params.heroSlug,
					role: "",
					new_role: "",
					type: "",
					attribute_id: "",
				},
				heroName: params.heroSlug,
				talentDetailsResult: errorResult as ApiResult<TalentDetailsResponse>,
				talentBuildsResult: errorResult as ApiResult<TalentBuildsResponse>,
				heroTalentsResult: errorResult as ApiResult<TalentMetaResponse>,
			};
		}

		const heroes = heroesResult.data ?? {};
		const heroEntry = Object.values(heroes).find(
			(h) => h.short_name === params.heroSlug,
		);

		if (!heroEntry) {
			throw notFound();
		}

		const heroName = heroEntry.name;
		const gameType = GAME_MODES[deps.mode]?.apiValue ?? "Storm League";
		const leagueTier = MMR_TIERS[deps.tier]?.apiValue;

		const [talentDetailsResult, talentBuildsResult, heroTalentsResult] =
			await Promise.all([
				getTalentDetails({
					data: {
						timeframe: currentPatch,
						gameType,
						hero: heroName,
						leagueTier,
					},
				}),
				getTalentBuilds({
					data: {
						timeframe: currentPatch,
						gameType,
						hero: heroName,
						leagueTier,
					},
				}),
				getHeroTalents({ data: { hero: heroName } }),
			]);

		return {
			hero: heroEntry,
			heroName,
			talentDetailsResult,
			talentBuildsResult,
			heroTalentsResult,
		};
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.heroName ?? "Hero"} Talents — NexusStats`,
			},
		],
	}),
});

function findBestTalent(
	talents: Array<{ name: string; detail: TalentDetail }>,
): string | null {
	if (talents.length === 0) return null;
	let best = talents[0];
	for (const t of talents.slice(1)) {
		if (t.detail.win_rate > best.detail.win_rate) {
			best = t;
		} else if (
			t.detail.win_rate === best.detail.win_rate &&
			t.detail.games_played > best.detail.games_played
		) {
			best = t;
		}
	}
	return best.name;
}

function HeroTalentPage() {
	const {
		hero,
		heroName,
		talentDetailsResult,
		talentBuildsResult,
		heroTalentsResult,
	} = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const router = useRouter();

	const hasError =
		talentDetailsResult.error ||
		talentBuildsResult.error ||
		heroTalentsResult.error;

	function handleModeChange(mode: string) {
		navigate({
			search: (prev) => ({ ...prev, mode: mode as typeof search.mode }),
		});
	}

	function handleTierChange(tier: string) {
		navigate({
			search: (prev) => ({ ...prev, tier: tier as typeof search.tier }),
		});
	}

	function handleRetry() {
		router.invalidate();
	}

	const talentMetaMap = new Map<string, TalentMeta>();
	if (!heroTalentsResult.error && heroTalentsResult.data) {
		const allMeta: TalentMeta[] = Object.values(heroTalentsResult.data).flat();
		for (const meta of allMeta) {
			talentMetaMap.set(meta.title, meta);
		}
	}

	const talentDetailsForHero =
		!talentDetailsResult.error && talentDetailsResult.data
			? (talentDetailsResult.data[heroName] ?? {})
			: {};

	const buildsForHero =
		!talentBuildsResult.error && talentBuildsResult.data
			? (talentBuildsResult.data[heroName] ?? [])
			: [];

	const hasAnyData =
		Object.keys(talentDetailsForHero).length > 0 || buildsForHero.length > 0;

	return (
		<main className="container hero-talent-page">
			<div className="hero-talent-header">
				<div className="hero-talent-title">
					<h1>{heroName}</h1>
					<span className="hero-talent-role">{hero.new_role}</span>
				</div>
				<Link
					to="/"
					search={{ mode: search.mode, tier: search.tier }}
					className="hero-talent-back"
				>
					Back to all heroes
				</Link>
			</div>

			<div className="hero-talent-filters">
				<FilterBar
					mode={search.mode}
					tier={search.tier}
					onModeChange={handleModeChange}
					onTierChange={handleTierChange}
				/>
			</div>

			{hasError && (
				<ErrorMessage
					message={`Failed to load talent data for ${heroName}. Please try again.`}
					onRetry={handleRetry}
				/>
			)}

			{!hasError && !hasAnyData && (
				<p className="hero-talent-empty">
					Not enough data for this hero with the selected filters.
				</p>
			)}

			{!hasError && hasAnyData && (
				<>
					<div className="hero-talent-tiers">
						{TALENT_LEVELS.map((level) => {
							const levelKey = String(level);
							const levelData = talentDetailsForHero[levelKey] ?? {};
							const talentNames = Object.keys(levelData);

							if (talentNames.length === 0) {
								return (
									<div key={level} className="hero-talent-tier">
										<div className="hero-talent-tier-header">
											<span className="hero-talent-level-badge">{level}</span>
											<span className="hero-talent-level-label">
												LEVEL {level}
											</span>
										</div>
										<p className="hero-talent-empty">
											No talent data available for this tier.
										</p>
									</div>
								);
							}

							const talentsWithDetails = talentNames.map((name) => ({
								name,
								detail: levelData[name] as TalentDetail,
							}));

							const bestTalentName = findBestTalent(talentsWithDetails);

							return (
								<div key={level} className="hero-talent-tier">
									<div className="hero-talent-tier-header">
										<span className="hero-talent-level-badge">{level}</span>
										<span className="hero-talent-level-label">
											LEVEL {level}
										</span>
									</div>
									<div className="hero-talent-cards">
										{talentsWithDetails.map(({ name, detail }) => {
											const meta = talentMetaMap.get(name);
											return (
												<TalentCard
													key={name}
													name={name}
													iconUrl={meta?.icon}
													winRate={detail.win_rate}
													popularity={detail.popularity}
													gamesPlayed={detail.games_played}
													isBest={name === bestTalentName}
												/>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>

					{buildsForHero.length > 0 && (
						<div className="hero-talent-builds">
							<h2>Popular Builds</h2>
							<div className="hero-talent-builds-list">
								{buildsForHero.slice(0, 5).map((build, index) => {
									const talents = build.build_talents.map((talentName) => {
										const meta = talentMetaMap.get(talentName);
										return { name: talentName, iconUrl: meta?.icon };
									});
									const buildKey =
										build.build_talents.join(",") || String(index);
									return (
										<BuildRow
											key={buildKey}
											rank={index + 1}
											talents={talents}
											winRate={build.win_rate}
											gamesPlayed={build.games_played}
										/>
									);
								})}
							</div>
						</div>
					)}
				</>
			)}
		</main>
	);
}

function HeroTalentPendingComponent() {
	return (
		<main className="container hero-talent-page">
			<div className="hero-talent-header">
				<div className="hero-talent-title">
					<h1>&nbsp;</h1>
				</div>
			</div>
			<div className="hero-talent-tiers">
				{TALENT_LEVELS.map((level) => (
					<div key={level} className="hero-talent-tier">
						<div className="hero-talent-tier-header">
							<span className="hero-talent-level-badge">{level}</span>
							<span className="hero-talent-level-label">LEVEL {level}</span>
						</div>
						<div className="hero-talent-cards">
							<SkeletonCard />
							<SkeletonCard />
							<SkeletonCard />
						</div>
					</div>
				))}
			</div>
		</main>
	);
}
