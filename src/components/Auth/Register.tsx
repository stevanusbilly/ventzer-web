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
import { customerLoginPath, homePathForRole } from "../../utils/authPaths";
import "./Login.css";

const Register: React.FC = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { register, loginGoogle, isAuthenticated, user } = useAuth();
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
		if (password !== confirm) {
			setError("Konfirmasi password tidak sama");
			return;
		}
		setLoading(true);
		setError("");
		const result = await register({ name, email, phone, password });
		if (result.success) {
			navigate(homePathForRole());
		} else {
			setError(result.message || "Pendaftaran gagal");
		}
		setLoading(false);
	};

	return (
		<div className="login-page">
			<aside className="login-aside">
				<LoginFlorals />
				<div className="login-aside-copy">
					<p className="login-kicker">Untuk pelanggan</p>
					<h1>Buat akun untuk hari bahagia Anda.</h1>
					<InvitationFlourish className="login-flourish" />
					<p>Daftar dengan email dan nomor telepon, atau langsung dengan Google.</p>
				</div>
			</aside>
			<main className="login-main">
				<section className="login-card">
					<p className="login-kicker">Selamat datang</p>
					<h1>Daftar</h1>
					<InvitationFlourish className="login-flourish" />
					<p className="login-lead">Akun ini khusus pelanggan, bukan tim undangan.</p>
					{error && (
						<Message severity="error" text={error} className="w-full mb-3 login-error" />
					)}
					<form onSubmit={handleSubmit} className="login-form">
						<div>
							<label htmlFor="register-name">Nama</label>
							<InputText
								id="register-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full"
								autoComplete="name"
								required
							/>
						</div>
						<div>
							<label htmlFor="register-email">Email</label>
							<InputText
								id="register-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full"
								autoComplete="email"
								required
							/>
						</div>
						<div>
							<label htmlFor="register-phone">Nomor telepon</label>
							<InputText
								id="register-phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="w-full"
								autoComplete="tel"
								placeholder="08xxxxxxxxxx"
								required
							/>
						</div>
						<div>
							<label htmlFor="register-password">Password</label>
							<Password
								id="register-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full"
								inputClassName="w-full"
								toggleMask
								autoComplete="new-password"
								required
							/>
						</div>
						<div>
							<label htmlFor="register-confirm">Konfirmasi password</label>
							<Password
								id="register-confirm"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								className="w-full"
								inputClassName="w-full"
								feedback={false}
								toggleMask
								autoComplete="new-password"
								required
							/>
						</div>
						<Button
							type="submit"
							label="Daftar"
							icon="pi pi-user-plus"
							loading={loading}
							className="login-submit mt-2"
						/>
					</form>
					<GoogleSignInButton onToken={(token) => void handleGoogle(token)} />
					<p className="login-switch">
						Sudah punya akun? <Link to={customerLoginPath}>Masuk</Link>
					</p>
				</section>
			</main>
		</div>
	);
};

export default Register;
