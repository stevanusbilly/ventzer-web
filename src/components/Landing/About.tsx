import './About.css';

const About = () => {
	return (
		<section className='landing-about'>
			<div className='landing-about__container'>
				<div className='landing-about__image'>
					<img
						src='https://nstory.id/wp-content/uploads/2024/11/about-image.webp'
						alt='About'
					/>
				</div>

				<div className='landing-about__content'>
					<span className='section-tag'>Tentang Kami</span>

					<h2>
						Undangan Digital Premium
						<br />
						Dengan Fitur Terlengkap
					</h2>

					<p>
						Kami membantu pasangan pengantin membuat undangan digital yang
						elegan, modern, mudah dibagikan, serta dilengkapi berbagai fitur
						yang mempermudah proses acara.
					</p>

					<div className='about-list'>
						<div className='about-item'>✔ Mudah digunakan</div>

						<div className='about-item'>✔ Desain Premium</div>

						<div className='about-item'>✔ QR Check In</div>

						<div className='about-item'>✔ RSVP Online</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About;
