import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthEndpoints } from "../../endpoints/auth";
import { IResponse } from "../../types/responses/IResponse";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(AuthEndpoints.forgetPasswordEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email }),
      });
      const data: IResponse<null> = await response.json();
      console.log(data);
      setError(data.message || "");
      if (!data.ok) {
      } else {
        setSuccess(true);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-semibold text-[#0033A0]">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="mt-2 text-center text-base text-[#4B4B4B]">
          Ingresa tu correo y te enviaremos un código para restablecerla.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
          {success ? (
            <div className="rounded-md bg-[#E6F4EA] p-4 mb-4 flex items-center">
              <svg
                className="h-5 w-5 text-[#1E7F4D]"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                />
              </svg>
              <p className="ml-3 text-sm text-[#1E7F4D] font-medium">
                ¡Código enviado! Revisa tu correo.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-[#FDEAEA] p-4 flex items-center">
                  <svg
                    className="h-5 w-5 text-[#D93025]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    />
                  </svg>
                  <p className="ml-3 text-sm text-[#D93025] font-medium">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#003366]"
                >
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2 border border-[#C6D4E1] rounded-lg text-sm placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-[#0033A0] transition"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-[#0033A0] hover:bg-[#002366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0033A0] transition ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar código"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <button
              onClick={() => navigate("/auth/reset-password")}
              className="w-full flex justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-[#0070E0] hover:bg-[#005FCC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0070E0] transition"
            >
              Ingresar código
            </button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C6D4E1]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-[#6B7280]">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate("/auth/login")}
                className="w-full flex justify-center py-2 px-4 rounded-lg text-sm font-medium text-[#0033A0] bg-white border border-[#C6D4E1] hover:bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0070E0] transition"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
