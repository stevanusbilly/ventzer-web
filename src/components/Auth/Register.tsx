import React, { useCallback, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Navigate, Link } from "react-router-dom";
import VentzerLogo from "../Brand/VentzerLogo";
import LanguageTabber from "../Brand/LanguageTabber";
import GoogleSignInButton from "./GoogleSignInButton";
import { customerLoginPath, homePathForRole } from "../../utils/authPaths";
import { useI18n } from "../../i18n/I18nContext";
import "./Login.css";

const Register: React.FC = () => {
	const { t } = useI18n();
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
				setError(result.message || t("auth.login.googleFail"));
			}
			setLoading(false);
		},
		[loginGoogle, navigate, t],
	);

	if (isAuthenticated) {
		return <Navigate to={homePathForRole(user?.role)} replace />;
	}

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (password !== confirm) {
			setError(t("auth.register.mismatch"));
			return;
		}
		setLoading(true);
		setError("");
		const result = await register({ name, email, phone, password });
		if (result.success) {
			navigate(homePathForRole());
		} else {
			setError(result.message || t("auth.register.fail"));
		}
		setLoading(false);
	};

	return (
		<div className="login-page">
			<aside className="login-aside">
				<div className="login-aside-copy">
					<LanguageTabber />
					<VentzerLogo />
					<p className="login-kicker">{t("auth.customer")}</p>
					<h1>{t("auth.register.asideTitle")}</h1>
					<p>{t("auth.register.aside")}</p>
				</div>
			</aside>
			<main className="login-main">
				<section className="login-card">
					<p className="login-kicker">{t("auth.welcome")}</p>
					<h1>{t("auth.register.title")}</h1>
					<p className="login-lead">{t("auth.register.lead")}</p>
					{error && (
						<Message severity="error" text={error} className="w-full mb-3 login-error" />
					)}
					<form onSubmit={handleSubmit} className="login-form">
						<div>
							<label htmlFor="register-name">{t("auth.register.name")}</label>
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
							<label htmlFor="register-email">{t("auth.register.email")}</label>
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
							<label htmlFor="register-phone">{t("auth.register.phone")}</label>
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
							<label htmlFor="register-password">{t("auth.register.password")}</label>
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
							<label htmlFor="register-confirm">{t("auth.register.confirm")}</label>
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
							label={t("auth.register.submit")}
							icon="pi pi-user-plus"
							loading={loading}
							className="login-submit mt-2"
						/>
					</form>
					<GoogleSignInButton onToken={(token) => void handleGoogle(token)} />
					<p className="login-switch">
						{t("auth.register.switch")} <Link to={customerLoginPath}>{t("nav.login")}</Link>
					</p>
				</section>
			</main>
		</div>
	);
};

export default Register;
