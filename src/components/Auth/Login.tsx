import React, { useCallback, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Navigate, Link } from "react-router-dom";
import InvitationFlourish from "../../invitation-templates/InvitationFlourish";
import LoginFlorals from "./LoginFlorals";
import GoogleSignInButton from "./GoogleSignInButton";
import { customerRegisterPath, homePathForRole } from "../../utils/authPaths";
import "./Login.css";

const Login: React.FC = () => {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const { login, loginGoogle, isAuthenticated, user } = useAuth();
	const navigate = useNavigate();

	const handleGoogle = useCallback(
		async (idToken: string): Promise<void> => {
			setLoading(true);
			setError("");
			const result = await loginGoogle(idToken);
			if (result.success) {
				navigate(homePathForRole());
			} else {
				setError(result.message || "Login Google gagal");
			}
			setLoading(false);
		},
		[loginGoogle, navigate],
	);

	if (isAuthenticated) {
		return <Navigate to={homePathForRole(user?.role)} replace />;
	}

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		const result = await login({ username, password, portal: "customer" });
		if (result.success) {
			navigate(homePathForRole());
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
					<p className="login-kicker">Untuk pelanggan</p>
					<h1>Undangan digital untuk hari bahagia Anda.</h1>
					<InvitationFlourish className="login-flourish" />
					<p>Masuk untuk melihat pesanan dan desain undangan Anda.</p>
				</div>
			</aside>
			<main className="login-main">
				<section className="login-card">
					<p className="login-kicker">Selamat datang</p>
					<h1>Masuk</h1>
					<InvitationFlourish className="login-flourish" />
					<p className="login-lead">Gunakan akun pelanggan Anda, atau masuk dengan Google.</p>
					{error && (
						<Message severity="error" text={error} className="w-full mb-3 login-error" />
					)}
					<form onSubmit={handleSubmit} className="login-form">
						<div>
							<label htmlFor="username">Email atau username</label>
							<InputText
								id="username"
								value={username}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setUsername(e.target.value)
								}
								className="w-full"
								autoComplete="username"
								required
							/>
						</div>
						<div>
							<label htmlFor="password">Password</label>
							<Password
								id="password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPassword(e.target.value)
								}
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
					<GoogleSignInButton onToken={(token) => void handleGoogle(token)} />
					<p className="login-switch">
						Belum punya akun? <Link to={customerRegisterPath}>Daftar</Link>
					</p>
				</section>
			</main>
		</div>
	);
};

export default Login;
