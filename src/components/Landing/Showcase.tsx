import './Showcase.css';

const Showcase = () => {
	return (
		<section className='landing-showcase'>
			<div className='landing-showcase__container'>
				<div className='landing-showcase__image'>
					<img
						src='https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900'
						alt='Dashboard'
					/>
				</div>

				<div className='landing-showcase__content'>
					<span className='section-tag'>Wedding Management System</span>

					<h2>Semua Kebutuhan Pernikahan Dalam Satu Dashboard</h2>

					<p>
						Tidak perlu lagi menggunakan banyak aplikasi. Mulai dari membuat
						event, upload tamu, RSVP, QR Check-In, hingga laporan kehadiran
						tersedia dalam satu dashboard yang mudah digunakan.
					</p>

					<div className='showcase-list'>
						<div className='showcase-item'>✔ Dashboard Event</div>

						<div className='showcase-item'>✔ Guest Management</div>

						<div className='showcase-item'>✔ RSVP Monitoring</div>

						<div className='showcase-item'>✔ QR Check-In</div>

						<div className='showcase-item'>✔ Real-time Report</div>

						<div className='showcase-item'>✔ Export Excel</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Showcase;
