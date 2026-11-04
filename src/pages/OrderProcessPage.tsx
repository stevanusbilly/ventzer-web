import { Link } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import { ORDER_STEPS } from "../data/marketing";

const OrderProcessPage = () => (
	<MarketingShell>
		<section className="mkt-hero">
			<div className="mkt-wrap mkt-center">
				<span className="mkt-kicker">Proses pemesanan</span>
				<h1>Tunggu di rumah, kami yang kerjakan.</h1>
				<p className="mkt-lead">
					Tanpa DP. Pengerjaan reguler 3–5 hari kerja, revisi unlimited, sebar
					undangan lewat WhatsApp.
				</p>
			</div>
		</section>
		<section className="mkt-section" style={{ paddingTop: 0 }}>
			<div className="mkt-wrap">
				<div className="mkt-steps">
					{ORDER_STEPS.map((step) => (
						<article className="mkt-step" key={step.no}>
							<span>{step.no}</span>
							<h3>{step.title}</h3>
							<p>{step.desc}</p>
						</article>
					))}
				</div>
				<div className="mkt-grid mkt-grid-3" style={{ marginTop: "2rem" }}>
					<article className="mkt-card">
						<small>Durasi</small>
						<h3>3–5 hari kerja</h3>
						<p>Custom desain 5–7 hari. Express 24 jam dengan tambahan Rp 50.000.</p>
					</article>
					<article className="mkt-card">
						<small>Revisi</small>
						<h3>Unlimited</h3>
						<p>Kami revisi sampai final. Support tetap ada sampai hari H.</p>
					</article>
					<article className="mkt-card">
						<small>Sebar undangan</small>
						<h3>WhatsApp</h3>
						<p>Listing tamu otomatis, nama personal, RSVP terpantau di dashboard.</p>
					</article>
				</div>
				<div className="mkt-actions" style={{ justifyContent: "center", marginTop: "2rem" }}>
					<Link className="mkt-btn mkt-btn-primary" to="/daftar">
						Mulai pemesanan
					</Link>
					<Link className="mkt-btn mkt-btn-ghost" to="/pricing">
						Lihat harga dulu
					</Link>
				</div>
			</div>
		</section>
	</MarketingShell>
);

export default OrderProcessPage;
