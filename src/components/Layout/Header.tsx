import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MenuItem } from "primereact/menuitem";

const Header: React.FC = () => {
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const handleLogout = (): void => {
		logout();
		navigate("/login");
	};

	const items: MenuItem[] = isAuthenticated
		? [
				{
					label: "Users",
					icon: "pi pi-users",
					command: () => navigate("/user"),
				},
				{
					label: "Category Photo",
					icon: "pi pi-list",
					command: () => navigate("/category_photo"),
				},
				{
					label: "Templates",
					icon: "pi pi-list",
					command: () => navigate("/templates"),
				},
				{
					label: "Events",
					icon: "pi pi-calendar",
					command: () => navigate("/events"),
				},
				{
					label: "Guest Message",
					icon: "pi pi-users",
					command: () => navigate("/guest_message"),
				},
				{
					label: "Gift",
					icon: "pi pi-users",
					command: () => navigate("/gift"),
				},
				{
					label: "Check-in",
					icon: "pi pi-check-circle",
					command: () => navigate("/checkin"),
				},
		  ]
		: [];

	const start = (
		<img alt="logo" src="/logo.png" height="40" className="mr-2"></img>
	);

	const end = isAuthenticated ? (
		<div className="flex align-items-center gap-2">
			<span>Welcome, {user?.name}</span>
			<Button
				label="Logout"
				icon="pi pi-sign-out"
				className="p-button-text p-button-plain"
				onClick={handleLogout}
			/>
		</div>
	) : (
		<Button
			label="Login"
			icon="pi pi-sign-in"
			className="p-button-text"
			onClick={() => navigate("/login")}
		/>
	);

	return (
		<div className="card">
			<Menubar model={items} start={start} end={end} />
		</div>
	);
};

export default Header;
