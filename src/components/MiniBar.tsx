import "./MiniBar.css";

interface MiniBarProps {
	value: number;
}

export function MiniBar({ value }: MiniBarProps) {
	return (
		<div className="mini-bar">
			<div
				className="mini-bar-fill"
				style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
			/>
		</div>
	);
}
