import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { I18nProvider } from "./i18n/I18nContext";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import StaffLogin from "./components/Auth/StaffLogin";
import Dashboard from "./components/Dashboard/Dashboard";
import AccountSettings from "./pages/AccountSettings";
import EventList from "./components/Events/EventList";
import EventPreviewTsx from "./components/Events/EventPreviewTsx";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import CatalogPage from "./pages/CatalogPage";
import OrderProcessPage from "./pages/OrderProcessPage";
import NotFoundPage from "./pages/NotFoundPage";
import WhatsAppFab from "./components/common/WhatsAppFab/WhatsAppFab";
import InvitationPage from "./pages/InvitationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import UsherPage from "./components/Usher/UsherPage";
import UserList from "./components/Users/UserList";
import TemplateList from "./components/Templates/TemplateList";
import CategoryPhotoList from "./components/CategoryPhoto/CategoryPhotoList";
import CategoryTemplateList from "./components/CategoryTemplate/CategoryTemplateList";
import { UserRole } from "./types";
import {
	customerLoginPath,
	homePathForRole,
	isStaffRole,
	staffLoginPath,
} from "./utils/authPaths";

const PreviewLegacyRedirect: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	return <Navigate to={`/events/preview/${id}`} replace />;
};

const InvitationLegacyRedirect: React.FC = () => {
	const { token } = useParams<{ token: string }>();
	return <Navigate to={`/invitation/${token || ""}`} replace />;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated } = useAuth();
	if (!isAuthenticated) return <Navigate to={customerLoginPath} replace />;
	return <>{children}</>;
};

const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated, user } = useAuth();
	if (!isAuthenticated) return <Navigate to={staffLoginPath} replace />;
	if (!isStaffRole(user?.role)) return <Navigate to={homePathForRole(user?.role)} replace />;
	return <>{children}</>;
};

const RoleRoute: React.FC<{
	children: React.ReactNode;
	roles: UserRole[];
}> = ({ children, roles }) => {
	const { user, isAuthenticated } = useAuth();
	if (!isAuthenticated) return <Navigate to={staffLoginPath} replace />;
	if (!user || !roles.includes(user.role)) {
		return <Navigate to={homePathForRole(user?.role)} replace />;
	}
	return <>{children}</>;
};

const AppContent: React.FC = () => (
	<Routes>
		<Route path="/login" element={<Login />} />
		<Route path="/daftar" element={<Register />} />
		<Route path="/admin" element={<StaffLogin />} />
		<Route path="/panitia" element={<Navigate to="/admin" replace />} />
		<Route path="/masuk" element={<Navigate to="/login" replace />} />
		<Route path="/akun" element={<Navigate to="/pengaturan" replace />} />
		<Route
			path="/pengaturan"
			element={
				<AuthRoute>
					<AppLayout>
						<AccountSettings />
					</AppLayout>
				</AuthRoute>
			}
		/>
		<Route path="/verify-email" element={<VerifyEmailPage />} />
		<Route path="/invitation/:token" element={<InvitationPage />} />
		<Route
			path="/invitation/:eventId/:token"
			element={<InvitationLegacyRedirect />}
		/>
		<Route
			path="/dashboard"
			element={
				<AuthRoute>
					<AppLayout>
						<Dashboard />
					</AppLayout>
				</AuthRoute>
			}
		/>
		<Route
			path="/users"
			element={
				<StaffRoute>
					<RoleRoute roles={["admin"]}>
						<AppLayout>
							<UserList />
						</AppLayout>
					</RoleRoute>
				</StaffRoute>
			}
		/>
		<Route
			path="/category_photo"
			element={
				<StaffRoute>
					<RoleRoute roles={["admin"]}>
						<AppLayout>
							<CategoryPhotoList />
						</AppLayout>
					</RoleRoute>
				</StaffRoute>
			}
		/>
		<Route
			path="/category_template"
			element={
				<StaffRoute>
					<RoleRoute roles={["admin"]}>
						<AppLayout>
							<CategoryTemplateList />
						</AppLayout>
					</RoleRoute>
				</StaffRoute>
			}
		/>
		<Route
			path="/templates"
			element={
				<StaffRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<AppLayout>
							<TemplateList />
						</AppLayout>
					</RoleRoute>
				</StaffRoute>
			}
		/>
		<Route
			path="/events"
			element={
				<AuthRoute>
					<AppLayout>
						<EventList />
					</AppLayout>
				</AuthRoute>
			}
		/>
		<Route
			path="/events/preview/:id"
			element={
				<AuthRoute>
					<EventPreviewTsx />
				</AuthRoute>
			}
		/>
		<Route path="/events/preview-tsx/:id" element={<PreviewLegacyRedirect />} />
		<Route
			path="/events/:id/usher"
			element={
				<StaffRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<UsherPage />
					</RoleRoute>
				</StaffRoute>
			}
		/>
		<Route path="/guests" element={<Navigate to="/events" replace />} />
		<Route path="/checkin" element={<Navigate to="/events" replace />} />
		<Route path="/gift" element={<Navigate to="/events" replace />} />
		<Route path="/guest_message" element={<Navigate to="/events" replace />} />
		<Route path="/pricing" element={<PricingPage />} />
		<Route path="/catalog" element={<CatalogPage />} />
		<Route path="/order-process" element={<OrderProcessPage />} />
		<Route path="/" element={<LandingPage />} />
		<Route path="*" element={<NotFoundPage />} />
	</Routes>
);

const App: React.FC = () => (
	<I18nProvider>
		<AuthProvider>
			<Router>
				<AppContent />
				<WhatsAppFab />
			</Router>
		</AuthProvider>
	</I18nProvider>
);

export default App;
