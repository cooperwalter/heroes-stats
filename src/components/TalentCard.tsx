import { formatNumber, formatPercent, getWinRateColor } from "~/lib/format";
import "./TalentCard.css";

interface TalentCardProps {
	name: string;
	iconUrl: string | undefined;
	winRate: number;
	popularity: number;
	gamesPlayed: number | undefined;
	isBest: boolean;
}

export function TalentCard({
	name,
	iconUrl,
	winRate,
	popularity,
	gamesPlayed,
	isBest,
}: TalentCardProps) {
	const color = getWinRateColor(winRate);
	return (
		<div className={`talent-card${isBest ? " talent-card--best" : ""}`}>
			<div className="talent-card-header">
				{iconUrl ? (
					<img
						className="talent-card-icon"
						src={iconUrl}
						alt={name}
						width={32}
						height={32}
					/>
				) : (
					<div className="talent-card-icon talent-card-icon--placeholder">
						{name.slice(0, 2)}
					</div>
				)}
				<span className="talent-card-name">{name}</span>
			</div>
			<div className="talent-card-stats">
				<div className="talent-card-stat">
					<span
						className={`talent-card-stat-value talent-card-stat-value--${color}`}
					>
						{formatPercent(winRate)}
					</span>
					<span className="talent-card-stat-label">Win Rate</span>
				</div>
				<div className="talent-card-stat">
					<span className="talent-card-stat-value">
						{formatPercent(popularity)}
					</span>
					<span className="talent-card-stat-label">Popularity</span>
				</div>
				<div className="talent-card-stat">
					<span className="talent-card-stat-value">
						{gamesPlayed !== undefined ? formatNumber(gamesPlayed) : "\u2014"}
					</span>
					<span className="talent-card-stat-label">Games</span>
				</div>
			</div>
		</div>
	);
}
