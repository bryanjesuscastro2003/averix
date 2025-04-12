import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { isAuthenticated, logout, fetchProfile, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login"); // Redirect to login page after logout
  };

  useEffect(() => {
    fetchProfile(
      localStorage.getItem("accessToken")!,
      localStorage.getItem("refreshToken")!,
      localStorage.getItem("username")!
    );
  }, []);

  return (
    <header className="bg-[#072146] text-white">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/dashboard" className="flex items-center hover:no-underline">
          <div className="flex items-center">
            <div className="bg-white text-[#072146] font-bold text-2xl px-3 py-1 mr-3 rounded-sm">
              AVI
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              REN
            </span>
          </div>
        </Link>

        <nav>
          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/dashboard/profile"
                className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline">
                Mi perfil
              </Link>
              <Link
                to="/dashboard/profiles"
                className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline">
                Usuarios
              </Link>
              <Link
                to="/dashboard/deliveries"
                className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline">
                Entregas
              </Link>
              <Link
                to="/dashboard/instances"
                className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline">
                Instancias
              </Link>
<<<<<<< HEAD
              {isAuthenticated && userData?.["custom:role"] === "admin" && (
                <>
                  <Link
                    to="/dashboard/admin/instances"
                    className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline"
                  >
                    Instancias
                  </Link>
                  <Link
                    to="/dashboard/admin/profiles"
                    className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline"
                  >
                    Usuarios
                  </Link>
                </>
              )}

=======
>>>>>>> 6bbadece7c8f88e432f70ab64bb2885b777bbaed
              <button
                onClick={handleLogout}
                className="bg-[#00a0d2] hover:bg-[#0088b8] text-white px-5 py-2 rounded-sm text-base font-medium transition-colors">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link
<<<<<<< HEAD
                to="/auth/login"
                className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/auth/logup"
                className="bg-[#00a0d2] hover:bg-[#0088b8] text-white px-5 py-2 rounded-sm text-base font-medium transition-colors"
              >
=======
                to="/login"
                className="text-white hover:text-[#00a0d2] px-3 py-2 text-base font-medium transition-colors hover:no-underline">
                Iniciar sesión
              </Link>
              <Link
                to="/logup"
                className="bg-[#00a0d2] hover:bg-[#0088b8] text-white px-5 py-2 rounded-sm text-base font-medium transition-colors">
>>>>>>> 6bbadece7c8f88e432f70ab64bb2885b777bbaed
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
