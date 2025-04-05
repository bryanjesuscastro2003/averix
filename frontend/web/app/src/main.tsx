import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/auth/Login.page";
import DashboardPage from "./pages/dashboard/Dashboard.page";
import NotFoundPage from "./pages/common/NotFound.page";
import TrackDeliveryPage from "./pages/dashboard/TrackDelivery.page";
import OrderHistoryPage from "./pages/dashboard/OrderHistory";
import LogupPage from "./pages/auth/Logup.page";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/layout/Header";
import ProfilePage from "./pages/dashboard/Profile.page";
//agrego chris sus importaciones
import { InstanceModelForm } from "./components/chris/forms/instanceModel";
import { InstancesPage } from "./components/chris/tables/instancesLogs/InstancesPage";

// ProtectedRoute component to restrict access to authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Header /> {/* Include the Header component */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logup" element={<LogupPage />} />
          <Route path="/instanceForm" element={<InstanceModelForm />} />
          <Route path="/instancesLogs" element={<InstancesPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track"
            element={
              <ProtectedRoute>
                <TrackDeliveryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />{" "}
          {/* Catch-all route for 404 */}
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
