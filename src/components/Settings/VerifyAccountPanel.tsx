import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiError";
import "../../pages/CustomerHome.css";

const VerifyAccountPanel: React.FC = () => {
	const { user, updateUser } = useAuth();
	const [phone, setPhone] = useState(user?.phone || "");
	const [phoneCode, setPhoneCode] = useState("");
	const [emailHint, setEmailHint] = useState("");
	const [emailPreviewUrl, setEmailPreviewUrl] = useState("");
	const [phoneHint, setPhoneHint] = useState("");
	const [error, setError] = useState("");
	const [loadingEmail, setLoadingEmail] = useState(false);
	const [loadingPhone, setLoadingPhone] = useState(false);

	useEffect(() => {
		if (user?.phone) {
			setPhone(user.phone);
		}
	}, [user?.phone]);

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

	const sendPhone = async (): Promise<void> => {
		setLoadingPhone(true);
		setError("");
		try {
			const result = await authService.sendPhoneCode(phone);
			if (result.user) {
				updateUser(result.user);
			}
			setPhoneHint(
				result.previewCode
					? `Kode pengembangan: ${result.previewCode}`
					: result.message,
			);
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal mengirim kode telepon"));
		}
		setLoadingPhone(false);
	};

	const confirmPhone = async (): Promise<void> => {
		setLoadingPhone(true);
		setError("");
		try {
			const result = await authService.confirmPhone(phoneCode);
			updateUser(result.user);
			setPhoneHint(result.message);
			setPhoneCode("");
		} catch (err) {
			setError(getApiErrorMessage(err, "Kode telepon tidak valid"));
		}
		setLoadingPhone(false);
	};

	return (
		<div className="settings-verify">
			<p className="settings-lead">
				Verifikasi email dan nomor telepon sebelum memesan undangan. Login Google
				otomatis menandai email sudah terverifikasi.
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
			<section className={`verify-card ${user?.phoneVerified ? "is-done" : ""}`}>
				<div className="verify-card-head">
					<h2>Nomor telepon</h2>
					<span>{user?.phoneVerified ? "Terverifikasi" : "Belum verifikasi"}</span>
				</div>
				{user?.phoneVerified ? (
					<p>{user.phone}</p>
				) : (
					<div className="verify-actions">
						<InputText
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="08xxxxxxxxxx"
						/>
						<InputText
							value={phoneCode}
							onChange={(e) => setPhoneCode(e.target.value)}
							placeholder="Kode 6 digit"
							maxLength={6}
						/>
						<Button
							label="Kirim kode"
							className="p-button-outlined"
							loading={loadingPhone}
							onClick={() => void sendPhone()}
						/>
						<Button
							label="Verifikasi"
							loading={loadingPhone}
							onClick={() => void confirmPhone()}
						/>
					</div>
				)}
				{phoneHint && <p className="verify-hint">{phoneHint}</p>}
			</section>
		</div>
	);
};

export default VerifyAccountPanel;
