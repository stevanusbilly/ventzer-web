import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";

const links = [
	{ to: "/", label: "Home" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/catalog", label: "Catalog" },
	{ to: "/order-process", label: "Order Process" },
];

const Navbar: React.FC = () => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		document.body.classList.toggle("nav-lock", open);
		return () => document.body.classList.remove("nav-lock");
	}, [open]);

	const close = (): void => setOpen(false);

	return (
		<header className="landing-navbar">
			<div className="landing-navbar__container">
				<Link to="/" className="landing-navbar__logo" onClick={close}>
					<img
						src="https://nstory.id/wp-content/uploads/2026/01/logoNS-newcolor.png"
						alt="NStory"
					/>
				</Link>

				<nav className="landing-navbar__menu">
					{links.map((item) => (
						<NavLink key={item.to} to={item.to} end={item.to === "/"}>
							{item.label}
						</NavLink>
					))}
				</nav>

				<div className="landing-navbar__actions">
					<Link to="/login" className="landing-navbar__ghost">
						Masuk
					</Link>
					<Link to="/daftar" className="landing-navbar__cta">
						Daftar
					</Link>
				</div>

				<button
					type="button"
					className="landing-navbar__toggle"
					aria-label={open ? "Tutup menu" : "Buka menu"}
					aria-expanded={open}
					onClick={() => setOpen((value) => !value)}
				>
					<i className={open ? "pi pi-times" : "pi pi-bars"} />
				</button>
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
						Masuk
					</Link>
					<Link to="/daftar" className="landing-navbar__cta" onClick={close}>
						Daftar
					</Link>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
