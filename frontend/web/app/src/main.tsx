import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
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
import { InstancesPage } from "./pages/dashboard/instances/Instances.page";
import { ForgotPassword } from "./pages/auth/ForgetPassword.page";
import { ResetPassword } from "./pages/auth/ResetPassword.page";
import { ProfilesPage } from "./pages/dashboard/profiles/Profiles.page";
import DeliveriesPage from "./pages/dashboard/deliveries/Deliveries.page";
import { CreateInstancePage } from "./pages/dashboard/instances/CreateInstance.page";

// ProtectedRoute component to restrict access to authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, fetchProfile } = useAuth();

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="" element={<DashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profiles" element={<ProfilesPage />} />
                  <Route path="deliveries" element={<DeliveriesPage />} />
                  <Route path="instances" element={<InstancesPage />} />
                  <Route
                    path="createInstance"
                    element={<CreateInstancePage />}
                  />
                  <Route path="instancesLogs" element={<InstancesPage />} />
                  <Route path="orders" element={<OrderHistoryPage />} />
                  <Route path="track" element={<TrackDeliveryPage />} />
                  <Route path="createProfile" element={<LogupPage />} />
                  <Route path="*" element={<NotFoundPage />} />{" "}
                </Routes>
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
