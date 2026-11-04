import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HomeShowcase from "../components/Marketing/HomeShowcase";
import MarketingShell from "../components/Marketing/MarketingShell";
import PackageCard from "../components/Marketing/PackageCard";
import {
	CATALOG_ITEMS,
	HOME_PRODUCTS,
	HOME_QUOTES,
	HOME_TRUST,
	MARKETING_FAQS,
	ORDER_STEPS,
	RSVP_PACKAGES,
} from "../data/marketing";

const LandingPage = () => {
	const [openFaq, setOpenFaq] = useState<number | null>(0);
	const [hero, setHero] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setHero((value) => (value + 1) % HOME_PRODUCTS.length);
		}, 4200);
		return () => window.clearInterval(timer);
	}, []);

	const slide = HOME_PRODUCTS[hero];

	return (
		<MarketingShell>
			<section className="mkt-hero">
				<div className="mkt-wrap mkt-hero-grid">
					<div>
						<span className="mkt-kicker">#1 Platform undangan digital</span>
						<h1>Solusi digital pernikahan impianmu</h1>
						<p className="mkt-lead">
							Jadikan hari bahagia lebih modern dengan NgantenStory. Undangan
							digital, buku tamu di lokasi, dan live streaming — dikerjakan tim,
							siap sebar, garansi sampai hari H.
						</p>
						<div className="mkt-actions">
							<Link className="mkt-btn mkt-btn-primary" to="/daftar">
								Pesan sekarang
							</Link>
							<Link className="mkt-btn mkt-btn-ghost" to="/catalog">
								Coba lihat tema
							</Link>
						</div>
						<div className="mkt-hero-pills">
							{HOME_PRODUCTS.map((product) => (
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
							{HOME_PRODUCTS.map((product, index) => (
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
					{[...HOME_TRUST, ...HOME_TRUST].map((item, index) => (
						<span key={`${item}-${index}`}>{item}</span>
					))}
				</div>
			</div>

			<section className="mkt-band">
				<div className="mkt-wrap mkt-band-grid">
					<div>
						<strong>2019</strong>
						<span>Pasangan mempercayakan hari bahagianya pada kami</span>
					</div>
					<div>
						<strong>4,9</strong>
						<span>Rating yang konsisten dari couples yang sudah merayakan</span>
					</div>
					<div>
						<strong>Tanpa DP</strong>
						<span>Cukup sekali bayar. Revisi berjalan sampai desain final</span>
					</div>
				</div>
			</section>

			<section className="mkt-section">
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">Kata pasangan</span>
					<h2>Cerita yang membuat kami terus merancang dengan hati</h2>
					<p className="mkt-lead">
						Setiap undangan membawa kisah. Ini yang sering kami dengar setelah
						hari H mereda.
					</p>
				</div>
				<div className="mkt-wrap mkt-quotes">
					{HOME_QUOTES.map((item) => (
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
					<span className="mkt-kicker">Katalog</span>
					<h2>Setiap template membawa ceritanya sendiri</h2>
					<p className="mkt-lead">
						Pilih tema yang paling dekat dengan kalian. Warna paling akurat di
						Chrome atau Safari.
					</p>
					<div className="mkt-grid mkt-grid-3" style={{ marginTop: "2rem", textAlign: "left" }}>
						{CATALOG_ITEMS.slice(0, 3).map((item) => (
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
							Jelajahi template
						</Link>
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">Paket</span>
					<h2>Temukan paket yang paling pas</h2>
					<p className="mkt-lead">
						Mulai undangan digital dari Rp 125.000. Buku tamu dan live streaming
						siap dipadukan sesuai hari H.
					</p>
					<div className="mkt-grid mkt-grid-4" style={{ marginTop: "2rem", textAlign: "left" }}>
						{RSVP_PACKAGES.map((pack) => (
							<PackageCard key={pack.id} pack={pack} compact />
						))}
					</div>
					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-primary" to="/pricing">
							Bandingkan semua paket
						</Link>
					</div>
				</div>
			</section>

			<section className="mkt-section" style={{ paddingTop: 0 }}>
				<div className="mkt-wrap mkt-center">
					<span className="mkt-kicker">Cara kerja</span>
					<h2>Dari pilih tema sampai sebar undangan</h2>
					<div className="mkt-steps" style={{ marginTop: "2rem", textAlign: "left" }}>
						{ORDER_STEPS.map((step) => (
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
					<span className="mkt-kicker">FAQ</span>
					<h2>Pertanyaan yang sering muncul</h2>
					<div className="mkt-faq">
						{MARKETING_FAQS.map((item, index) => (
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
					<h2>Rencanakan pengalaman baru untuk pernikahanmu</h2>
					<p>
						Kami siap mengerjakan undangan, buku tamu, dan siaran langsung —
						supaya kalian tinggal merayakan.
					</p>
					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-primary" to="/daftar">
							Coba gratis
						</Link>
						<Link className="mkt-btn mkt-btn-ghost" to="/pricing">
							Pesan sekarang
						</Link>
					</div>
				</section>
			</div>
		</MarketingShell>
	);
};

export default LandingPage;
