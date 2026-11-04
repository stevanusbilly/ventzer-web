import { UserRole } from "../types";

export const staffHomePath = "/dashboard";
export const customerHomePath = "/dashboard";
export const settingsPath = "/pengaturan";
export const customerLoginPath = "/login";
export const customerRegisterPath = "/daftar";
export const adminLoginPath = "/admin";
export const panitiaLoginPath = adminLoginPath;
export const staffLoginPath = adminLoginPath;

export const isStaffRole = (role?: UserRole | string | null): boolean =>
	role === "admin" || role === "panitia";

export const isCustomerRole = (role?: UserRole | string | null): boolean =>
	role === "viewer";

export const homePathForRole = (_role?: UserRole | string | null): string =>
	staffHomePath;

export const loginPathForRole = (role?: UserRole | string | null): string =>
	isStaffRole(role) ? staffLoginPath : customerLoginPath;

export const isCustomerAreaPath = (pathname: string): boolean =>
	pathname === customerLoginPath ||
	pathname === customerRegisterPath ||
	pathname === settingsPath;
