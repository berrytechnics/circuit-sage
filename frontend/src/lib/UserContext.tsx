// lib/UserContext.tsx
"use client";

import { usePathname } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser, User } from "./api";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "./utils/permissions";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      // Don't try to fetch user on login or register pages
      if (pathname === "/login" || pathname === "/register") {
        setIsLoading(false);
        setUser(null);
        return;
      }

      // Only try to fetch user if there's a token (check both localStorage and sessionStorage)
      const token = typeof window !== "undefined" 
        ? (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"))
        : null;
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      // If we already have a user with permissions, don't refetch unnecessarily
      // This prevents race conditions when navigating after login
      // Note: We access 'user' from closure - this is safe because we only check it
      // at the start of the effect, and the effect runs when pathname changes
      if (user && user.permissions && user.permissions.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        // If we get a 401/403, clear the token and user
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            // Clear invalid token from both storage types
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              sessionStorage.removeItem("accessToken");
              sessionStorage.removeItem("refreshToken");
            }
          }
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Permission checking helpers
  const hasPermissionCheck = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return hasPermission(user.permissions, permission);
  };

  const hasAnyPermissionCheck = (permissionList: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return hasAnyPermission(user.permissions, permissionList);
  };

  const hasAllPermissionsCheck = (permissionList: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return hasAllPermissions(user.permissions, permissionList);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        hasPermission: hasPermissionCheck,
        hasAnyPermission: hasAnyPermissionCheck,
        hasAllPermissions: hasAllPermissionsCheck,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
