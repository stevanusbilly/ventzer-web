import './Hero.css';

const Hero = () => {
	return (
		<section className='landing-hero' id='home'>
			<div className='landing-hero__container'>
				<div className='landing-hero__content'>
					<span className='landing-hero__badge'>
						Wedding Invitation & Management
					</span>

					<h1>
						Solusi Digital
						<br />
						Untuk Pernikahan Modern
					</h1>

					<p>
						Kelola undangan digital, RSVP, QR Check-In, buku tamu, dan dashboard
						tamu dalam satu platform.
					</p>

					<div className='landing-hero__buttons'>
						<a href='#features' className='btn-primary'>
							Pelajari Selengkapnya
						</a>

						<a href='#pricing' className='btn-outline'>
							Lihat Paket
						</a>
					</div>
				</div>

				<div className='landing-hero__image'>
					<img
						src='https://nstory.id/wp-content/uploads/2024/11/mockup-home.webp'
						alt='Hero'
					/>
				</div>
			</div>
		</section>
	);
};

export default Hero;
