import React from "react";

type VentzerLogoProps = {
	variant?: "light" | "dark";
	className?: string;
};

const LOGO_SRC = {
	light: "/brand/ventzer-logo-white.png",
	dark: "/brand/ventzer-logo-navy.png",
} as const;

const VentzerLogo: React.FC<VentzerLogoProps> = ({
	variant = "light",
	className = "",
}) => (
	<img
		className={`vz-logo vz-logo-${variant} ${className}`.trim()}
		src={LOGO_SRC[variant]}
		alt="VENTZER"
		decoding="async"
	/>
);

export default VentzerLogo;
