import { Link } from "react-router-dom";
import VentzerLogo from "../../Brand/VentzerLogo";
import { useI18n } from "../../../i18n/I18nContext";
import "./Footer.css";

const Footer = () => {
	const { t } = useI18n();

	return (
		<footer className="landing-footer">
			<div className="landing-footer__container">
				<div className="footer-about">
					<VentzerLogo />
					<h2>{t("footer.tagline")}</h2>
					<p>{t("footer.about")}</p>
				</div>
				<div className="footer-links">
					<h3>{t("footer.nav")}</h3>
					<Link to="/">{t("nav.home")}</Link>
					<Link to="/pricing">{t("nav.pricing")}</Link>
					<Link to="/catalog">{t("nav.catalog")}</Link>
					<Link to="/order-process">{t("nav.order")}</Link>
				</div>
				<div className="footer-contact">
					<h3>{t("footer.products")}</h3>
					<Link to="/pricing">{t("footer.invitation")}</Link>
					<Link to="/pricing#tamu-digital">{t("footer.guest")}</Link>
					<Link to="/pricing#live-streaming">{t("footer.live")}</Link>
				</div>
				<div className="footer-social">
					<h3>{t("footer.account")}</h3>
					<Link to="/login">{t("nav.login")}</Link>
					<Link to="/daftar">{t("nav.register")}</Link>
				</div>
			</div>
			<div className="landing-footer__bottom">
				© {new Date().getFullYear()} VENTZER. {t("footer.rights")}
			</div>
		</footer>
	);
};

export default Footer;
