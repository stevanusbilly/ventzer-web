import React from "react";

const InvitationFlourish: React.FC<{ className?: string }> = ({ className }) => (
	<span className={className} aria-hidden="true">
		<svg viewBox="0 0 88 16" fill="none">
			<path
				d="M2 8h28M58 8h28"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
			/>
			<path
				d="M44 2.5c2.4 2.4 2.4 6.2 0 8.6-2.4-2.4-2.4-6.2 0-8.6Z"
				fill="currentColor"
			/>
			<circle cx="36" cy="8" r="1.2" fill="currentColor" />
			<circle cx="52" cy="8" r="1.2" fill="currentColor" />
		</svg>
	</span>
);

export default InvitationFlourish;
