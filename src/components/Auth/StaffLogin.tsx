import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import InvitationFlourish from "../../invitation-templates/InvitationFlourish";
import LoginFlorals from "./LoginFlorals";
import { homePathForRole } from "../../utils/authPaths";
import "./Login.css";

const StaffLogin: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { login, isAuthenticated, user } = useAuth();
	const navigate = useNavigate();

	if (isAuthenticated) {
		return <Navigate to={homePathForRole(user?.role)} replace />;
	}

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		const result = await login({ username, password, portal: "admin" });
		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.message || "Login gagal");
		}
		setLoading(false);
	};

	return (
		<div className="login-page">
			<aside className="login-aside">
				<LoginFlorals />
				<div className="login-aside-copy">
					<p className="login-kicker">RSVP Portal</p>
					<h1>Masuk sebagai tim undangan.</h1>
					<InvitationFlourish className="login-flourish" />
					<p>Admin dan panitia memakai pintu yang sama. Hak akses mengikuti role akun.</p>
				</div>
			</aside>
			<main className="login-main">
				<section className="login-card">
					<p className="login-kicker">Tim undangan</p>
					<h1>Masuk</h1>
					<InvitationFlourish className="login-flourish" />
					<p className="login-lead">
						Halaman ini untuk admin dan panitia. Menu di dalam dashboard menyesuaikan
						wewenang masing-masing.
					</p>
					{error && (
						<Message severity="error" text={error} className="w-full mb-3 login-error" />
					)}
					<form onSubmit={handleSubmit} className="login-form">
						<div>
							<label htmlFor="staff-username">Username</label>
							<InputText
								id="staff-username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full"
								autoComplete="username"
								required
							/>
						</div>
						<div>
							<label htmlFor="staff-password">Password</label>
							<Password
								id="staff-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full"
								inputClassName="w-full"
								feedback={false}
								toggleMask
								autoComplete="current-password"
								required
							/>
						</div>
						<Button
							type="submit"
							label="Masuk"
							icon="pi pi-sign-in"
							loading={loading}
							className="login-submit mt-2"
						/>
					</form>
				</section>
			</main>
		</div>
	);
};

export default StaffLogin;
