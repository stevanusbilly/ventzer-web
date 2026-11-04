import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { userService } from "../../services/userService";
import { User } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface UserFormProps {
	user: User | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<User, "id">>({
		username: user?.username || "",
		name: user?.name || "",
		password: user?.password || "",
		change_password: user?.change_password || 0,
		email: user?.email || "",
		phone: user?.phone || "",
		role: user?.role || "viewer",
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const roles = ["admin", "panitia", "viewer"];

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = user
				? await userService.upd(user.id, formData)
				: await userService.ins(formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					user ? "User diperbarui" : "User ditambahkan",
				),
			);
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan user"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<User, "id">,
		value: string | Date | number
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={user ? "Edit User" : "Create User"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				<div className="field">
					<label htmlFor="username">Username</label>
					<InputText
						id="username"
						value={formData.username}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("username", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="name">Name</label>
					<InputText
						id="name"
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("name", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="email">Email</label>
					<InputText
						id="email"
						value={formData.email}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("email", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="phone">Nomor telepon</label>
					<InputText
						id="phone"
						value={formData.phone || ""}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("phone", e.target.value)
						}
						placeholder="08xxxxxxxxxx"
						autoComplete="tel"
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="role">Role</label>
					<Dropdown
						id="role"
						value={formData.role}
						options={roles.map((element) => ({
							label: element,
							value: element,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							handleChange("role", e.value)
						}
						filter
						required
						placeholder="Select an role"
					/>
				</div>

				{user && (
					<div className="field">
						<div className="flex align-items-center">
							<Checkbox inputId="change_password" name="change_password" value="1" 
								onChange={e => handleChange("change_password", e.checked ? 1 : 0)} 
								checked={formData.change_password === 1 ? true : false} />
							<label htmlFor="change_password" className="ml-2">Ubah Password</label>
						</div>
					</div>
				)}

				<div className="field">
					<label htmlFor="password">Password</label>
					<div className="p-inputgroup flex-1">
						<InputText 
							type={showPassword ? "text" : "password"} 
							value={formData.password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleChange("password", e.target.value)
							}
							disabled={user && formData.change_password === 0 ? true : false}
							/>
						<Button 
							type="button" icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"} 
							className="p-button-secondary" 
							onClick={e => setShowPassword(!showPassword)}
							disabled={user && formData.change_password === 0 ? true : false}
							/>
					</div>
				</div>

				<Button
					type="submit"
					label={user ? "Update User" : "Create User"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default UserForm;
