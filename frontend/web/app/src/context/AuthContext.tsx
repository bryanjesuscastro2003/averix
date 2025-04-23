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
    role: string;
  }) => void;
  logout: () => void;
  fetchProfile: (
    accessToken: string,
    refreshToken: string,
    username: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>({
  isAuthenticated: false,
  userData: null,
  login: () => {},
  logout: () => {},
  fetchProfile: async () => {},
});

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("accessToken") !== null &&
      localStorage.getItem("refreshToken") !== null &&
      localStorage.getItem("idToken") !== null &&
      localStorage.getItem("username") !== null &&
      localStorage.getItem("role") !== null
  );
  const [userData, setUserData] = useState<IUser | null>(
    localStorage.getItem("accessToken") !== null
      ? {
          name: "",
          email: "",
          email_verified: "",
          nickname: "",
          sub: "",
          "custom:role": localStorage.getItem("role") || "",
        }
      : null
  );

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
        if (
          data.data.user_data["custom:role"] !== localStorage.getItem("role")
        ) {
          logout();
        } else {
          setUserData(data.data.user_data);
          setIsAuthenticated(true);
        }
      } else {
        logout();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const accessToken: string | null = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsAuthenticated(true);
      if (userData !== null) {
        fetchProfile(
          localStorage.getItem("accessToken")!,
          localStorage.getItem("refreshToken")!,
          localStorage.getItem("username")!
        );
      }
    }
  }, []);

  const login = (tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    username: string;
    role: string;
  }) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("username", tokens.username);
    localStorage.setItem("role", tokens.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserData({
      name: "",
      email: "",
      email_verified: "",
      nickname: "",
      sub: "",
      "custom:role": "user",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        userData,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
