import './Footer.css';

const Footer = () => {
	return (
		<footer className='landing-footer'>
			<div className='landing-footer__container'>
				<div className='footer-about'>
					<h2>Wedding Management System</h2>

					<p>
						Platform modern untuk membantu mengelola seluruh kebutuhan acara
						pernikahan mulai dari tamu, RSVP, QR Check-In hingga laporan
						kehadiran.
					</p>
				</div>

				<div className='footer-links'>
					<h3>Navigation</h3>

					<a href='#home'>Home</a>
					<a href='#features'>Features</a>
					<a href='#workflow'>Workflow</a>
					<a href='#pricing'>Pricing</a>
					<a href='#faq'>FAQ</a>
				</div>

				<div className='footer-contact'>
					<h3>Contact</h3>

					<p>📍 Surabaya, Indonesia</p>
					<p>📞 +62 812-3456-7890</p>
					<p>✉️ hello@yourdomain.com</p>
				</div>

				<div className='footer-social'>
					<h3>Follow Us</h3>

					<div className='footer-social__icon'>
						<a href='/'>🌐</a>
						<a href='/'>📘</a>
						<a href='/'>📸</a>
						<a href='/'>▶</a>
					</div>
				</div>
			</div>

			<div className='landing-footer__bottom'>
				© {new Date().getFullYear()} Wedding Management System. All Rights
				Reserved.
			</div>
		</footer>
	);
};

export default Footer;
