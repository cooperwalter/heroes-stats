import "./FilterBar.css";

interface FilterBarProps {
	mode: string;
	tier: string;
	onModeChange: (mode: string) => void;
	onTierChange: (tier: string) => void;
}

const GAME_MODES = [
	{ label: "Storm League", value: "sl" },
	{ label: "Quick Match", value: "qm" },
	{ label: "ARAM", value: "aram" },
	{ label: "Unranked Draft", value: "ud" },
];

const MMR_TIERS = [
	{ label: "All Ranks", value: "all" },
	{ label: "Master", value: "6" },
	{ label: "Diamond", value: "5" },
	{ label: "Platinum", value: "4" },
	{ label: "Gold", value: "3" },
	{ label: "Silver", value: "2" },
	{ label: "Bronze", value: "1" },
	{ label: "Wood", value: "0" },
];

export function FilterBar({
	mode,
	tier,
	onModeChange,
	onTierChange,
}: FilterBarProps) {
	return (
		<div className="filter-bar">
			<div className="filter-bar-modes">
				{GAME_MODES.map((gm) => (
					<button
						key={gm.value}
						type="button"
						className={`filter-bar-mode-btn${mode === gm.value ? " filter-bar-mode-btn--active" : ""}`}
						onClick={() => onModeChange(gm.value)}
					>
						{gm.label}
					</button>
				))}
			</div>
			<select
				className="filter-bar-tier"
				value={tier}
				onChange={(e) => onTierChange(e.target.value)}
			>
				{MMR_TIERS.map((t) => (
					<option key={t.value} value={t.value}>
						{t.label}
					</option>
				))}
			</select>
		</div>
	);
}
