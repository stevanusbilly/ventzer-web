import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";

const Login: React.FC = () => {
	const [username, setUsername] = useState<string>(""); // Changed from email to username
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const result = await login({ username, password }); // Changed to use username

		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.message || "Login gagal");
		}

		setLoading(false);
	};

	return (
		<div
			className="flex justify-content-center align-items-center"
			style={{ minHeight: "80vh" }}
		>
			<Card className="w-full md:w-4" title="Login">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" />
				)}

				<form onSubmit={handleSubmit}>
					<div className="field">
						<label htmlFor="username" className="block">
							Username
						</label>
						<InputText
							id="username"
							value={username}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setUsername(e.target.value)
							}
							className="w-full"
							required
						/>
					</div>

					<div className="field mt-3">
						<label htmlFor="password" className="block">
							Password
						</label>
						<Password
							id="password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setPassword(e.target.value)
							}
							className="w-full"
							feedback={false}
							toggleMask
							required
						/>
					</div>

					<Button
						type="submit"
						label="Login"
						icon="pi pi-sign-in"
						loading={loading}
						className="w-full mt-3"
					/>
				</form>
			</Card>
		</div>
	);
};

export default Login;
