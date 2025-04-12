import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, logout, userData } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (userData?.["custom:role"] === "admin") {
      setIsAdmin(true);
    }
  }, [userData]);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          <Link
            to="/dashboard"
            className="logo-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="logo-box">AVI</div>
            <span className="logo-text">REN</span>
          </Link>

          {/* Menú de navegación para desktop */}
          <nav className="desktop-nav">
            {isAuthenticated ? (
              <>
                <ul className="nav-links">
                  <li className="nav-item">
                    <Link to="/dashboard/profile" className="nav-link">
                      Mi perfil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard/deliveries" className="nav-link">
                      Viajes
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li className="nav-item">
                        <Link to="/dashboard/instances" className="nav-link">
                          Instancias
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/dashboard/profiles" className="nav-link">
                          Usuarios
                        </Link>
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
                    <Link to="/auth/login" className="nav-link">
                      Iniciar sesión
                    </Link>
                  </li>
                </ul>
                <Link to="/auth/logup" className="nav-button">
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          {/* Botón del menú móvil */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Menú de navegación"
          >
            {mobileMenuOpen ? (
              <span>✕</span> /* Icono de cerrar */
            ) : (
              <span>☰</span> /* Icono de hamburguesa */
            )}
          </button>
        </div>

        {/* Menú de navegación para móvil */}
        <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
          {isAuthenticated ? (
            <ul className="mobile-nav-links">
              <li className="mobile-nav-item">
                <Link
                  to="/dashboard/profile"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mi perfil
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link
                  to="/dashboard/deliveries"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Viajes
                </Link>
              </li>
              {isAdmin && (
                <>
                  <li className="mobile-nav-item">
                    <Link
                      to="/dashboard/instances"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Instancias
                    </Link>
                  </li>
                  <li className="mobile-nav-item">
                    <Link
                      to="/dashboard/profiles"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Usuarios
                    </Link>
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
                <Link
                  to="/auth/login"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link
                  to="/auth/logup"
                  className="mobile-nav-button"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
