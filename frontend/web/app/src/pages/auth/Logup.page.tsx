import React, { useState } from "react";
import { json, Link, useNavigate } from "react-router-dom";
import { AuthEndpoints } from "../../endpoints/auth";
import { IAuthResponse } from "../../types/AuthResponse";
import { ICommonResponse } from "../../types/Common";
import { useAuth } from "../../context/AuthContext";
import Louder from "../../components/chris/louder";

const LogupPage: React.FC = () => {
  //uso de datos para el logup
  const [password, setPassword] = useState<string>("Bryan2003@");
  const [email, setEmail] = useState<string>("jesusbryan155@gmail.com");
  const [name, setName] = useState<string>("Bryan");
  const [nickname, setNickname] = useState<string>("Bryx");
  const [role, setRole] = useState<string>("ADMIN"); // ADMIN, CLIENT

  ////
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [isSignUpSubmitted, setIsSignUpSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setRole(e.target.value);
    console.log("Rol seleccionado:", e.target.value);
    // Aquí podrías redirigir, mostrar algo, etc.
  };

  const handleLogup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Sign up data:", { username: email, password, name, nickname });

    try {
      const response = await fetch(AuthEndpoints.signUpEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password, name, nickname }),
      });
      const data: ICommonResponse = await response.json();
      const bodyData: IAuthResponse = JSON.parse(data.body);
      if (bodyData.ok) {
        setIsSignUpSubmitted(true);
        setErrorMessage("");
      } else setErrorMessage(bodyData.error || "An error occurred");
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
      const data: ICommonResponse = await response.json();
      const bodyData: IAuthResponse = JSON.parse(data.body);
      if (bodyData.ok) {
        setErrorMessage("");
        window.location.href = "/login";
      } else setErrorMessage(bodyData.error || "An error occurred");
    } catch (error) {
      setErrorMessage("Unexpected error occurred, please try again later ...");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          {isSignUpSubmitted ? "Confirm Your Account" : "Create Your Account"}
        </h1>

        {!isSignUpSubmitted ? (
          <form onSubmit={handleLogup} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-white">
                Nickname
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your nickname"
                required
              />
            </div>
            <div>
              {
                //aqui comenzo chris//
              }

              <div className="flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <label
                    htmlFor="role"
                    className="block mb-2 text-lg font-semibold text-gray-700">
                    Selecciona tu rol:
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>
                      -- Selecciona un rol --
                    </option>
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              </div>
              {
                // aqui termino XD//
              }
              <button
                type="submit"
                className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                disabled={isLoading}>
                Sign Up
              </button>
              {isLoading && <Louder />}
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmation} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white">
                Username
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
              <label
                htmlFor="confirmationCode"
                className="block text-sm font-medium text-white">
                Confirmation Code
              </label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your confirmation code"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                disabled={isLoading}>
                Confirm
              </button>
              {isLoading && <Louder />}
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white">
          {isSignUpSubmitted ? (
            <button
              onClick={() => setIsSignUpSubmitted(false)}
              className="text-esmerald-500 font-semibold">
              Go back to sign up
            </button>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2">
                <Link to="/login" className="text-teal-500 font-semibold">
                  Already have an account? Log in
                </Link>
                <button
                  onClick={() => setIsSignUpSubmitted(true)}
                  className="text-esmerald-500 font-semibold">
                  Confirmation code
                </button>
              </div>
            </>
          )}
        </p>
        {errorMessage && (
          <p className="mt-4 text-red-500 text-center text-sm">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LogupPage;
