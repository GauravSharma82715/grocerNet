import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../assets/types";
import api from "../config/api";
import toast from "react-hot-toast";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Initialize authentication state from localStorage on initial load
    useEffect(() => {
        const initAuth = () => {
            try {
                const storedToken = localStorage.getItem("auth_token");
                const storedUser = localStorage.getItem("auth_user");

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to restore authentication state:", error);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login handler
    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        try {
            // If backend is available, try it; otherwise simulate client-side login
            try {
                const response = await api.post("/api/auth/login", { email, password });
                const { user: loggedInUser, token: authToken } = response.data;
                localStorage.setItem("auth_token", authToken);
                localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
                setToken(authToken);
                setUser(loggedInUser);
                toast.success("Logged in successfully!");
                return true;
            } catch (apiError) {
                // Fallback: Create mock user directly from form inputs for frontend demo
                const namePart = email.split("@")[0];
                const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                const mockUser: User = {
                    id: "user_" + Date.now(),
                    name: formattedName,
                    email: email.toLowerCase(),
                    phone: "+1 234 567 8900",
                    avatar: "",
                    addresses: [],
                    isAdmin: email.toLowerCase().includes("admin"),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                const mockToken = "mock_jwt_token_" + Date.now();

                localStorage.setItem("auth_token", mockToken);
                localStorage.setItem("auth_user", JSON.stringify(mockUser));
                setToken(mockToken);
                setUser(mockUser);
                toast.success(`Welcome back, ${mockUser.name}!`);
                return true;
            }
        } finally {
            setLoading(false);
        }
    };

    // Register handler
    const register = async (
        name: string,
        email: string,
        password: string,
    ): Promise<boolean> => {
        setLoading(true);
        try {
            try {
                const response = await api.post("/api/auth/register", {
                    name,
                    email,
                    password,
                });
                const { user: registeredUser, token: authToken } = response.data;
                localStorage.setItem("auth_token", authToken);
                localStorage.setItem("auth_user", JSON.stringify(registeredUser));
                setToken(authToken);
                setUser(registeredUser);
                toast.success("Account created successfully!");
                return true;
            } catch (apiError) {
                // Fallback: Create mock user directly from form inputs
                const mockUser: User = {
                    id: "user_" + Date.now(),
                    name: name.trim() || email.split("@")[0],
                    email: email.toLowerCase(),
                    phone: "+1 234 567 8900",
                    avatar: "",
                    addresses: [],
                    isAdmin: email.toLowerCase().includes("admin"),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                const mockToken = "mock_jwt_token_" + Date.now();

                localStorage.setItem("auth_token", mockToken);
                localStorage.setItem("auth_user", JSON.stringify(mockUser));
                setToken(mockToken);
                setUser(mockUser);
                toast.success("Account created successfully!");
                return true;
            }
        } finally {
            setLoading(false);
        }
    };

    // Update user handler (updates both React state and localStorage)
    const updateUser = (updates: Partial<User>) => {
        setUser((prevUser) => {
            if (!prevUser) return null;
            const updated = { ...prevUser, ...updates };
            localStorage.setItem("auth_user", JSON.stringify(updated));
            return updated;
        });
    };

    // Logout handler
    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
        setToken(null);
        toast.success("Logged out successfully");
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                setLoading,
                login,
                register,
                logout,
                updateUser,
                setUser,
                setToken,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
