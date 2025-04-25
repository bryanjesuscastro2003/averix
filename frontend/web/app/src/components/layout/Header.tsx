import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
import { useWebSocket } from "../../socket/WebSocketConn";
import { useNotifications } from "../../context/SocketContext";

const Header = () => {
  const { isAuthenticated, logout, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const { currentNotification } = useNotifications();
  const { sendMessage, isConnected } = useWebSocket(
    "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development"
  );

  useEffect(() => {
    if (userData?.["custom:role"] === "admin") {
      setIsAdmin(true);
    }
  }, [userData]);

  useEffect(() => {
    // Extract the main section from the pathname
    const path = location.pathname;
    let section = "";

    if (path.startsWith("/dashboard/profile")) {
      section = "profile";
    } else if (path.startsWith("/dashboard/deliveries")) {
      section = "deliveries";
    } else if (path.startsWith("/dashboard/admin/instances")) {
      section = "drones";
    } else if (path.startsWith("/dashboard/admin/profiles")) {
      section = "users";
    } else if (path.startsWith("/auth/login")) {
      section = "login";
    } else if (path.startsWith("/auth/logup")) {
      section = "register";
    } else if (path.startsWith("/dashboard")) {
      section = "dashboard";
    }

    // Only update if section actually changed
    if (section !== currentSection) {
      setCurrentSection(section);
      console.log(`Section changed to: ${section}`);
      // Finish any active tracking service
      if (isConnected && userData !== null) {
        console.log("Sending finishTracking message");
        sendMessage({
          action: "trackingFinish",
          data: {
            targetUserId: "",
            user: userData?.email || "",
            message: "Finishing tracking",
          },
        });
      }
    }
  }, [location, currentSection]);

  useEffect(() => {
    if (currentNotification) {
      if (currentNotification.cd === "B" || currentNotification.cd === "C") {
        const currentPath = `/dashboard/deliveries/details/${currentNotification.deliveryId}`;
        const isDeliveryPath = location.pathname.startsWith(
          "/dashboard/deliveries/details"
        );
        if (isDeliveryPath) {
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        } else {
          navigate(currentPath);
        }
      }
    }
  }, [currentNotification]);

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <NavLink
            to="/dashboard"
            className="logo-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="logo-box">AVI</div>
            <span className="logo-text">REN</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {isAuthenticated ? (
              <>
                <ul className="nav-links">
                  <li className="nav-item">
                    <NavLink
                      to="/dashboard/profile"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      Mi perfil
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to="/dashboard/deliveries"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      Viajes
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <>
                      <li className="nav-item">
                        <NavLink
                          to="/dashboard/admin/instances"
                          className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                          }
                        >
                          Drones
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/dashboard/admin/profiles"
                          className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                          }
                        >
                          Usuarios
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
                <button onClick={handleLogout} className="nav-button">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <ul className="nav-links">
                  <li className="nav-item">
                    <NavLink
                      to="/auth/login"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      Iniciar sesión
                    </NavLink>
                  </li>
                </ul>
                <NavLink
                  to="/auth/logup"
                  className={({ isActive }) =>
                    `nav-button ${isActive ? "active-button" : ""}`
                  }
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Menú de navegación"
          >
            {mobileMenuOpen ? <span>✕</span> : <span>☰</span>}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
          {isAuthenticated ? (
            <ul className="mobile-nav-links">
              <li className="mobile-nav-item">
                <NavLink
                  to="/dashboard/profile"
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mi perfil
                </NavLink>
              </li>
              <li className="mobile-nav-item">
                <NavLink
                  to="/dashboard/deliveries"
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Viajes
                </NavLink>
              </li>
              {isAdmin && (
                <>
                  <li className="mobile-nav-item">
                    <NavLink
                      to="/dashboard/admin/instances"
                      className={({ isActive }) =>
                        `mobile-nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Drones
                    </NavLink>
                  </li>
                  <li className="mobile-nav-item">
                    <NavLink
                      to="/dashboard/admin/profiles"
                      className={({ isActive }) =>
                        `mobile-nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Usuarios
                    </NavLink>
                  </li>
                </>
              )}
              <li className="mobile-nav-item">
                <button onClick={handleLogout} className="mobile-nav-button">
                  Cerrar sesión
                </button>
              </li>
            </ul>
          ) : (
            <ul className="mobile-nav-links">
              <li className="mobile-nav-item">
                <NavLink
                  to="/auth/login"
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </NavLink>
              </li>
              <li className="mobile-nav-item">
                <NavLink
                  to="/auth/logup"
                  className={({ isActive }) =>
                    `mobile-nav-button ${isActive ? "active-button" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrarse
                </NavLink>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
