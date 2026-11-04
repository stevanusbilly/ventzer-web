import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import PackageCard from "../components/Marketing/PackageCard";
import {
	ADDONS,
	CUSTOM_RSVP,
	GUESTBOOK_PACKAGE,
	LIVE_STREAM_PACKAGES,
	RSVP_PACKAGES,
	STARTER_FEATURES,
} from "../data/marketing";

const TABS = [
	{ id: "undangan", label: "Undangan Digital" },
	{ id: "tamu-digital", label: "Buku Tamu Digital" },
	{ id: "live-streaming", label: "Live Streaming" },
] as const;

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
					<span className="mkt-kicker">Pricelist</span>
					<h1>Pilih paket yang paling pas untuk hari bahagiamu.</h1>
					<p className="mkt-lead">
						Kami menawarkan berbagai pilihan paket yang dapat disesuaikan dengan
						gaya dan anggaranmu.
					</p>
					<div className="mkt-tabbar" role="tablist" aria-label="Kategori paket">
						{TABS.map((item, index) => (
							<button
								key={item.id}
								type="button"
								role="tab"
								aria-selected={tab === index}
								className={tab === index ? "is-on" : ""}
								onClick={() => selectTab(index)}
							>
								{item.label}
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
									<h2>Paket RSVP</h2>
									<p className="mkt-lead">
										Starter fitur ada di semua paket: nama tamu, sebar undangan,
										galeri, maps, musik, amplop digital, dan kolom ucapan.
									</p>
								</div>
								<div className="mkt-chips" style={{ marginBottom: "1.6rem" }}>
									{STARTER_FEATURES.map((item) => (
										<div className="mkt-chip" key={item}>
											<i className="pi pi-check" />
											<span>{item}</span>
										</div>
									))}
								</div>
								<div className="mkt-grid mkt-grid-4">
									{RSVP_PACKAGES.map((pack) => (
										<PackageCard key={pack.id} pack={pack} />
									))}
								</div>
								<div className="mkt-grid mkt-grid-2" style={{ marginTop: "1.1rem" }}>
									<PackageCard pack={CUSTOM_RSVP} />
									<div className="mkt-grid">
										{ADDONS.map((item) => (
											<article className="mkt-card" key={item.title}>
												<small>Add-on</small>
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
									<h2>Buku Tamu Digital</h2>
									<p className="mkt-lead">
										Paket di lokasi dengan undangan tak terbatas, RSVP, QR, meja,
										e-gift, tablet, modem, dan crew.
									</p>
								</div>
								<div style={{ maxWidth: "36rem", margin: "0 auto" }}>
									<PackageCard pack={GUESTBOOK_PACKAGE} />
								</div>
							</div>

							<div className="mkt-slide" id="live-streaming" role="tabpanel">
								<div className="mkt-center mkt-slide-intro">
									<h2>Live Streaming</h2>
									<p className="mkt-lead">
										Semua paket mencakup jam siaran, YouTube/Instagram, rekaman,
										modem, frame, live cam to screen, camera movement, dan crew.
									</p>
								</div>
								<div className="mkt-grid mkt-grid-3">
									{LIVE_STREAM_PACKAGES.map((pack) => (
										<PackageCard key={pack.id} pack={pack} />
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="mkt-actions" style={{ justifyContent: "center" }}>
						<Link className="mkt-btn mkt-btn-ghost" to="/order-process">
							Lihat proses pemesanan
						</Link>
					</div>
				</div>
			</section>
		</MarketingShell>
	);
};

export default PricingPage;
