import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { getApiErrorMessage, getApiSuccessMessage } from "../utils/apiError";
import VerifyAccountPanel from "../components/Settings/VerifyAccountPanel";
import "./AccountSettings.css";

const AccountSettings: React.FC = () => {
	const { user, updateUser, refreshUser, isViewer } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [changePassword, setChangePassword] = useState(false);
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		void refreshUser();
	}, [refreshUser]);

	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setEmail(user.email || "");
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const data = await userService.updMe({
				name,
				email,
				change_password: changePassword ? 1 : 0,
				password: changePassword ? password : "",
			});
			if (data.user) {
				updateUser(data.user);
			}
			setSuccess(getApiSuccessMessage(data, "Profil diperbarui"));
			setChangePassword(false);
			setPassword("");
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal memperbarui profil"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="settings-page">
			<div>
				<h2>Pengaturan akun</h2>
				<p>Data diri dan verifikasi milik akun Anda sendiri.</p>
			</div>

			<section className="settings-card">
				<h3>Profil</h3>
				<form onSubmit={handleSubmit} className="p-fluid">
					{error && (
						<Message severity="error" text={error} className="w-full mb-3" />
					)}
					{success && (
						<Message severity="success" text={success} className="w-full mb-3" />
					)}
					<div className="field">
						<label htmlFor="settings-username">Username</label>
						<InputText id="settings-username" value={user?.username || ""} disabled />
					</div>
					<div className="field">
						<label htmlFor="settings-role">Role</label>
						<InputText id="settings-role" value={user?.role || ""} disabled />
					</div>
					<div className="field">
						<label htmlFor="settings-name">Nama</label>
						<InputText
							id="settings-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="field">
						<label htmlFor="settings-email">Email</label>
						<InputText
							id="settings-email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="field-checkbox mb-3">
						<Checkbox
							inputId="settings-change-password"
							checked={changePassword}
							onChange={(e) => setChangePassword(Boolean(e.checked))}
						/>
						<label htmlFor="settings-change-password" className="ml-2">
							Ubah password
						</label>
					</div>
					{changePassword && (
						<div className="field">
							<label htmlFor="settings-password">Password baru</label>
							<Password
								id="settings-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								toggleMask
								feedback={false}
								required
							/>
						</div>
					)}
					<div className="flex justify-content-end">
						<Button type="submit" label="Simpan profil" loading={loading} />
					</div>
				</form>
			</section>

			{isViewer && (
				<section className="settings-card">
					<h3>Verifikasi</h3>
					<VerifyAccountPanel />
				</section>
			)}
		</div>
	);
};

export default AccountSettings;
