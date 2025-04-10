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
  const [message, setMessage] = useState<string>("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      } else {
        setMessage(data.message);
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
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-[#e0e0e0]">
        <div className="flex justify-center mb-6">
          <div className="bg-[#072146] text-white font-bold text-2xl px-4 py-2 rounded-sm">
            AVI<span className="text-[#00a0d2]">REN</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#072146] text-center mb-6">
          Bienvenido
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#072146]"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] placeholder-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:border-transparent"
              placeholder="Ingrese su correo electrónico"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#072146]"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] placeholder-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:border-transparent"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#00a0d2] text-white font-medium rounded-sm hover:bg-[#0088b8] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:ring-offset-2 disabled:bg-[#cccccc] transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Iniciar sesión"}
            </button>
            <p className="mt-2 text-sm text-[#d0021b]">{message}</p>
          </div>
        </form>

        {isLoading && (
          <div className="mt-4 flex justify-center">
            <Loader /> {/* Spinner de carga */}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-[#072146]">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/logup"
            className="text-[#00a0d2] font-medium hover:underline"
          >
            Regístrate
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-[#072146]">
          ¿Olvidaste tu contraseña?{" "}
          <Link
            to="/forgot-password"
            className="text-[#00a0d2] font-medium hover:underline"
          >
            Recuperar contraseña
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
