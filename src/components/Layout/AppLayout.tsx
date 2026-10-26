import React, { useState, ReactNode, useMemo } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

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
	{ label: "Dashboard", icon: "pi pi-home", path: "/dashboard" },
	{ label: "Users", icon: "pi pi-user", path: "/users", roles: ["admin"] },
	{
		label: "Category Photo",
		icon: "pi pi-list",
		path: "/category_photo",
		roles: ["admin"],
	},
	{ label: "Templates", icon: "pi pi-list", path: "/templates", roles: ["admin"] },
	{ label: "Events", icon: "pi pi-calendar", path: "/events" },
	{ label: "Location", icon: "pi pi-map-marker", path: "/event_location", roles: ["admin", "panitia"] },
	{ label: "Photo", icon: "pi pi-image", path: "/event_photo", roles: ["admin", "panitia"] },
	{ label: "Guests", icon: "pi pi-users", path: "/guests" },
	{ label: "Guest Message", icon: "pi pi-envelope", path: "/guest_message" },
	{ label: "Gift", icon: "pi pi-gift", path: "/gift", roles: ["admin", "panitia"] },
	{ label: "Table", icon: "pi pi-clone", path: "/event_table", roles: ["admin", "panitia"] },
	{ label: "Check-in", icon: "pi pi-check-circle", path: "/checkin", roles: ["admin", "panitia"] },
	{ label: "Setting", icon: "pi pi-info-circle", path: "/event_setting", roles: ["admin", "panitia"] },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const [visible, setVisible] = useState(false);
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const navItems = useMemo(() => {
		const role = user?.role || "viewer";
		return ALL_NAV.filter(
			(item) => !item.roles || item.roles.includes(role),
		);
	}, [user?.role]);

	const handleLogout = (): void => {
		logout();
		navigate("/login");
	};

	const handleNavigate = (path: string): void => {
		navigate(path);
		setVisible(false);
	};

	const renderSidebarNavigation = () => (
		<div className="flex flex-column justify-content-between h-full">
			<ul className="list-none p-0 m-0 flex flex-column gap-1">
				{navItems.map((item) => {
					const active = location.pathname === item.path;
					return (
						<li key={item.path}>
							<div
								onClick={() => handleNavigate(item.path)}
								className={`flex align-items-center px-3 py-2 border-round cursor-pointer ${
									active
										? "bg-primary text-primary-contrast font-semibold"
										: "text-700 hover:surface-hover"
								}`}
							>
								<i className={`${item.icon} mr-3`} />
								<span>{item.label}</span>
							</div>
						</li>
					);
				})}
			</ul>
			{isAuthenticated && user && (
				<div className="pt-3 border-top-1 surface-border">
					<div className="flex align-items-center gap-2 p-2 mb-3">
						<Avatar label={user.name.charAt(0).toUpperCase()} shape="circle" />
						<div>
							<div className="font-semibold text-sm">{user.name}</div>
							<div className="text-xs text-500">{user.role}</div>
						</div>
					</div>
					<Button
						label="Keluar"
						icon="pi pi-sign-out"
						severity="danger"
						outlined
						className="w-full"
						onClick={handleLogout}
					/>
				</div>
			)}
		</div>
	);

	return (
		<div className="min-h-screen flex surface-ground">
			<aside className="hidden md:flex flex-column surface-card border-right-1 surface-border sticky top-0 h-screen w-18rem p-3">
				<div
					className="font-bold text-xl text-primary mb-3 cursor-pointer"
					onClick={() => navigate("/dashboard")}
				>
					RSVP Portal
				</div>
				{renderSidebarNavigation()}
			</aside>
			<Sidebar visible={visible} onHide={() => setVisible(false)} className="md:hidden w-20rem">
				{renderSidebarNavigation()}
			</Sidebar>
			<div className="flex-1 flex flex-column min-w-0">
				<header className="surface-card shadow-1 px-4 py-3 flex md:hidden align-items-center gap-3">
					<Button icon="pi pi-bars" text onClick={() => setVisible(true)} />
					<span className="font-bold">RSVP Portal</span>
				</header>
				<main className="p-4 flex-1">{children}</main>
			</div>
		</div>
	);
};

export default AppLayout;
