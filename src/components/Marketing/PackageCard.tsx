import React from "react";
import { Link } from "react-router-dom";
import { MarketingPackage } from "../../data/marketing";
import { useI18n } from "../../i18n/I18nContext";

const PackageCard: React.FC<{ pack: MarketingPackage; compact?: boolean }> = ({
	pack,
	compact,
}) => {
	const { t } = useI18n();
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
					<li>+{pack.features.length - features.length} {t("pack.more")}</li>
				)}
			</ul>
			{pack.bonus && <div className="mkt-bonus">{pack.bonus}</div>}
			<Link className="mkt-btn mkt-btn-primary" to="/daftar">
				{t("pack.order")}
			</Link>
		</article>
	);
};

export default PackageCard;
