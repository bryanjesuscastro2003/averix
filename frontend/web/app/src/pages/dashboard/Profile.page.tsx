import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthEndpoints } from "../../endpoints/auth";

const ProfilePage: React.FC = () => {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Profile</h1>
        {userData ? (
          <div>
            <p className="text-lg">Email: {userData.email}</p>
            <p className="text-lg">Nickname: {userData.nickname}</p>
            <p className="text-lg">Name: {userData.name}</p>
            <p className="text-lg">Role: {userData["custom:role"]}</p>
          </div>
        ) : (
          <p className="text-lg">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
