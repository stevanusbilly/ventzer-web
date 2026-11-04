import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HOME_PRODUCTS } from "../../data/marketing";

const HomeShowcase = () => {
	const [tab, setTab] = useState(0);
	const [open, setOpen] = useState<Record<string, number>>({
		"undangan-digital": 0,
		"tamu-digital": 0,
		"live-streaming": 0,
	});

	const trackStyle = useMemo(
		() => ({ transform: `translateX(-${tab * 100}%)` }),
		[tab],
	);

	return (
		<>
			<section className="mkt-platform">
				<div className="mkt-wrap mkt-center">
					<h2>Satu platform untuk semua kebutuhan acaramu</h2>
					<p>
						Pengalaman acara yang lebih interaktif: undangan digital, buku tamu
						di lokasi, dan siaran langsung untuk keluarga yang jauh.
					</p>
					<div className="mkt-tabbar mkt-tabbar-light" role="tablist">
						{HOME_PRODUCTS.map((product, index) => (
							<button
								key={product.id}
								type="button"
								role="tab"
								aria-selected={tab === index}
								className={tab === index ? "is-on" : ""}
								onClick={() => setTab(index)}
							>
								{product.title}
							</button>
						))}
					</div>
				</div>
				<div className="mkt-wrap">
					<div className="mkt-slider mkt-platform-slider">
						<div className="mkt-slider-track" style={trackStyle}>
							{HOME_PRODUCTS.map((product) => {
								const active = open[product.id] ?? 0;
								const point = product.features[active];
								return (
									<div className="mkt-slide" key={product.id}>
										<article className="mkt-platform-card">
											<div className="mkt-platform-photo">
												<img src={product.image} alt={product.imageAlt} />
											</div>
											<div className="mkt-platform-copy">
												<small>{product.kicker}</small>
												<h3>{product.title}</h3>
												<div className="mkt-fpills">
													{product.features.map((feature, index) => (
														<button
															key={feature.title}
															type="button"
															className={active === index ? "is-on" : ""}
															onClick={() =>
																setOpen((prev) => ({
																	...prev,
																	[product.id]: index,
																}))
															}
														>
															{feature.title}
														</button>
													))}
												</div>
												<p>{point?.desc || product.summary}</p>
												<div className="mkt-actions">
													<Link className="mkt-btn mkt-btn-primary" to="/daftar">
														Pesan sekarang
													</Link>
													<Link className="mkt-btn mkt-btn-ghost" to={product.href}>
														Lihat detail
													</Link>
												</div>
											</div>
										</article>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{HOME_PRODUCTS.map((product, index) => {
				const active = open[product.id] ?? 0;
				return (
					<section
						className="mkt-section mkt-feat-section"
						id={product.id}
						key={`${product.id}-detail`}
					>
						<div
							className={`mkt-wrap mkt-feat ${index % 2 ? "is-flip" : ""}`}
						>
							<div className="mkt-feat-copy">
								<span className="mkt-kicker">{product.kicker}</span>
								<h2>{product.title}</h2>
								<p className="mkt-lead">{product.summary}</p>
								<div className="mkt-acc">
									{product.features.map((feature, featureIndex) => {
										const isOn = active === featureIndex;
										return (
											<div
												className={`mkt-acc-item ${isOn ? "is-on" : ""}`}
												key={feature.title}
											>
												<button
													type="button"
													aria-expanded={isOn}
													onClick={() =>
														setOpen((prev) => ({
															...prev,
															[product.id]: featureIndex,
														}))
													}
												>
													<i className={feature.icon} />
													<span>{feature.title}</span>
													<b>{isOn ? "−" : "+"}</b>
												</button>
												{isOn && <p>{feature.desc}</p>}
											</div>
										);
									})}
								</div>
								<div className="mkt-actions">
									<Link className="mkt-btn mkt-btn-primary" to="/daftar">
										Pesan sekarang
									</Link>
									<Link className="mkt-btn mkt-btn-ghost" to={product.href}>
										Lihat paket
									</Link>
								</div>
							</div>
							<div className="mkt-feat-visual">
								<img src={product.image} alt={product.imageAlt} />
								<div className="mkt-feat-caption">
									<i className={product.features[active]?.icon} />
									<div>
										<strong>{product.features[active]?.title}</strong>
										<span>{product.kicker}</span>
									</div>
								</div>
							</div>
						</div>
					</section>
				);
			})}
		</>
	);
};

export default HomeShowcase;
