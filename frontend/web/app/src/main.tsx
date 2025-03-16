import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/Login.page";
import DashboardPage from "./pages/dashboard/Dashboard.page";
import NotFoundPage from "./pages/common/NotFound.page";
import TrackDeliveryPage from "./pages/dashboard/TrackDelivery.page";
import OrderHistoryPage from "./pages/dashboard/OrderHistory";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/track" element={<TrackDeliveryPage />} />
        <Route path="*" element={<NotFoundPage />} />{" "}
        {/* Catch-all route for 404 */}
      </Routes>
    </Router>
  </StrictMode>
);
