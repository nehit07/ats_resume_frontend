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
    avatar_url?: string | null;
    is_staff?: boolean;
    is_superuser?: boolean;
    subscription_plan?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    hasProfile: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setAuthFromOAuth: (token: string, user: User) => void;
    refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_TOKEN_KEY = "resumify_auth_token";
const AUTH_USER_KEY = "resumify_auth_user";

// Store token in memory (also persisted to localStorage for refresh survival)
let inMemoryToken: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean>(false);

    const refreshProfileStatus = useCallback(async (token?: string) => {
        const activeToken = token || accessToken || inMemoryToken;
        if (!activeToken) return;

        try {
            // 1. Check Profile Status
            const profileRes = await fetch(`${API_BASE_URL}/api/ingestion/profile-status/`, {
                headers: { "Authorization": `Bearer ${activeToken}` },
            });
            if (profileRes.ok) {
                const data = await profileRes.json();
                setHasProfile(data.exists);
            }

            // 2. Check Subscription Status (to update plan name if changed/stale)
            const subRes = await fetch(`${API_BASE_URL}/api/accounts/subscription/`, {
                headers: { "Authorization": `Bearer ${activeToken}` },
            });
            if (subRes.ok) {
                const subData = await subRes.json();
                let planName = "Free Plan";
                if (subData.has_subscription && subData.plan) {
                    planName = `${subData.plan.display_name} Plan`;
                }

                // Update user state if plan changed
                setUser(prev => {
                    if (!prev) return null;
                    if (prev.subscription_plan === planName) return prev;

                    const updated = { ...prev, subscription_plan: planName };
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (error) {
            console.error("Failed to refresh user context:", error);
        }
    }, [accessToken]);

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // First check localStorage for persisted auth (survives page refresh)
                const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
                const storedUser = localStorage.getItem(AUTH_USER_KEY);

                if (storedToken && storedUser) {
                    inMemoryToken = storedToken;
                    setAccessToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    refreshProfileStatus(storedToken); // Fetch profile status
                } else {
                    // Fallback: Check sessionStorage for OAuth callback tokens
                    const tempToken = sessionStorage.getItem("temp_token");
                    const tempUser = sessionStorage.getItem("temp_user");

                    if (tempToken && tempUser) {
                        inMemoryToken = tempToken;
                        setAccessToken(tempToken);
                        const parsedUser = JSON.parse(tempUser);
                        setUser(parsedUser);
                        refreshProfileStatus(tempToken);

                        // Persist to localStorage and clear temp storage
                        localStorage.setItem(AUTH_TOKEN_KEY, tempToken);
                        localStorage.setItem(AUTH_USER_KEY, tempUser);
                        sessionStorage.removeItem("temp_token");
                        sessionStorage.removeItem("temp_user");
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                // Clear any corrupted data
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_USER_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [refreshProfileStatus]);

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

            // Store token in memory and localStorage
            inMemoryToken = data.access_token;
            setAccessToken(data.access_token);
            setUser(data.user);
            localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

            // Refresh profile status after login
            refreshProfileStatus(data.access_token);
        } finally {
            setIsLoading(false);
        }
    }, [refreshProfileStatus]);

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
            localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
            setHasProfile(false); // New user won't have a profile
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
            // Clear auth state and localStorage
            inMemoryToken = null;
            setAccessToken(null);
            setUser(null);
            setHasProfile(false);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
        }
    }, []);

    const setAuthFromOAuth = useCallback((token: string, userData: User) => {
        inMemoryToken = token;
        setAccessToken(token);
        setUser(userData);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        refreshProfileStatus(token);
    }, [refreshProfileStatus]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                accessToken,
                hasProfile,
                login,
                register,
                logout,
                setAuthFromOAuth,
                refreshProfileStatus,
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
