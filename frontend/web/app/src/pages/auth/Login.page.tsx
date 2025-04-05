import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthEndpoints } from "../../endpoints/auth";
import { IResponse } from "../../types/responses/IResponse";
import { ILoginData } from "../../types/responses/auth/ILoginData";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "../../components/grez/Louder";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("jesusbryam624@gmail.com");
  const [password, setPassword] = useState<string>("Bryan2003@");
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado para mostrar el loader
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", { username, password });
    setIsLoading(true); // Activa el loader

    try {
      const response = await fetch(AuthEndpoints.signInEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data: IResponse<ILoginData> = await response.json();

      if (data.ok) {
        const accessToken = data.data.AccessToken;
        const refreshToken = data.data.RefreshToken;
        const idToken = data.data.IdToken;
        login({
          accessToken,
          refreshToken,
          idToken,
          username,
        });
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false); // Desactiva el loader cuando termina
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // in the path could be like "/dashboard/profile" or so  navigate to the path specified in the route
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-500"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login bb"}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-4 flex justify-center">
            <Loader /> {/* Loader debajo del botón */}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-white">
          Don't have an account?{" "}
          <Link to="/logup" className="text-purple-500 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
