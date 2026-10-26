import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import EventList from "./components/Events/EventList";
import EventPreviewList from "./components/Events/EventPreviewList";
import GuestList from "./components/Guests/GuestList";
import CheckIn from "./components/CheckIn/CheckIn";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import CatalogPage from "./pages/CatalogPage";
import OrderProcessPage from "./pages/OrderProcessPage";
import InvitationPage from "./pages/InvitationPage";
import UserList from "./components/Users/UserList";
import TemplateList from "./components/Templates/TemplateList";
import CategoryPhotoList from "./components/CategoryPhoto/CategoryPhotoList";
import EventLocationList from "./components/EventLocation/EventLocationList";
import EventPhotoList from "./components/EventPhoto/EventPhotoList";
import EventTableList from "./components/EventTable/EventTableList";
import GiftList from "./components/Gift/GiftList";
import GuestMessageList from "./components/GuestMessage/GuestMessageList";
import EventSettingList from "./components/EventSetting/EventSettingList";
import { UserRole } from "./types";

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
		<Route path="/invitation/:eventId/:token" element={<InvitationPage />} />
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
					<RoleRoute roles={["admin"]}>
						<AppLayout>
							<TemplateList />
						</AppLayout>
					</RoleRoute>
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
					<EventPreviewList />
				</ProtectedRoute>
			}
		/>
		<Route
			path="/guests"
			element={
				<ProtectedRoute>
					<AppLayout>
						<GuestList />
					</AppLayout>
				</ProtectedRoute>
			}
		/>
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
			path="/event_location"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<AppLayout>
							<EventLocationList />
						</AppLayout>
					</RoleRoute>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/event_photo"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<AppLayout>
							<EventPhotoList />
						</AppLayout>
					</RoleRoute>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/event_table"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<AppLayout>
							<EventTableList />
						</AppLayout>
					</RoleRoute>
				</ProtectedRoute>
			}
		/>
		<Route
			path="/gift"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<AppLayout>
							<GiftList />
						</AppLayout>
					</RoleRoute>
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
		<Route
			path="/event_setting"
			element={
				<ProtectedRoute>
					<RoleRoute roles={["admin", "panitia"]}>
						<AppLayout>
							<EventSettingList />
						</AppLayout>
					</RoleRoute>
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
