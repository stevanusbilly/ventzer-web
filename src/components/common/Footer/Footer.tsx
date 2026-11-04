import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
	return (
		<footer className="landing-footer">
			<div className="landing-footer__container">
				<div className="footer-about">
					<h2>NgantenStory</h2>
					<p>
						Undangan digital, RSVP, buku tamu, dan live streaming. Dipercaya
						sejak 2019, garansi hingga hari H.
					</p>
				</div>
				<div className="footer-links">
					<h3>Navigasi</h3>
					<Link to="/">Beranda</Link>
					<Link to="/pricing">Harga</Link>
					<Link to="/catalog">Katalog</Link>
					<Link to="/order-process">Proses Pesan</Link>
				</div>
				<div className="footer-contact">
					<h3>Paket</h3>
					<Link to="/pricing">Undangan digital</Link>
					<Link to="/pricing#tamu-digital">Buku tamu digital</Link>
					<Link to="/pricing#live-streaming">Live streaming</Link>
				</div>
				<div className="footer-social">
					<h3>Akun</h3>
					<Link to="/login">Masuk</Link>
					<Link to="/daftar">Daftar</Link>
				</div>
			</div>
			<div className="landing-footer__bottom">
				© {new Date().getFullYear()} NgantenStory. All rights reserved.
			</div>
		</footer>
	);
};

export default Footer;
