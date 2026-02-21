import { formatNumber, formatPercent, getWinRateColor } from "~/lib/format";
import "./BuildRow.css";

interface TalentItem {
	name: string;
	iconUrl: string | undefined;
}

interface BuildRowProps {
	rank: number;
	talents: TalentItem[];
	winRate: number;
	gamesPlayed: number | undefined;
}

export function BuildRow({
	rank,
	talents,
	winRate,
	gamesPlayed,
}: BuildRowProps) {
	const color = getWinRateColor(winRate);
	return (
		<div className="build-row">
			<span className="build-row-rank">{rank}</span>
			<div className="build-row-talents">
				{talents.map((talent) =>
					talent.iconUrl ? (
						<img
							key={talent.name}
							className="build-row-talent-icon"
							src={talent.iconUrl}
							alt={talent.name}
							width={32}
							height={32}
						/>
					) : (
						<div
							key={talent.name}
							className="build-row-talent-icon build-row-talent-icon--placeholder"
						>
							{talent.name.slice(0, 2)}
						</div>
					),
				)}
			</div>
			<div className="build-row-right">
				<span className={`build-row-win-rate build-row-win-rate--${color}`}>
					{formatPercent(winRate)}
				</span>
				{gamesPlayed !== undefined && (
					<span className="build-row-games">
						{formatNumber(gamesPlayed)} games
					</span>
				)}
			</div>
		</div>
	);
}
