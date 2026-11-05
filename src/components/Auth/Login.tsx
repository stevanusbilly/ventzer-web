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
import { customerRegisterPath, homePathForRole } from "../../utils/authPaths";
import { useI18n } from "../../i18n/I18nContext";
import "./Login.css";

const Login: React.FC = () => {
	const { t } = useI18n();
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
		setLoading(true);
		setError("");
		const result = await login({ username, password, portal: "customer" });
		if (result.success) {
			navigate(homePathForRole());
		} else {
			setError(result.message || t("auth.login.fail"));
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
					<h1>{t("auth.tagline")}</h1>
					<p>{t("auth.login.aside")}</p>
				</div>
			</aside>
			<main className="login-main">
				<section className="login-card">
					<p className="login-kicker">{t("auth.welcome")}</p>
					<h1>{t("auth.login.title")}</h1>
					<p className="login-lead">{t("auth.login.lead")}</p>
					{error && (
						<Message severity="error" text={error} className="w-full mb-3 login-error" />
					)}
					<form onSubmit={handleSubmit} className="login-form">
						<div>
							<label htmlFor="username">{t("auth.login.user")}</label>
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
							<label htmlFor="password">{t("auth.login.password")}</label>
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
							label={t("auth.login.submit")}
							icon="pi pi-sign-in"
							loading={loading}
							className="login-submit mt-2"
						/>
					</form>
					<GoogleSignInButton onToken={(token) => void handleGoogle(token)} />
					<p className="login-switch">
						{t("auth.login.switch")} <Link to={customerRegisterPath}>{t("nav.register")}</Link>
					</p>
				</section>
			</main>
		</div>
	);
};

export default Login;
