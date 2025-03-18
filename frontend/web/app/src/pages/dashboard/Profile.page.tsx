import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthEndpoints } from "../../endpoints/auth";

const ProfilePage: React.FC = () => {
  const fetchData = async () => {
    const accessToken = localStorage.getItem("accessToken") || "N/A";
    const refreshToken = localStorage.getItem("refreshToken") || "N/A";
    const username = localStorage.getItem("username") || "N/A";
    if (accessToken === "N/A" || refreshToken === "N/A" || username === "N/A") {
      return;
    }
    const response = await fetch(
      AuthEndpoints.profileEndpoint + `?username=${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken || "",
        },
      }
    );
    const data = await response.json();
    console.log(data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <p className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nickname
            </label>
            <p className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
