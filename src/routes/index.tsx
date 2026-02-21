import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FilterBar } from "~/components/FilterBar";
import { HeroPortrait } from "~/components/HeroPortrait";
import { MiniBar } from "~/components/MiniBar";
import { SkeletonRow } from "~/components/SkeletonRow";
import { StatCard } from "~/components/StatCard";
import { WinRatePill } from "~/components/WinRatePill";
import { getHeroes, getHeroStats } from "~/lib/api";
import type { ModeKey, TierKey } from "~/lib/filters";
import { filterSearchSchema, GAME_MODES, MMR_TIERS } from "~/lib/filters";
import { formatNumber, formatPercent } from "~/lib/format";
import { resolveLatestPatch } from "~/lib/patches";
import type { Hero, HeroStats } from "~/lib/types";
import "./index.css";

export const Route = createFileRoute("/")({
	validateSearch: filterSearchSchema,
	head: () => ({
		meta: [{ title: "Hero Stats — NexusStats" }],
	}),
	loaderDeps: ({ search }) => ({ mode: search.mode, tier: search.tier }),
	component: HeroStatsPage,
	pendingComponent: PendingComponent,
	loader: async ({ deps }) => {
		const { mode, tier } = deps;
		const { currentPatch, previousPatch } = await resolveLatestPatch();

		const gameType = GAME_MODES[mode].apiValue;
		const leagueTier = MMR_TIERS[tier].apiValue;

		const [heroesResult, currentStatsResult, previousStatsResult] =
			await Promise.all([
				getHeroes(),
				getHeroStats({
					data: { timeframe: currentPatch, gameType, leagueTier },
				}),
				previousPatch
					? getHeroStats({
							data: {
								timeframe: previousPatch,
								gameType,
								leagueTier,
							},
						})
					: Promise.resolve(null),
			]);

		return {
			heroesResult,
			currentStatsResult,
			previousStatsResult,
			currentPatch,
			previousPatch,
		};
	},
});

type SortColumn =
	| "name"
	| "win_rate"
	| "change"
	| "pick_rate"
	| "ban_rate"
	| "games_played";

type SortDirection = "asc" | "desc";

interface HeroRow {
	hero: Hero;
	stats: HeroStats;
	prevStats: HeroStats | null;
}

function HeroStatsPage() {
	const { heroesResult, currentStatsResult, previousStatsResult } =
		Route.useLoaderData();
	const { mode, tier } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const router = useRouter();

	const [sortColumn, setSortColumn] = useState<SortColumn>("win_rate");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const onModeChange = (newMode: string) => {
		navigate({
			search: (prev) => ({ ...prev, mode: newMode as ModeKey }),
		});
	};

	const onTierChange = (newTier: string) => {
		navigate({
			search: (prev) => ({ ...prev, tier: newTier as TierKey }),
		});
	};

	if (heroesResult.error || currentStatsResult.error) {
		const message = heroesResult.error
			? heroesResult.message
			: currentStatsResult.error
				? currentStatsResult.message
				: "Failed to load data";
		return (
			<main className="container hero-stats-page">
				<div className="hero-stats-header">
					<h1>Hero Stats</h1>
				</div>
				<div className="hero-stats-filters">
					<FilterBar
						mode={mode}
						tier={tier}
						onModeChange={onModeChange}
						onTierChange={onTierChange}
					/>
				</div>
				<ErrorMessage message={message} onRetry={() => router.invalidate()} />
			</main>
		);
	}

	const heroes = heroesResult.data ?? {};
	const currentStats = currentStatsResult.data ?? {};
	const previousStats =
		previousStatsResult && !previousStatsResult.error
			? (previousStatsResult.data ?? null)
			: null;

	const heroRows: HeroRow[] = Object.entries(currentStats)
		.map(([shortName, stats]) => {
			const hero = heroes[shortName];
			if (!hero) return null;
			const prevStats = previousStats
				? (previousStats[shortName] ?? null)
				: null;
			return { hero, stats, prevStats };
		})
		.filter((row): row is HeroRow => row !== null);

	if (heroRows.length === 0) {
		return (
			<main className="container hero-stats-page">
				<div className="hero-stats-header">
					<h1>Hero Stats</h1>
				</div>
				<div className="hero-stats-filters">
					<FilterBar
						mode={mode}
						tier={tier}
						onModeChange={onModeChange}
						onTierChange={onTierChange}
					/>
				</div>
				<p className="heroes-table-empty">
					No data available for this game mode and rank.
				</p>
			</main>
		);
	}

	const totalGames = heroRows.reduce((sum, r) => sum + r.stats.games_played, 0);
	const heroesPlayed = heroRows.filter((r) => r.stats.games_played > 0).length;
	const playedRows = heroRows.filter((r) => r.stats.games_played > 0);
	const avgWinRate =
		playedRows.length > 0
			? playedRows.reduce((sum, r) => sum + r.stats.win_rate, 0) /
				playedRows.length
			: 0;
	const mostBanned = heroRows.reduce((best, r) =>
		r.stats.ban_rate > best.stats.ban_rate ? r : best,
	);

	const getWinRateChange = (row: HeroRow): number | null => {
		if (!row.prevStats) return null;
		return row.stats.win_rate - row.prevStats.win_rate;
	};

	const sorted = [...heroRows].sort((a, b) => {
		let primary = 0;
		if (sortColumn === "name") {
			primary = a.hero.name.localeCompare(b.hero.name);
		} else if (sortColumn === "win_rate") {
			primary = a.stats.win_rate - b.stats.win_rate;
		} else if (sortColumn === "change") {
			const aChange = getWinRateChange(a);
			const bChange = getWinRateChange(b);
			if (aChange === null && bChange === null) primary = 0;
			else if (aChange === null) primary = -1;
			else if (bChange === null) primary = 1;
			else primary = aChange - bChange;
		} else if (sortColumn === "pick_rate") {
			primary = a.stats.pick_rate - b.stats.pick_rate;
		} else if (sortColumn === "ban_rate") {
			primary = a.stats.ban_rate - b.stats.ban_rate;
		} else if (sortColumn === "games_played") {
			primary = a.stats.games_played - b.stats.games_played;
		}

		if (sortDirection === "desc") primary = -primary;

		if (primary !== 0) return primary;
		return a.hero.name.localeCompare(b.hero.name);
	});

	const handleSort = (col: SortColumn) => {
		if (col === sortColumn) {
			setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(col);
			setSortDirection("desc");
		}
	};

	const sortIndicator = (col: SortColumn) => {
		if (col !== sortColumn) return null;
		return (
			<span className="sort-indicator">
				{sortDirection === "asc" ? "▲" : "▼"}
			</span>
		);
	};

	const thClass = (col: SortColumn) =>
		`sortable${sortColumn === col ? " sorted" : ""}`;

	return (
		<main className="container hero-stats-page">
			<div className="hero-stats-header">
				<h1>Hero Stats</h1>
				<p className="hero-stats-subtitle">
					Statistics for all heroes in the current patch
				</p>
			</div>

			<div className="hero-stats-filters">
				<FilterBar
					mode={mode}
					tier={tier}
					onModeChange={onModeChange}
					onTierChange={onTierChange}
				/>
			</div>

			<div className="stat-cards-grid">
				<StatCard label="Total Games" value={formatNumber(totalGames)} />
				<StatCard label="Heroes Played" value={String(heroesPlayed)} />
				<StatCard label="Avg Win Rate" value={formatPercent(avgWinRate)} />
				<StatCard label="Most Banned" value={mostBanned.hero.name} />
			</div>

			<div className="heroes-table-wrapper">
				<table className="heroes-table">
					<thead>
						<tr>
							<th className="heroes-table-rank">#</th>
							<th
								className={thClass("name")}
								onClick={() => handleSort("name")}
							>
								Hero{sortIndicator("name")}
							</th>
							<th
								className={thClass("win_rate")}
								onClick={() => handleSort("win_rate")}
							>
								Win Rate{sortIndicator("win_rate")}
							</th>
							<th
								className={thClass("change")}
								onClick={() => handleSort("change")}
							>
								Change{sortIndicator("change")}
							</th>
							<th
								className={thClass("pick_rate")}
								onClick={() => handleSort("pick_rate")}
							>
								Pick Rate{sortIndicator("pick_rate")}
							</th>
							<th
								className={thClass("ban_rate")}
								onClick={() => handleSort("ban_rate")}
							>
								Ban Rate{sortIndicator("ban_rate")}
							</th>
							<th
								className={thClass("games_played")}
								onClick={() => handleSort("games_played")}
							>
								Games Played{sortIndicator("games_played")}
							</th>
						</tr>
					</thead>
					<tbody>
						{sorted.map((row, index) => {
							const change = getWinRateChange(row);
							return (
								<tr
									key={row.hero.short_name}
									onClick={() =>
										navigate({
											to: "/heroes/$heroSlug",
											params: { heroSlug: row.hero.short_name },
											search: { mode, tier },
										})
									}
								>
									<td className="heroes-table-rank">{index + 1}</td>
									<td>
										<div className="hero-cell">
											<HeroPortrait name={row.hero.name} />
											<div className="hero-cell-info">
												<span className="hero-cell-name">{row.hero.name}</span>
												<span className="hero-cell-role">
													{row.hero.new_role}
												</span>
											</div>
										</div>
									</td>
									<td>
										<WinRatePill winRate={row.stats.win_rate} />
									</td>
									<td>
										{change === null ? (
											<span className="win-rate-change win-rate-change--neutral">
												—
											</span>
										) : change > 0 ? (
											<span className="win-rate-change win-rate-change--positive">
												+{formatPercent(change)}
											</span>
										) : (
											<span className="win-rate-change win-rate-change--negative">
												−{formatPercent(Math.abs(change))}
											</span>
										)}
									</td>
									<td>
										<div className="pick-rate-cell">
											<span className="pick-rate-value">
												{formatPercent(row.stats.pick_rate)}
											</span>
											<MiniBar value={row.stats.pick_rate} />
										</div>
									</td>
									<td>{formatPercent(row.stats.ban_rate)}</td>
									<td>{formatNumber(row.stats.games_played)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</main>
	);
}

export function PendingComponent() {
	return (
		<main className="container hero-stats-page">
			<div className="hero-stats-header">
				<h1>Hero Stats</h1>
			</div>
			<div className="heroes-table-wrapper">
				<div className="skeleton-table-body">
					{(["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const).map(
						(key) => (
							<div key={key} className="skeleton-table-row-wrapper">
								<SkeletonRow />
							</div>
						),
					)}
				</div>
			</div>
		</main>
	);
}
