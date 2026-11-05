import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import VentzerLogo from "../Brand/VentzerLogo";
import LanguageTabber from "../Brand/LanguageTabber";
import { homePathForRole } from "../../utils/authPaths";
import { useI18n } from "../../i18n/I18nContext";
import "./Login.css";

const StaffLogin: React.FC = () => {
	const { t } = useI18n();
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
					<p className="login-kicker">{t("auth.staff.kicker")}</p>
					<h1>{t("auth.staff.asideTitle")}</h1>
					<p>{t("auth.staff.aside")}</p>
				</div>
			</aside>
			<main className="login-main">
				<section className="login-card">
					<p className="login-kicker">{t("auth.staff.welcome")}</p>
					<h1>{t("auth.login.title")}</h1>
					<p className="login-lead">{t("auth.staff.lead")}</p>
					{error && (
						<Message severity="error" text={error} className="w-full mb-3 login-error" />
					)}
					<form onSubmit={handleSubmit} className="login-form">
						<div>
							<label htmlFor="staff-username">{t("auth.staff.user")}</label>
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
							<label htmlFor="staff-password">{t("auth.login.password")}</label>
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
							label={t("auth.login.submit")}
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
