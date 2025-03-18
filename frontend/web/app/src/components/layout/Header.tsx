import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <header className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          My App
        </Link>
        <nav>
          {isAuthenticated ? (
            <div className="space-x-4">
              <Link
                to="/profile"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Login
              </Link>
              <Link
                to="/logup"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
