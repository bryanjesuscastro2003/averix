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
import ProfilePage from "./pages/dashboard/Profile.page";
import { InstancesPage } from "./pages/dashboard/instances/Instances.page";
import { ForgotPassword } from "./pages/auth/ForgetPassword.page";
import { ResetPassword } from "./pages/auth/ResetPassword.page";
import { ProfilesPage } from "./pages/dashboard/profiles/Profiles.page";
import DeliveriesPage from "./pages/dashboard/deliveries/Deliveries.page";
import { CreateInstancePage } from "./pages/dashboard/instances/CreateInstance.page";
import { DeliveryTrackingPage } from "./pages/dashboard/deliveries/tracking/DeliveryTrackingPage";
import { TrackingLogsPage } from "./pages/dashboard/deliveries/tracking/TrackingLogsPage";
import { CertificatesPage } from "./pages/dashboard/instances/CertificatesPage";
import { InteractiveNotification } from "./components/grez/notifications/InteractiveNotification";
import { DeliveryDetailsPage } from "./pages/dashboard/deliveries/details/DeliveryDetailsPage";

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

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
      <Router>
        <Header /> {/* Include the Header component */}
        <Routes>
          <Route
            path="/auth/*"
            element={
              <AuthProtectedRouteRoute>
                <Routes>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="logup" element={<LogupPage />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
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
                        <Route path="" element={<DeliveriesPage />} />
                        <Route
                          path="details/:instanceId"
                          element={<DeliveryDetailsPage />}
                        />
                      </Routes>
                    }
                  />

                  <Route path="tracking" element={<DeliveryTrackingPage />} />
                  <Route path="trackinglogs" element={<TrackingLogsPage />} />
                  <Route
                    path="certificatesActions"
                    element={<CertificatesPage />}
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

      <InteractiveNotification
        type="info"
        message="¿Necesitas ayuda? Haz clic aquí"
        onClose={() => console.log("Notificación cerrada")}
        chatContent={
          <div>
            <p>Mensaje de bienvenida personalizado</p>
            <p>Puedes poner cualquier contenido React aquí</p>
          </div>
        }
      />
    </AuthProvider>
  </StrictMode>
);
