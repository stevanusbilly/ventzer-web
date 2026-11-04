import React from "react";
import { Link } from "react-router-dom";
import { MarketingPackage } from "../../data/marketing";

const PackageCard: React.FC<{ pack: MarketingPackage; compact?: boolean }> = ({
	pack,
	compact,
}) => {
	const features = compact ? pack.features.slice(0, 5) : pack.features;
	return (
		<article className={`mkt-card ${pack.highlight ? "is-hot" : ""}`}>
			{pack.badge && <span className="mkt-badge">{pack.badge}</span>}
			{pack.eyebrow && <small>{pack.eyebrow}</small>}
			<h3>{pack.name}</h3>
			<p>{pack.description}</p>
			<div className="mkt-price">
				<b>{pack.price.current}</b>
				{pack.price.was && <s>{pack.price.was}</s>}
			</div>
			<ul className="mkt-list">
				{features.map((item) => (
					<li key={item}>{item}</li>
				))}
				{compact && pack.features.length > features.length && (
					<li>+{pack.features.length - features.length} fitur lain</li>
				)}
			</ul>
			{pack.bonus && <div className="mkt-bonus">{pack.bonus}</div>}
			<Link className="mkt-btn mkt-btn-primary" to="/daftar">
				Pesan paket ini
			</Link>
		</article>
	);
};

export default PackageCard;
