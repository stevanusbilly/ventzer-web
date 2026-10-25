import './DashboardShowcase.css';

const DashboardShowcase = () => {
	return (
		<section className='dashboard-showcase'>
			<div className='landing-container'>
				<div className='dashboard-header'>
					<span className='section-tag'>Wedding Management Dashboard</span>

					<h2>
						Kelola Semua Dalam
						<br />
						Satu Dashboard
					</h2>

					<p>
						Tidak perlu berpindah aplikasi. Semua proses pernikahan dapat
						dipantau secara realtime dalam satu dashboard.
					</p>
				</div>

				<div className='dashboard-preview'>
					<img src='https://picsum.photos/1200/700' alt='Dashboard' />

					<div className='floating-card top-left'>
						<h4>Guest</h4>

						<span>2.568</span>
					</div>

					<div className='floating-card top-right'>
						<h4>RSVP</h4>

						<span>92%</span>
					</div>

					<div className='floating-card bottom-left'>
						<h4>Check In</h4>

						<span>1.742</span>
					</div>

					<div className='floating-card bottom-right'>
						<h4>Export</h4>

						<span>Excel Ready</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DashboardShowcase;
