import "./MiniBar.css";

interface MiniBarProps {
	value: number;
	variant?: "accent" | "green";
}

export function MiniBar({ value, variant = "accent" }: MiniBarProps) {
	const fillClass =
		variant === "green"
			? "mini-bar-fill mini-bar-fill--green"
			: "mini-bar-fill";
	return (
		<div className="mini-bar">
			<div
				className={fillClass}
				style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
			/>
		</div>
	);
}
