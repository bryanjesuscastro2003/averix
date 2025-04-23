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
import LogupPage from "./pages/auth/Logup.page";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/layout/Header";
import ProfilePage from "./pages/dashboard/profiles/Profile.page";
import { InstancesPage } from "./pages/dashboard/instances/Instances.page";
import { ForgotPassword } from "./pages/auth/ForgetPassword.page";
import { ResetPassword } from "./pages/auth/ResetPassword.page";
import { ProfilesPage } from "./pages/dashboard/profiles/Profiles.page";
import DeliveriesPage from "./pages/dashboard/deliveries/Deliveries.page";
import { CreateInstancePage } from "./pages/dashboard/instances/CreateInstance.page";
import { DeliveryDetailsPage } from "./pages/dashboard/deliveries/tracking/details/DeliveryDetailsPage";
import { InstanceDetailsPage } from "./pages/dashboard/instances/details/Instancedetailspage";
import { SocketProvider } from "./socket/SocketProvider";
import { NotificationProvider } from "./context/SocketContext";

const AuthProtectedRouteRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
};

// ProtectedRoute component to restrict access to authenticated users
const AuthenticatedProtectedRouteRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userData } = useAuth();
  return userData?.["custom:role"] === "admin" ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Header />
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/auth/login" replace />}
            ></Route>
            <Route
              path="/auth/*"
              element={
                <AuthProtectedRouteRoute>
                  <Routes>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="logup" element={<LogupPage />} />
                    <Route
                      path="forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="reset-password" element={<ResetPassword />} />
                  </Routes>
                </AuthProtectedRouteRoute>
              }
            ></Route>
            <Route
              path="/dashboard/*"
              element={
                <AuthenticatedProtectedRouteRoute>
                  <Routes>
                    <Route path="" element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route
                      path="deliveries/*"
                      element={
                        <Routes>
                          <Route
                            path=":deliveryId?"
                            element={<DeliveriesPage />}
                          />
                          <Route
                            path="details/:instanceId"
                            element={<DeliveryDetailsPage />}
                          />
                        </Routes>
                      }
                    />

                    <Route
                      path="admin/*"
                      element={
                        <AdminProtectedRoute>
                          <Routes>
                            <Route
                              path="profiles/*"
                              element={
                                <Routes>
                                  <Route path="" element={<ProfilesPage />} />
                                  <Route
                                    path="createProfile"
                                    element={<LogupPage />}
                                  />
                                </Routes>
                              }
                            />
                            <Route
                              path="instances/*"
                              element={
                                <Routes>
                                  <Route path="" element={<InstancesPage />} />
                                  <Route
                                    path="createInstance"
                                    element={<CreateInstancePage />}
                                  />

                                  <Route
                                    path=":InstanceId"
                                    element={<InstanceDetailsPage />}
                                  />

                                  <Route
                                    path=""
                                    element={<CreateInstancePage />}
                                  />
                                </Routes>
                              }
                            />
                          </Routes>
                        </AdminProtectedRoute>
                      }
                    ></Route>
                  </Routes>
                </AuthenticatedProtectedRouteRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />{" "}
            {/* Catch-all route for 404 */}
          </Routes>
        </Router>
        <SocketProvider />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
