import { Link } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import { useI18n } from "../i18n/I18nContext";
import { useMarketing } from "../i18n/marketing";

const CatalogPage = () => {
	const { t } = useI18n();
	const { catalog } = useMarketing();

	return (
		<MarketingShell>
			<section className="mkt-hero">
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("catalog.kicker")}</span>
					<h1>{t("catalog.title")}</h1>
					<p className="mkt-lead">{t("catalog.lead")}</p>
				</div>
			</section>
			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap">
					<div className="mkt-grid mkt-grid-3">
						{catalog.map((item) => (
							<article className="mkt-card mkt-catalog-card" key={item.id}>
								<img src={item.image} alt={item.name} />
								<div className="mkt-catalog-meta">
									<small>{item.tag}</small>
									<h3>{item.name}</h3>
									<p>{t("catalog.fit")}</p>
									<div className="mkt-actions">
										<Link className="mkt-btn mkt-btn-primary" to="/daftar">
											{t("catalog.use")}
										</Link>
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</MarketingShell>
	);
};

export default CatalogPage;
