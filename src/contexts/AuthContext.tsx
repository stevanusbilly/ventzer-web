import React, {
	createContext,
	useCallback,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { User, LoginCredentials, RegisterData, AuthResponse } from "../types";
import { authService } from "../services/authService";
import { getApiErrorMessage } from "../utils/apiError";

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (
		credentials: LoginCredentials,
	) => Promise<{ success: boolean; message?: string }>;
	register: (
		payload: RegisterData,
	) => Promise<{ success: boolean; message?: string }>;
	loginGoogle: (
		idToken: string,
	) => Promise<{ success: boolean; message?: string }>;
	logout: () => void;
	updateUser: (next: User) => void;
	refreshUser: () => Promise<void>;
	isAuthenticated: boolean;
	canMutate: boolean;
	isAdmin: boolean;
	isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token"),
	);

	useEffect(() => {
		if (token) {
			const userData = localStorage.getItem("userData");
			if (userData) {
				try {
					setUser(JSON.parse(userData));
				} catch {
					localStorage.removeItem("userData");
				}
			}
		}
		setLoading(false);
	}, [token]);

	const applySession = (response: AuthResponse): void => {
		localStorage.setItem("token", response.token);
		localStorage.setItem("userData", JSON.stringify(response.user));
		setToken(response.token);
		setUser(response.user);
	};

	const login = async (
		credentials: LoginCredentials,
	): Promise<{ success: boolean; message?: string }> => {
		try {
			applySession(await authService.login(credentials));
			return { success: true };
		} catch (error: unknown) {
			return {
				success: false,
				message: getApiErrorMessage(error, "Login gagal"),
			};
		}
	};

	const register = async (
		payload: RegisterData,
	): Promise<{ success: boolean; message?: string }> => {
		try {
			applySession(await authService.register(payload));
			return { success: true };
		} catch (error: unknown) {
			return {
				success: false,
				message: getApiErrorMessage(error, "Pendaftaran gagal"),
			};
		}
	};

	const loginGoogle = async (
		idToken: string,
	): Promise<{ success: boolean; message?: string }> => {
		try {
			applySession(await authService.loginGoogle(idToken));
			return { success: true };
		} catch (error: unknown) {
			return {
				success: false,
				message: getApiErrorMessage(error, "Login Google gagal"),
			};
		}
	};

	const logout = (): void => {
		localStorage.removeItem("token");
		localStorage.removeItem("userData");
		setToken(null);
		setUser(null);
	};

	const updateUser = (next: User): void => {
		setUser(next);
		localStorage.setItem("userData", JSON.stringify(next));
	};

	const refreshUser = useCallback(async (): Promise<void> => {
		if (!localStorage.getItem("token")) {
			return;
		}
		try {
			const next = await authService.me();
			setUser(next);
			localStorage.setItem("userData", JSON.stringify(next));
		} catch {
			// biarkan sesi lokal jika /me gagal
		}
	}, []);

	const role = user?.role;
	const canMutate = role === "admin" || role === "panitia";
	const isAdmin = role === "admin";
	const isViewer = role === "viewer";

	const value: AuthContextType = {
		user,
		token,
		login,
		register,
		loginGoogle,
		logout,
		updateUser,
		refreshUser,
		isAuthenticated: !!user,
		canMutate,
		isAdmin,
		isViewer,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};
