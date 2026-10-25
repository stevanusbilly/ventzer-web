import './Features.css';

const features = [
	'Puluhan Tema & Desain',
	'Rekap RSVP',
	'Navigasi Lokasi',
	'Ucapan & Tanda Kasih',
	'Background Music',
	'Tanpa Batasan Tamu',
	'Sebar Undangan Otomatis',
	'QR Check-In',
];

const Features = () => {
	return (
		<section className='landing-features' id='features'>
			<div className='landing-features__container'>
				<span className='section-tag'>
					Fitur Kekinian yang Memberikan Banyak Kemudahan
				</span>

				<h2>
					Kenapa <span>NgantenStory?</span>
				</h2>

				<p className='section-desc'>
					NgantenStory dirancang dengan sempurna bagi anda yang memilih untuk
					menghemat biaya pernikahan, namun tetap memiliki kesan elegan dengan
					berbagai macam kemudahan.
				</p>

				<div className='feature-grid'>
					{features.map((item) => (
						<div className='feature-card' key={item}>
							<div className='feature-icon'>✓</div>
							<h3>{item}</h3>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;
