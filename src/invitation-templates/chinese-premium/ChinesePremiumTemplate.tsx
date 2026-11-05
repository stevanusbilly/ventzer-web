import React from "react";
import { ClassicInvitationTemplate } from "../classic-tsx";
import type { ClassicInvitationProps } from "../classic-tsx";
import "./ChinesePremiumTemplate.css";

const themeAssets = {
	"--cpt-hero-image": 'url("/invitation-assets/chinese-premium/hero-cover.webp")',
	"--cpt-paper-image": 'url("/invitation-assets/chinese-premium/section-landscape.webp")',
	"--cpt-closing-image": 'url("/invitation-assets/chinese-premium/closing-background.webp")',
} as React.CSSProperties;

const ChinesePremiumTemplate: React.FC<ClassicInvitationProps> = (props) => (
	<div className="cpt-theme" style={themeAssets}>
		<div className="cpt-ambient" aria-hidden="true">
			<span className="cpt-lantern cpt-lantern-left" />
			<span className="cpt-lantern cpt-lantern-right" />
			<span className="cpt-petal cpt-petal-one" />
			<span className="cpt-petal cpt-petal-two" />
			<span className="cpt-petal cpt-petal-three" />
			<span className="cpt-petal cpt-petal-four" />
		</div>
		<ClassicInvitationTemplate {...props} />
	</div>
);

export default ChinesePremiumTemplate;
