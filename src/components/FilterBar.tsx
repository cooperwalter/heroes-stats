import { GAME_MODES, MMR_TIERS } from "~/lib/filters";
import "./FilterBar.css";

interface FilterBarProps {
	mode: string;
	tier: string;
	onModeChange: (mode: string) => void;
	onTierChange: (tier: string) => void;
}

const gameModeEntries = Object.entries(GAME_MODES);
const tierEntries = Object.entries(MMR_TIERS);

export function FilterBar({
	mode,
	tier,
	onModeChange,
	onTierChange,
}: FilterBarProps) {
	return (
		<div className="filter-bar">
			<div className="filter-bar-modes">
				{gameModeEntries.map(([key, gm]) => (
					<button
						key={key}
						type="button"
						className={`filter-bar-mode-btn${mode === key ? " filter-bar-mode-btn--active" : ""}`}
						aria-pressed={mode === key}
						onClick={() => onModeChange(key)}
					>
						{gm.display}
					</button>
				))}
			</div>
			<select
				className="filter-bar-tier"
				aria-label="MMR Tier"
				value={tier}
				onChange={(e) => onTierChange(e.target.value)}
			>
				{tierEntries.map(([key, t]) => (
					<option key={key} value={key}>
						{t.display}
					</option>
				))}
			</select>
		</div>
	);
}
