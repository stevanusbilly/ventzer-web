import { Link } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import { CATALOG_ITEMS } from "../data/marketing";

const CatalogPage = () => (
	<MarketingShell>
		<section className="mkt-hero">
			<div className="mkt-wrap mkt-center">
				<span className="mkt-kicker">Katalog desain</span>
				<h1>Banyak pilihan tema yang bikin tamu terkesima.</h1>
				<p className="mkt-lead">
					Untuk warna paling akurat, buka di Chrome atau Safari dan matikan dark
					mode pada browser bawaan Android.
				</p>
			</div>
		</section>
		<section className="mkt-section" style={{ paddingTop: 0 }}>
			<div className="mkt-wrap">
				<div className="mkt-grid mkt-grid-3">
					{CATALOG_ITEMS.map((item) => (
						<article className="mkt-card mkt-catalog-card" key={item.id}>
							<img src={item.image} alt={item.name} />
							<div className="mkt-catalog-meta">
								<small>{item.tag}</small>
								<h3>{item.name}</h3>
								<p>Cocok dipadukan dengan paket Bronze hingga Diamond.</p>
								<div className="mkt-actions">
									<Link className="mkt-btn mkt-btn-primary" to="/daftar">
										Pakai tema ini
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

export default CatalogPage;
