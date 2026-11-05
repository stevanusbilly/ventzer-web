import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";
import VentzerLogo from "../../Brand/VentzerLogo";
import LanguageTabber from "../../Brand/LanguageTabber";
import { useI18n } from "../../../i18n/I18nContext";

const Navbar: React.FC = () => {
	const [open, setOpen] = useState(false);
	const { t } = useI18n();

	useEffect(() => {
		document.body.classList.toggle("nav-lock", open);
		return () => document.body.classList.remove("nav-lock");
	}, [open]);

	const close = (): void => setOpen(false);

	const links = [
		{ to: "/", label: t("nav.home") },
		{ to: "/pricing", label: t("nav.pricing") },
		{ to: "/catalog", label: t("nav.catalog") },
		{ to: "/order-process", label: t("nav.order") },
	];

	return (
		<header className="landing-navbar">
			<div className="landing-navbar__container">
				<Link to="/" className="landing-navbar__logo" onClick={close} aria-label="VENTZER">
					<VentzerLogo />
				</Link>

				<nav className="landing-navbar__menu">
					{links.map((item) => (
						<NavLink key={item.to} to={item.to} end={item.to === "/"}>
							{item.label}
						</NavLink>
					))}
				</nav>

				<div className="landing-navbar__actions">
					<LanguageTabber />
					<Link to="/login" className="landing-navbar__ghost">
						{t("nav.login")}
					</Link>
					<Link to="/daftar" className="landing-navbar__cta">
						{t("nav.register")}
					</Link>
				</div>

				<div className="landing-navbar__mobile-tools">
					<LanguageTabber />
					<button
						type="button"
						className="landing-navbar__toggle"
						aria-label={open ? t("nav.close") : t("nav.open")}
						aria-expanded={open}
						onClick={() => setOpen((value) => !value)}
					>
						<i className={open ? "pi pi-times" : "pi pi-bars"} />
					</button>
				</div>
			</div>

			<div className={`landing-navbar__drawer ${open ? "is-open" : ""}`}>
				<nav>
					{links.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.to === "/"}
							onClick={close}
						>
							{item.label}
						</NavLink>
					))}
				</nav>
				<div className="landing-navbar__drawer-actions">
					<Link to="/login" className="landing-navbar__ghost" onClick={close}>
						{t("nav.login")}
					</Link>
					<Link to="/daftar" className="landing-navbar__cta" onClick={close}>
						{t("nav.register")}
					</Link>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
