import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HomeShowcase from "../components/Marketing/HomeShowcase";
import MarketingShell from "../components/Marketing/MarketingShell";
import PackageCard from "../components/Marketing/PackageCard";
import { useI18n } from "../i18n/I18nContext";
import { useMarketing } from "../i18n/marketing";

const LandingPage = () => {
	const { t } = useI18n();
	const marketing = useMarketing();
	const [openFaq, setOpenFaq] = useState<number | null>(0);
	const [hero, setHero] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setHero((value) => (value + 1) % marketing.homeProducts.length);
		}, 4200);
		return () => window.clearInterval(timer);
	}, [marketing.homeProducts.length]);

	const slide = marketing.homeProducts[hero] || marketing.homeProducts[0];

	return (
		<MarketingShell>
			<section className="mkt-hero">
				<div className="mkt-wrap mkt-hero-grid">
					<div>
						<span className="mkt-kicker">{t("home.kicker")}</span>
						<h1>One Platform. Every Event.</h1>
						<p className="mkt-lead">{t("home.lead")}</p>
						<div className="mkt-actions">
							<Link className="mkt-btn mkt-btn-primary" to="/daftar">
								{t("home.cta.order")}
							</Link>
							<Link className="mkt-btn mkt-btn-ghost" to="/catalog">
								{t("home.cta.templates")}
							</Link>
						</div>
						<div className="mkt-hero-pills">
							{marketing.homeProducts.map((product) => (
								<a key={product.id} href={`#${product.id}`}>
									{product.title}
								</a>
							))}
						</div>
					</div>
					<div className="mkt-hero-art">
						<div className="mkt-hero-stage">
							<img src={slide.image} alt={slide.imageAlt} />
							<div className="mkt-hero-caption">
								<small>{slide.kicker}</small>
								<strong>{slide.title}</strong>
							</div>
						</div>
						<div className="mkt-hero-dots">
							{marketing.homeProducts.map((product, index) => (
								<button
									key={product.id}
									type="button"
									aria-label={product.title}
									className={hero === index ? "is-on" : ""}
									onClick={() => setHero(index)}
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			<div className="mkt-trust">
				<div className="mkt-trust-track">
					{[...marketing.trust, ...marketing.trust].map((item, index) => (
						<span key={`${item}-${index}`}>{item}</span>
					))}
				</div>
			</div>

			<section className="mkt-band">
				<div className="mkt-wrap mkt-band-grid">
					<div>
						<strong>4</strong>
						<span>{t("home.stat.products")}</span>
					</div>
					<div>
						<strong>1</strong>
						<span>{t("home.stat.dashboard")}</span>
					</div>
					<div>
						<strong>∞</strong>
						<span>{t("home.stat.themes")}</span>
					</div>
				</div>
			</section>

			<section className="mkt-section">
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("home.platform.kicker")}</span>
					<h2>{t("home.platform.title")}</h2>
					<p className="mkt-lead">{t("home.platform.lead")}</p>
					<div className="mkt-pillars">
						{marketing.pillars.map((item) => (
							<article className="mkt-pillar" key={item.title}>
								<i className={item.icon} />
								<h3>{item.title}</h3>
								<p>{item.desc}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("home.quotes.kicker")}</span>
					<h2>{t("home.quotes.title")}</h2>
					<p className="mkt-lead">{t("home.quotes.lead")}</p>
				</div>
				<div className="mkt-wrap mkt-quotes">
					{marketing.quotes.map((item) => (
						<blockquote className="mkt-quote" key={item.couple}>
							<p>“{item.quote}”</p>
							<footer>
								<b>{item.couple}</b>
								<span>{item.place}</span>
							</footer>
						</blockquote>
					))}
				</div>
			</section>

			<HomeShowcase />

			<section className="mkt-section">
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("home.catalog.kicker")}</span>
					<h2>{t("home.catalog.title")}</h2>
					<p className="mkt-lead">{t("home.catalog.lead")}</p>
					<div className="mkt-grid mkt-grid-3" style={{ marginTop: "2rem", textAlign: "left" }}>
						{marketing.catalog.slice(0, 3).map((item) => (
							<article className="mkt-card mkt-catalog-card" key={item.id}>
								<img src={item.image} alt={item.name} />
								<div className="mkt-catalog-meta">
									<small>{item.tag}</small>
									<h3>{item.name}</h3>
								</div>
							</article>
						))}
					</div>
					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-ghost" to="/catalog">
							{t("home.catalog.browse")}
						</Link>
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("home.pack.kicker")}</span>
					<h2>{t("home.pack.title")}</h2>
					<p className="mkt-lead">{t("home.pack.lead")}</p>
					<div className="mkt-grid mkt-grid-4" style={{ marginTop: "2rem", textAlign: "left" }}>
						{marketing.rsvpPackages.map((pack) => (
							<PackageCard key={pack.id} pack={pack} compact />
						))}
					</div>
					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-primary" to="/pricing">
							{t("home.pack.compare")}
						</Link>
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("home.how.kicker")}</span>
					<h2>{t("home.how.title")}</h2>
					<div className="mkt-steps" style={{ marginTop: "2rem", textAlign: "left" }}>
						{marketing.orderSteps.map((step) => (
							<article className="mkt-step" key={step.no}>
								<span>{step.no}</span>
								<h3>{step.title}</h3>
								<p>{step.desc}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">{t("home.faq.kicker")}</span>
					<h2>{t("home.faq.title")}</h2>
					<div className="mkt-faq">
						{marketing.faqs.map((item, index) => (
							<div className="mkt-faq-item" key={item.question}>
								<button
									type="button"
									onClick={() => setOpenFaq(openFaq === index ? null : index)}
								>
									<span>{item.question}</span>
									<span>{openFaq === index ? "−" : "+"}</span>
								</button>
								{openFaq === index && <p>{item.answer}</p>}
							</div>
						))}
					</div>
				</div>
			</section>

			<div className="mkt-wrap">
				<section className="mkt-cta">
					<h2>{t("home.cta.title")}</h2>
					<p>{t("home.cta.lead")}</p>
					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-primary" to="/daftar">
							{t("home.cta.try")}
						</Link>
						<Link className="mkt-btn mkt-btn-ghost" to="/pricing">
							{t("home.cta.order")}
						</Link>
					</div>
				</section>
			</div>
		</MarketingShell>
	);
};

export default LandingPage;
