import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import VentzerLogo from "../components/Brand/VentzerLogo";
import { useAuth } from "../contexts/AuthContext";
import { customerLoginPath, settingsPath } from "../utils/authPaths";
import "../components/Auth/Login.css";
import "./VerifyEmailPage.css";

const COPY: Record<string, { title: string; body: string }> = {
	ok: {
		title: "Email terverifikasi",
		body: "Akun Anda sudah bisa memakai fitur yang membutuhkan email terverifikasi.",
	},
	already: {
		title: "Email sudah terverifikasi",
		body: "Tautan ini sudah dipakai sebelumnya. Email akun Anda tetap terverifikasi.",
	},
	invalid: {
		title: "Tautan tidak valid",
		body: "Tautan kedaluwarsa, sudah dipakai, atau tidak dikenali. Kirim tautan baru dari pengaturan akun.",
	},
};

const VerifyEmailPage: React.FC = () => {
	const [params] = useSearchParams();
	const { isAuthenticated, refreshUser } = useAuth();
	const status = params.get("status") || "invalid";
	const copy = COPY[status] || COPY.invalid;

	useEffect(() => {
		document.title = `${copy.title} — VENTZER`;
		return () => {
			document.title = "VENTZER — One Platform. Every Event.";
		};
	}, [copy.title]);

	useEffect(() => {
		if (isAuthenticated && (status === "ok" || status === "already")) {
			void refreshUser();
		}
	}, [isAuthenticated, refreshUser, status]);

	return (
		<div className="login-page verify-email-page">
			<main className="login-main">
				<section className="login-card">
					<VentzerLogo variant="dark" />
					<p className="login-kicker">Verifikasi email</p>
					<h1>{copy.title}</h1>
					<p className="login-lead">{copy.body}</p>
					<div className="verify-email-actions">
						{isAuthenticated ? (
							<Link className="verify-email-btn" to={settingsPath}>
								Buka pengaturan
							</Link>
						) : (
							<Link className="verify-email-btn" to={customerLoginPath}>
								Masuk
							</Link>
						)}
					</div>
				</section>
			</main>
		</div>
	);
};

export default VerifyEmailPage;
