import './Testimonial.css';

const testimonials = [
	{
		name: 'Michael & Angel',
		role: 'Wedding Couple',
		comment:
			'Sangat membantu mengatur tamu undangan. Proses RSVP dan QR Check-In berjalan lancar sehingga acara menjadi lebih tertata.',
	},
	{
		name: 'Kevin & Felicia',
		role: 'Wedding Couple',
		comment:
			'Dashboard sangat mudah digunakan. Kami dapat memantau jumlah tamu yang hadir secara realtime.',
	},
	{
		name: 'Jonathan & Cindy',
		role: 'Wedding Couple',
		comment:
			'Undangan digital terlihat premium dan semua tamu merasa lebih mudah mengakses informasi acara.',
	},
];

const Testimonial = () => {
	return (
		<section className='landing-testimonial'>
			<div className='landing-container'>
				<span className='section-tag'>Testimonials</span>

				<h2>Apa Kata Pengguna Kami</h2>

				<div className='testimonial-grid'>
					{testimonials.map((item) => (
						<div className='testimonial-card' key={item.name}>
							<div className='quote'>★★★★★</div>

							<p>{item.comment}</p>

							<h4>{item.name}</h4>

							<span>{item.role}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Testimonial;
