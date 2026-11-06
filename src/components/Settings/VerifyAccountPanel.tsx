import React, { useState } from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiError";
import "../../pages/CustomerHome.css";

const VerifyAccountPanel: React.FC = () => {
	const { user, updateUser } = useAuth();
	const [emailHint, setEmailHint] = useState("");
	const [emailPreviewUrl, setEmailPreviewUrl] = useState("");
	const [error, setError] = useState("");
	const [loadingEmail, setLoadingEmail] = useState(false);

	const sendEmail = async (): Promise<void> => {
		setLoadingEmail(true);
		setError("");
		setEmailPreviewUrl("");
		try {
			const result = await authService.sendEmailCode();
			if (result.user) {
				updateUser(result.user);
			}
			setEmailHint(result.message);
			if (result.previewUrl) {
				setEmailPreviewUrl(result.previewUrl);
			}
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal mengirim tautan email"));
		}
		setLoadingEmail(false);
	};

	return (
		<div className="settings-verify">
			<p className="settings-lead">
				Verifikasi email sebelum memesan undangan. Login Google otomatis
				menandai email sudah terverifikasi. Nomor telepon tetap disimpan di
				profil, tanpa verifikasi OTP.
			</p>
			{error && (
				<Message severity="error" text={error} className="w-full mb-3 login-error" />
			)}
			<section className={`verify-card ${user?.emailVerified ? "is-done" : ""}`}>
				<div className="verify-card-head">
					<h2>Email</h2>
					<span>{user?.emailVerified ? "Terverifikasi" : "Belum verifikasi"}</span>
				</div>
				<p>{user?.email}</p>
				{!user?.emailVerified && (
					<>
						<p>Cek inbox dan klik tautannya. Tautan berlaku 24 jam.</p>
						<div className="verify-actions">
							<Button
								label="Kirim tautan verifikasi"
								loading={loadingEmail}
								onClick={() => void sendEmail()}
							/>
						</div>
					</>
				)}
				{emailHint && <p className="verify-hint">{emailHint}</p>}
				{emailPreviewUrl && (
					<p className="verify-hint">
						Tautan pengembangan:{" "}
						<a href={emailPreviewUrl}>{emailPreviewUrl}</a>
					</p>
				)}
			</section>
		</div>
	);
};

export default VerifyAccountPanel;
