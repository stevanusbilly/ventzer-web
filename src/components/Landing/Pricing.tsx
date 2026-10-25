import './Pricing.css';

const Pricing = () => {
	return (
		<section className='landing-pricing' id='pricing'>
			<div className='landing-container'>
				<span className='section-tag'>Pricing</span>

				<h2>Pilih Paket Terbaik</h2>

				<div className='pricing-grid'>
					<div className='pricing-card'>
						<h3>Basic</h3>

						<h1>Rp199K</h1>

						<ul>
							<li>✓ 1 Event</li>
							<li>✓ RSVP</li>
							<li>✓ QR Check-In</li>
							<li>✓ Dashboard</li>
						</ul>
					</div>

					<div className='pricing-card active'>
						<div className='badge'>POPULAR</div>

						<h3>Professional</h3>

						<h1>Rp499K</h1>

						<ul>
							<li>✓ Semua fitur Basic</li>
							<li>✓ Unlimited Guest</li>
							<li>✓ Export Excel</li>
							<li>✓ WhatsApp Blast</li>
						</ul>
					</div>

					<div className='pricing-card'>
						<h3>Enterprise</h3>

						<h1>Custom</h1>

						<ul>
							<li>✓ Unlimited Event</li>
							<li>✓ Multi User</li>
							<li>✓ Priority Support</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Pricing;
