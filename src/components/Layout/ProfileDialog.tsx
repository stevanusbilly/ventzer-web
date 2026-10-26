import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../services/userService";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface ProfileDialogProps {
	visible: boolean;
	onHide: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ visible, onHide }) => {
	const { user, updateUser } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [changePassword, setChangePassword] = useState(false);
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		if (visible && user) {
			setName(user.name || "");
			setEmail(user.email || "");
			setChangePassword(false);
			setPassword("");
			setError("");
			setSuccess("");
		}
	}, [visible, user]);

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
		<Dialog
			header="Profil saya"
			visible={visible}
			style={{ width: "28rem" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message
						severity="error"
						text={error}
						className="w-full mb-3"
						style={{ whiteSpace: "break-spaces" }}
					/>
				)}
				{success && (
					<Message severity="success" text={success} className="w-full mb-3" />
				)}
				<div className="field">
					<label htmlFor="profileUsername">Username</label>
					<InputText id="profileUsername" value={user?.username || ""} disabled />
				</div>
				<div className="field">
					<label htmlFor="profileRole">Role</label>
					<InputText id="profileRole" value={user?.role || ""} disabled />
				</div>
				<div className="field">
					<label htmlFor="profileName">Nama</label>
					<InputText
						id="profileName"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
				<div className="field">
					<label htmlFor="profileEmail">Email</label>
					<InputText
						id="profileEmail"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className="field-checkbox mb-3">
					<Checkbox
						inputId="changePassword"
						checked={changePassword}
						onChange={(e) => setChangePassword(Boolean(e.checked))}
					/>
					<label htmlFor="changePassword" className="ml-2">
						Ubah password
					</label>
				</div>
				{changePassword && (
					<div className="field">
						<label htmlFor="profilePassword">Password baru</label>
						<Password
							id="profilePassword"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							toggleMask
							feedback={false}
							required
						/>
					</div>
				)}
				<div className="flex justify-content-end gap-2">
					<Button
						type="button"
						label="Tutup"
						className="p-button-text"
						onClick={onHide}
					/>
					<Button type="submit" label="Simpan" loading={loading} />
				</div>
			</form>
		</Dialog>
	);
};

export default ProfileDialog;
