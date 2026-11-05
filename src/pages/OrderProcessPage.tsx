import { Link } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import { useI18n } from "../i18n/I18nContext";
import { useMarketing } from "../i18n/marketing";

const OrderProcessPage = () => {
	const { t } = useI18n();
	const { orderSteps } = useMarketing();

	return (
		<MarketingShell>
			<section className="mkt-hero">
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("order.kicker")}</span>
					<h1>{t("order.title")}</h1>
					<p className="mkt-lead">{t("order.lead")}</p>
				</div>
			</section>
			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap">
					<div className="mkt-steps">
						{orderSteps.map((step) => (
							<article className="mkt-step" key={step.no}>
								<span>{step.no}</span>
								<h3>{step.title}</h3>
								<p>{step.desc}</p>
							</article>
						))}
					</div>
					<div className="mkt-grid mkt-grid-3" style={{ marginTop: "2rem" }}>
						<article className="mkt-card">
							<small>{t("order.duration")}</small>
							<h3>{t("order.duration.title")}</h3>
							<p>{t("order.duration.desc")}</p>
						</article>
						<article className="mkt-card">
							<small>{t("order.revision")}</small>
							<h3>{t("order.revision.title")}</h3>
							<p>{t("order.revision.desc")}</p>
						</article>
						<article className="mkt-card">
							<small>{t("order.share")}</small>
							<h3>{t("order.share.title")}</h3>
							<p>{t("order.share.desc")}</p>
						</article>
					</div>
					<div className="mkt-actions" style={{ justifyContent: "center", marginTop: "2rem" }}>
						<Link className="mkt-btn mkt-btn-primary" to="/daftar">
							{t("order.start")}
						</Link>
						<Link className="mkt-btn mkt-btn-ghost" to="/pricing">
							{t("order.seePrices")}
						</Link>
					</div>
				</div>
			</section>
		</MarketingShell>
	);
};

export default OrderProcessPage;
