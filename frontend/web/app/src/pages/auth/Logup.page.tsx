// Imports
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthEndpoints } from "../../endpoints/auth";
import { useAuth } from "../../context/AuthContext";
import Louder from "../../components/chris/louder";
import { IResponse } from "../../types/responses/IResponse";
import { DashboardEndpoints } from "../../endpoints/dashboard";

const LogupPage: React.FC = () => {
  //uso de datos para el logup
  const [password, setPassword] = useState<string>("Bryan2003@");
  const [email, setEmail] = useState<string>("jesusbryan155@gmail.com");
  const [name, setName] = useState<string>("Bryan");
  const [nickname, setNickname] = useState<string>("Bryx");
  const [role, setRole] = useState<string | number>("admin"); // ADMIN, USER

  ////
  const { isAuthenticated, userData } = useAuth();
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [isSignUpSubmitted, setIsSignUpSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setRole(e.target.value);
    console.log("Rol seleccionado:", e.target.value);
    // Aquí podrías redirigir, mostrar algo, etc.
  };

  const handleLogup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isAuthenticated
        ? DashboardEndpoints.createProfileEndpoint
        : AuthEndpoints.signUpEndpoint;

      const headers: {
        "Content-Type": string;
        Authorization?: string;
      } = isAuthenticated
        ? {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("idToken"),
          }
        : {
            "Content-Type": "application/json",
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          username: email,
          password,
          name,
          nickname,
          role,
        }),
      });
      const data: IResponse<null> = await response.json();
      setMessage(data.message);
      if (data.ok) {
        setIsSignUpSubmitted(true);
        setErrorMessage("");
      } else setErrorMessage(data.error || "An error occurred");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Confirmation code:", confirmationCode);
    try {
      const response = await fetch(AuthEndpoints.signUpConfirmationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, confirmationCode }),
      });
      const data: IResponse<null> = await response.json();
      if (data.ok) {
        setMessage("");
        window.location.href = "/login";
      } else setMessage(data.message || "An error occurred");
    } catch (error) {
      setMessage("Unexpected error occurred, please try again later ...");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated", userData);
      if (userData?.["custom:role"] === "user") {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-[#e0e0e0]">
        <h1 className="text-2xl font-bold text-[#072146] text-center mb-6">
          {isAuthenticated
            ? isSignUpSubmitted
              ? "Confirma tu cuenta"
              : "Crea una cuenta"
            : isSignUpSubmitted
            ? "Confirma tu cuenta"
            : "Crea tu cuenta"}
        </h1>

        {!isSignUpSubmitted ? (
          <form onSubmit={handleLogup} className="space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#072146]"
              >
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] placeholder-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:border-transparent"
                placeholder="Ingrese su nombre completo"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-[#072146]"
              >
                Apodo
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] placeholder-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:border-transparent"
                placeholder="Ingrese su apodo"
                required
              />
            </div>

            {isAuthenticated && (
              <div className="bg-[#f6f7f8] p-4 rounded-lg border border-[#e0e0e0]">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-[#072146] mb-2"
                >
                  Seleccione su rol
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] focus:outline-none focus:ring-2 focus:ring-[#00a0d2]"
                >
                  <option value="" disabled>
                    -- Seleccione un rol --
                  </option>
                  <option value="admin">Administrador</option>
                  <option value="user">Cliente</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#00a0d2] text-white font-medium rounded-sm hover:bg-[#0088b8] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:ring-offset-2 disabled:bg-[#cccccc] transition-colors"
              disabled={isLoading}
            >
              Registrarse
            </button>
            {isLoading && <Louder />}
          </form>
        ) : (
          <form onSubmit={handleConfirmation} className="space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] placeholder-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#00a0d2]"
                placeholder="Ingrese su correo"
                required
              />

              <label
                htmlFor="confirmationCode"
                className="block text-sm font-medium text-[#072146] mt-4"
              >
                Código de confirmación
              </label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-sm text-[#072146] placeholder-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#00a0d2]"
                placeholder="Ingrese el código"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#00a0d2] text-white font-medium rounded-sm hover:bg-[#0088b8] focus:outline-none focus:ring-2 focus:ring-[#00a0d2] focus:ring-offset-2 disabled:bg-[#cccccc] transition-colors"
              disabled={isLoading}
            >
              Confirmar
            </button>
            {isLoading && <Louder />}
          </form>
        )}

        <div className="mt-6 text-center text-sm text-[#072146]">
          {isSignUpSubmitted ? (
            <button
              onClick={() => setIsSignUpSubmitted(false)}
              className="text-[#00a0d2] font-medium hover:underline"
            >
              Volver a registro
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="text-[#00a0d2] font-medium hover:underline"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              )}
              <button
                onClick={() => setIsSignUpSubmitted(true)}
                className="text-[#00a0d2] font-medium hover:underline"
              >
                ¿Tienes un código de confirmación?
              </button>
            </div>
          )}
        </div>

        {message && (
          <p className="mt-4 text-red-600 text-center text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LogupPage;
