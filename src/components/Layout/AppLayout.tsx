import React, { useMemo, useState, ReactNode } from "react";
import { Avatar } from "primereact/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { loginPathForRole, settingsPath } from "../../utils/authPaths";
import "./AppLayout.css";

interface AppLayoutProps {
	children: ReactNode;
}

interface NavItem {
	label: string;
	icon: string;
	path: string;
	roles?: ("admin" | "panitia" | "viewer")[];
}

const ALL_NAV: NavItem[] = [
	{ label: "Dasbor", icon: "pi pi-home", path: "/dashboard" },
	{ label: "Event", icon: "pi pi-calendar", path: "/events" },
	{ label: "Pengguna", icon: "pi pi-user", path: "/users", roles: ["admin"] },
	{
		label: "Kategori Foto",
		icon: "pi pi-images",
		path: "/category_photo",
		roles: ["admin"],
	},
	{
		label: "Template",
		icon: "pi pi-th-large",
		path: "/templates",
		roles: ["admin", "panitia"],
	},
	{ label: "Pengaturan", icon: "pi pi-cog", path: settingsPath },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const { user, logout, isAuthenticated, isViewer } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const navItems = useMemo(() => {
		const role = user?.role || "viewer";
		return ALL_NAV.filter((item) => !item.roles || item.roles.includes(role));
	}, [user?.role]);

	const handleLogout = (): void => {
		logout();
		navigate(loginPathForRole(user?.role));
	};

	const handleNavigate = (path: string): void => {
		navigate(path);
		setMenuOpen(false);
	};

	const navButtons = (
		<>
			{navItems.map((item) => {
				const active =
					location.pathname === item.path ||
					location.pathname.startsWith(`${item.path}/`);
				return (
					<button
						key={item.path}
						type="button"
						className={`dash-nav-link ${active ? "is-active" : ""}`}
						onClick={() => handleNavigate(item.path)}
					>
						<i className={item.icon} />
						{item.label}
					</button>
				);
			})}
		</>
	);

	return (
		<div className="dash-shell">
			<header className="dash-nav">
				<button
					type="button"
					className="dash-nav-toggle"
					aria-label="Buka menu"
					onClick={() => setMenuOpen(true)}
				>
					<i className="pi pi-bars" />
				</button>
				<button
					type="button"
					className="dash-nav-brand"
					onClick={() => handleNavigate("/dashboard")}
				>
					<img
						src="https://nstory.id/wp-content/uploads/2026/01/logoNS-newcolor.png"
						alt="NStory"
					/>
					<span>RSVP Portal</span>
				</button>
				<nav className="dash-nav-links">{navButtons}</nav>
				{isAuthenticated && user && (
					<div className="dash-nav-user">
						<div className="dash-nav-user-meta">
							<strong>{user.name}</strong>
							{!isViewer && <small>{user.role}</small>}
						</div>
						<Avatar label={user.name.charAt(0).toUpperCase()} shape="circle" />
						<button
							type="button"
							className="dash-nav-icon"
							aria-label="Pengaturan"
							onClick={() => handleNavigate(settingsPath)}
						>
							<i className="pi pi-cog" />
						</button>
						<button
							type="button"
							className="dash-nav-icon"
							aria-label="Keluar"
							onClick={handleLogout}
						>
							<i className="pi pi-sign-out" />
						</button>
					</div>
				)}
			</header>

			{menuOpen && (
				<div className="dash-drawer-mask" onClick={() => setMenuOpen(false)}>
					<aside className="dash-drawer" onClick={(event) => event.stopPropagation()}>
						<div className="dash-drawer-head">
							<strong>Menu</strong>
							<button
								type="button"
								className="dash-nav-icon"
								aria-label="Tutup menu"
								onClick={() => setMenuOpen(false)}
							>
								<i className="pi pi-times" />
							</button>
						</div>
						<nav>{navButtons}</nav>
						{isAuthenticated && user && (
							<div className="dash-drawer-foot">
								<div className="dash-nav-user">
									<Avatar
										label={user.name.charAt(0).toUpperCase()}
										shape="circle"
									/>
									<div className="dash-nav-user-meta" style={{ textAlign: "left" }}>
										<strong>{user.name}</strong>
										<small>{user.role}</small>
									</div>
								</div>
								<button
									type="button"
									className="dash-nav-link"
									onClick={() => handleNavigate(settingsPath)}
								>
									<i className="pi pi-cog" />
									Pengaturan
								</button>
								<button type="button" className="dash-nav-link" onClick={handleLogout}>
									<i className="pi pi-sign-out" />
									Keluar
								</button>
							</div>
						)}
					</aside>
				</div>
			)}

			{isViewer &&
				location.pathname !== settingsPath &&
				(!user?.emailVerified || !user?.phoneVerified) && (
				<div className="dash-banner">
					<span>Lengkapi verifikasi email dan nomor telepon di pengaturan akun.</span>
					<button type="button" onClick={() => handleNavigate(settingsPath)}>
						Buka pengaturan
					</button>
				</div>
			)}
			<main className="dash-main">{children}</main>
		</div>
	);
};

export default AppLayout;
