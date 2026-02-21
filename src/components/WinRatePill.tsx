import { formatPercent, getWinRateColor } from "~/lib/format";
import "./WinRatePill.css";

interface WinRatePillProps {
	winRate: number;
}

export function WinRatePill({ winRate }: WinRatePillProps) {
	const color = getWinRateColor(winRate);
	return (
		<span className={`win-rate-pill win-rate-pill--${color}`}>
			{formatPercent(winRate)}
		</span>
	);
}
