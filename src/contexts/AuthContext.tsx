"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";

// API base URL - adjust this based on your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
    id: string;
    email: string;
    auth_provider: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setAuthFromOAuth: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store token in memory (not localStorage for security)
let inMemoryToken: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Check for existing auth on mount (from OAuth callback stored in sessionStorage temporarily)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if we have a token from OAuth callback
                const storedToken = sessionStorage.getItem("temp_token");
                const storedUser = sessionStorage.getItem("temp_user");

                if (storedToken && storedUser) {
                    inMemoryToken = storedToken;
                    setAccessToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Clear temporary storage
                    sessionStorage.removeItem("temp_token");
                    sessionStorage.removeItem("temp_user");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Login failed");
            }

            const data = await response.json();

            // Store token in memory
            inMemoryToken = data.access_token;
            setAccessToken(data.access_token);
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.email?.[0] || "Registration failed");
            }

            const data = await response.json();

            // Auto-login: Store token and user data
            inMemoryToken = data.access_token;
            setAccessToken(data.access_token);
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            if (inMemoryToken) {
                await fetch(`${API_BASE_URL}/api/auth/logout/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${inMemoryToken}`,
                        "Content-Type": "application/json",
                    },
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear auth state regardless of API response
            inMemoryToken = null;
            setAccessToken(null);
            setUser(null);
        }
    }, []);

    const setAuthFromOAuth = useCallback((token: string, userData: User) => {
        inMemoryToken = token;
        setAccessToken(token);
        setUser(userData);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                accessToken,
                login,
                register,
                logout,
                setAuthFromOAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Helper function to get auth headers for API calls
export function getAuthHeaders(): HeadersInit {
    if (inMemoryToken) {
        return {
            "Authorization": `Bearer ${inMemoryToken}`,
            "Content-Type": "application/json",
        };
    }
    return {
        "Content-Type": "application/json",
    };
}
