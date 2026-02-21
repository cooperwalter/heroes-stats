import "./ErrorMessage.css";

interface ErrorMessageProps {
	message: string;
	onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
	return (
		<div className="error-message">
			<span className="error-message-text">{message}</span>
			<button type="button" className="error-message-retry" onClick={onRetry}>
				Try again
			</button>
		</div>
	);
}
