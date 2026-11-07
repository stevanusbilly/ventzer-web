import React, { useMemo, useState, ReactNode } from "react";
import { Avatar } from "primereact/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { loginPathForRole, settingsPath } from "../../utils/authPaths";
import VentzerLogo from "../Brand/VentzerLogo";
import LanguageTabber from "../Brand/LanguageTabber";
import { useI18n } from "../../i18n/I18nContext";
import { UiKey } from "../../i18n/ui";
import "./AppLayout.css";

interface AppLayoutProps {
	children: ReactNode;
}

interface NavItem {
	label: UiKey;
	icon: string;
	path: string;
	roles?: ("admin" | "panitia" | "viewer")[];
}

const ALL_NAV: NavItem[] = [
	{ label: "dash.nav.dashboard", icon: "pi pi-home", path: "/dashboard" },
	{ label: "dash.nav.events", icon: "pi pi-calendar", path: "/events" },
	{ label: "dash.nav.users", icon: "pi pi-user", path: "/users", roles: ["admin"] },
	{
		label: "dash.nav.photos",
		icon: "pi pi-images",
		path: "/category_photo",
		roles: ["admin"],
	},
	{
		label: "dash.nav.templateCategories",
		icon: "pi pi-tags",
		path: "/category_template",
		roles: ["admin"],
	},
	{
		label: "dash.nav.templates",
		icon: "pi pi-th-large",
		path: "/templates",
		roles: ["admin", "panitia"],
	},
	{ label: "dash.nav.settings", icon: "pi pi-cog", path: settingsPath },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const { user, logout, isAuthenticated, isViewer } = useAuth();
	const { t } = useI18n();
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
						{t(item.label)}
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
					aria-label={t("dash.open")}
					onClick={() => setMenuOpen(true)}
				>
					<i className="pi pi-bars" />
				</button>
				<button
					type="button"
					className="dash-nav-brand"
					onClick={() => handleNavigate("/dashboard")}
				>
					<VentzerLogo variant="light" />
					<span>{t("dash.portal")}</span>
				</button>
				<nav className="dash-nav-links">{navButtons}</nav>
				<LanguageTabber variant="light" />
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
							aria-label={t("dash.logoutAria")}
							title={t("dash.logout")}
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
							<strong>{t("dash.menu")}</strong>
							<button
								type="button"
								className="dash-nav-icon"
								aria-label={t("dash.close")}
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
										{!isViewer && <small>{user.role}</small>}
									</div>
								</div>
								<button type="button" className="dash-nav-link" onClick={handleLogout}>
									<i className="pi pi-sign-out" />
									{t("dash.logout")}
								</button>
							</div>
						)}
					</aside>
				</div>
			)}

			{isViewer &&
				location.pathname !== settingsPath &&
				!user?.emailVerified && (
				<div className="dash-banner">
					<span>{t("dash.verify")}</span>
					<button type="button" onClick={() => handleNavigate(settingsPath)}>
						{t("dash.verifyCta")}
					</button>
				</div>
			)}
			<main className="dash-main">{children}</main>
		</div>
	);
};

export default AppLayout;
