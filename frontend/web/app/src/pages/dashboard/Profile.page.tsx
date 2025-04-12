import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthEndpoints } from "../../endpoints/auth";

const ProfilePage: React.FC = () => {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full border border-[#e0e0e0]">
        <div className="flex justify-center mb-8">
          <div className="bg-[#072146] text-white font-bold text-2xl px-4 py-2 rounded-sm">
            PERFIL
          </div>
        </div>

        {userData ? (
          <div className="space-y-6">
            <div className="border-b border-[#e0e0e0] pb-4">
              <h3 className="text-sm font-medium text-[#9e9e9e]">
                Correo electrónico
              </h3>
              <p className="text-lg font-medium text-[#072146] mt-1">
                {userData.email}
              </p>
            </div>

            <div className="border-b border-[#e0e0e0] pb-4">
              <h3 className="text-sm font-medium text-[#9e9e9e]">
                Nombre de usuario
              </h3>
              <p className="text-lg font-medium text-[#072146] mt-1">
                {userData.nickname}
              </p>
            </div>

            <div className="border-b border-[#e0e0e0] pb-4">
              <h3 className="text-sm font-medium text-[#9e9e9e]">
                Nombre completo
              </h3>
              <p className="text-lg font-medium text-[#072146] mt-1">
                {userData.name}
              </p>
            </div>

            <div className="pb-4">
              <h3 className="text-sm font-medium text-[#9e9e9e]">Rol</h3>
              <p className="text-lg font-medium text-[#00a0d2] mt-1">
                {userData["custom:role"]}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a0d2]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
