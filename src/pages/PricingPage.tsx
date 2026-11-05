import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import PackageCard from "../components/Marketing/PackageCard";
import { useI18n } from "../i18n/I18nContext";
import { useMarketing } from "../i18n/marketing";
import { UiKey } from "../i18n/ui";

const TABS: { id: string; label: UiKey }[] = [
	{ id: "undangan", label: "pricing.tab.invitation" },
	{ id: "tamu-digital", label: "pricing.tab.guestbook" },
	{ id: "live-streaming", label: "pricing.tab.live" },
];

const tabFromHash = (hash: string): number => {
	if (hash.includes("live-streaming")) {
		return 2;
	}
	if (hash.includes("tamu-digital")) {
		return 1;
	}
	return 0;
};

const PricingPage = () => {
	const location = useLocation();
	const { t } = useI18n();
	const marketing = useMarketing();
	const [tab, setTab] = useState(() => tabFromHash(location.hash));

	useEffect(() => {
		setTab(tabFromHash(location.hash));
	}, [location.hash]);

	const selectTab = (index: number): void => {
		setTab(index);
		const nextHash = TABS[index]?.id === "undangan" ? "" : TABS[index]?.id;
		window.history.replaceState(
			null,
			"",
			nextHash ? `/pricing#${nextHash}` : "/pricing",
		);
	};

	const trackStyle = useMemo(
		() => ({ transform: `translateX(-${tab * 33.333}%)` }),
		[tab],
	);

	return (
		<MarketingShell>
			<section className="mkt-hero">
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("pricing.kicker")}</span>
					<h1>{t("pricing.title")}</h1>
					<p className="mkt-lead">{t("pricing.lead")}</p>
					<div className="mkt-tabbar mkt-tabbar-light" role="tablist" aria-label={t("lang.label")}>
						{TABS.map((item, index) => (
							<button
								key={item.id}
								type="button"
								role="tab"
								aria-selected={tab === index}
								className={tab === index ? "is-on" : ""}
								onClick={() => selectTab(index)}
							>
								{t(item.label)}
							</button>
						))}
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap">
					<div className="mkt-slider">
						<div className="mkt-slider-track" style={trackStyle}>
							<div className="mkt-slide" role="tabpanel">
								<div className="mkt-center mkt-slide-intro">
									<h2>{t("pricing.rsvp.title")}</h2>
									<p className="mkt-lead">{t("pricing.rsvp.lead")}</p>
								</div>
								<div className="mkt-chips" style={{ marginBottom: "1.6rem" }}>
									{marketing.starterFeatures.map((item) => (
										<div className="mkt-chip" key={item}>
											<i className="pi pi-check" />
											<span>{item}</span>
										</div>
									))}
								</div>
								<div className="mkt-grid mkt-grid-4">
									{marketing.rsvpPackages.map((pack) => (
										<PackageCard key={pack.id} pack={pack} />
									))}
								</div>
								<div className="mkt-grid mkt-grid-2" style={{ marginTop: "1.1rem" }}>
									<PackageCard pack={marketing.customRsvp} />
									<div className="mkt-grid">
										{marketing.addons.map((item) => (
											<article className="mkt-card" key={item.title}>
												<small>{t("pricing.addon")}</small>
												<h3>{item.title}</h3>
												<p>{item.detail}</p>
												<div className="mkt-price">
													<b>{item.price}</b>
												</div>
											</article>
										))}
									</div>
								</div>
							</div>

							<div className="mkt-slide" id="tamu-digital" role="tabpanel">
								<div className="mkt-center mkt-slide-intro">
									<h2>{t("pricing.guestbook.title")}</h2>
									<p className="mkt-lead">{t("pricing.guestbook.lead")}</p>
								</div>
								<div style={{ maxWidth: "36rem", margin: "0 auto" }}>
									<PackageCard pack={marketing.guestbook} />
								</div>
							</div>

							<div className="mkt-slide" id="live-streaming" role="tabpanel">
								<div className="mkt-center mkt-slide-intro">
									<h2>{t("pricing.live.title")}</h2>
									<p className="mkt-lead">{t("pricing.live.lead")}</p>
								</div>
								<div className="mkt-grid mkt-grid-3">
									{marketing.livePackages.map((pack) => (
										<PackageCard key={pack.id} pack={pack} />
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-ghost" to="/order-process">
							{t("pricing.process")}
						</Link>
					</div>
				</div>
			</section>
		</MarketingShell>
	);
};

export default PricingPage;
