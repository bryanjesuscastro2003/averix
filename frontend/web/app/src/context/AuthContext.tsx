import React, { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "../types/data/IUser";
import { AuthEndpoints } from "../endpoints/auth";
import { IResponse } from "../types/responses/IResponse";
import { IProfileData } from "../types/responses/auth/IProfileData";

interface AuthContextType {
  isAuthenticated: boolean;
  userData: IUser | null;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    username: string;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<IUser | null>(null);

  // Fetch profile endpoint
  const fetchProfile = async (
    accessToken: string,
    refreshToken: string,
    username: string
  ) => {
    try {
      const response = await fetch(
        AuthEndpoints.profileEndpoint + `?username=${username}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Refresh-Token": refreshToken,
          },
          mode: "cors",
        }
      );
      const data: IResponse<IProfileData> = await response.json();
      if (data.ok) {
        setUserData(data.data.user_data);
      } else {
        logout();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // Check if the user is already logged in (e.g., tokens exist in localStorage)
    const accessToken: string | null = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsAuthenticated(true);
      if (userData === null) {
        // Fetch user profile
        fetchProfile(
          localStorage.getItem("accessToken")!,
          localStorage.getItem("refreshToken")!,
          localStorage.getItem("username")!
        );
        console.log("Fetch data");
      }
    }
  }, []);

  const login = (tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    username: string;
  }) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("username", tokens.username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
