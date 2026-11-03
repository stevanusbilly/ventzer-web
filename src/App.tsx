import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import EventList from "./components/Events/EventList";
import EventPreviewTsx from "./components/Events/EventPreviewTsx";
import CheckIn from "./components/CheckIn/CheckIn";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import CatalogPage from "./pages/CatalogPage";
import OrderProcessPage from "./pages/OrderProcessPage";
import InvitationPage from "./pages/InvitationPage";
import UsherPage from "./components/Usher/UsherPage";
import UserList from "./components/Users/UserList";
import TemplateList from "./components/Templates/TemplateList";
import CategoryPhotoList from "./components/CategoryPhoto/CategoryPhotoList";
import GiftList from "./components/Gift/GiftList";
import GuestMessageList from "./components/GuestMessage/GuestMessageList";
import { UserRole } from "./types";

const PreviewLegacyRedirect: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	return <Navigate to={`/events/preview/${id}`} replace />;
};

const InvitationLegacyRedirect: React.FC = () => {
	const { token } = useParams<{ token: string }>();
	return <Navigate to={`/invitation/${token || ""}`} replace />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleRoute: React.FC<{
	children: React.ReactNode;
	roles: UserRole[];
}> = ({ children, roles }) => {
	const { user, isAuthenticated } = useAuth();
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!user || !roles.includes(user.role)) {
		return <Navigate to="/dashboard" replace />;
	}
	return <>{children}</>;
};

const AppContent: React.FC = () => (
	<Routes>
		<Route path="/login" element={<Login />} />
		<Route path="/invitation/:token" element={<InvitationPage />} />
		<Route
			path="/invitation/:eventId/:token"
			element={<InvitationLegacyRedirect />}
		/>
		<Route
			path="/dashboard"
			element={
				<ProtectedRoute>
					<AppLayout>
						<Dashboard />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/users"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin"]}>
						<AppLayout>
							<UserList />
						</AppLayout>
					</RoleRoute>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/category_photo"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin"]}>
						<AppLayout>
							<CategoryPhotoList />
						</AppLayout>
					</RoleRoute>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/templates"
			element={
				<ProtectedRoute>
					<AppLayout>
						<TemplateList />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/events"
			element={
				<ProtectedRoute>
					<AppLayout>
						<EventList />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/events/preview/:id"
			element={
				<ProtectedRoute>
					<EventPreviewTsx />
				</ProtectedRoute>
			}
		/>
		<Route path="/events/preview-tsx/:id" element={<PreviewLegacyRedirect />} />
		<Route
			path="/events/:id/usher"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<UsherPage />
					</RoleRoute>
				</ProtectedRoute>
			}
		/>
		<Route path="/guests" element={<Navigate to="/events" replace />} />
		<Route
			path="/checkin"
			element={
				<ProtectedRoute>
					<AppLayout>
						<CheckIn />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/gift"
			element={
				<ProtectedRoute>
					<AppLayout>
						<GiftList />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/guest_message"
			element={
				<ProtectedRoute>
					<AppLayout>
						<GuestMessageList />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
		<Route path="/pricing" element={<PricingPage />} />
		<Route path="/catalog" element={<CatalogPage />} />
		<Route path="/order-process" element={<OrderProcessPage />} />
		<Route path="/" element={<LandingPage />} />
	</Routes>
);

const App: React.FC = () => (
	<AuthProvider>
		<Router>
			<AppContent />
		</Router>
	</AuthProvider>
);

export default App;
