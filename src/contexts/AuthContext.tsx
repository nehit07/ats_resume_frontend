"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { apiFetch, API_BASE_URL } from "@/lib/apiClient";

interface User {
    id: string;
    email: string;
    auth_provider: string;
    avatar_url?: string | null;
    is_staff?: boolean;
    is_superuser?: boolean;
    subscription_plan?: string;
    subscription_details?: {
        plan_name: string;
        display_name: string;
        generation_count: number;
        generation_limit: number;
        export_count: number;
        export_limit: number;
        generations_remaining: number;
        exports_remaining: number;
        status: string;
        is_expired: boolean;
        end_date: string | null;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null; // Kept for backward compat — always null now (cookie handles auth)
    hasProfile: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setAuthFromOAuth: (userData: User) => void;
    refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// User data localStorage key (user info only — NO tokens)
const AUTH_USER_KEY = "resumify_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState<boolean>(false);

    const refreshProfileStatus = useCallback(async () => {
        try {
            // 1. Check Profile Status
            const profileRes = await apiFetch(`${API_BASE_URL}/api/ingestion/profile-status/`);
            if (profileRes.ok) {
                const data = await profileRes.json();
                setHasProfile(data.exists);
            }

            // 2. Check Subscription Status
            const subRes = await apiFetch(`${API_BASE_URL}/api/auth/subscription/`);
            if (subRes.ok) {
                const subData = await subRes.json();
                let planName = "Free Plan";
                let subscriptionDetails = null;

                if (subData.has_subscription && subData.plan) {
                    planName = `${subData.plan.display_name} Plan`;
                    subscriptionDetails = {
                        plan_name: subData.plan.name,
                        display_name: subData.plan.display_name,
                        generation_count: subData.usage.generation_count,
                        generation_limit: subData.usage.generation_limit,
                        export_count: subData.usage.export_count,
                        export_limit: subData.usage.export_limit,
                        generations_remaining: subData.usage.generations_remaining,
                        exports_remaining: subData.usage.exports_remaining,
                        status: subData.status,
                        is_expired: subData.is_expired,
                        end_date: subData.end_date,
                    };
                }

                setUser(prev => {
                    if (!prev) return null;

                    const hasChanged = prev.subscription_plan !== planName ||
                        JSON.stringify(prev.subscription_details) !== JSON.stringify(subscriptionDetails);

                    if (!hasChanged) return prev;

                    const updated = {
                        ...prev,
                        subscription_plan: planName,
                        subscription_details: subscriptionDetails || prev.subscription_details
                    };
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (error) {
            console.error("Failed to refresh user context:", error);
        }
    }, []);

    // Check for existing auth on mount via cookie-based /me endpoint
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to authenticate via cookie (survives page refresh)
                const res = await apiFetch(`${API_BASE_URL}/api/auth/me/`);

                if (res.ok) {
                    const data = await res.json();
                    const userData = data.user;
                    setUser(userData);
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
                    refreshProfileStatus();
                } else {
                    // Cookie expired or invalid — check for cached user data
                    // (user will need to re-login, but we can show a graceful transition)
                    localStorage.removeItem(AUTH_USER_KEY);
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
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
            const response = await apiFetch(`${API_BASE_URL}/api/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || "Login failed");
            }

            const data = await response.json();

            // Cookie is set automatically by the backend response.
            // We just store user data locally.
            setUser(data.user);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

            // Refresh profile status after login
            refreshProfileStatus();
        } finally {
            setIsLoading(false);
        }
    }, [refreshProfileStatus]);

    const register = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/auth/signup/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.email?.[0] || "Registration failed");
            }

            const data = await response.json();

            // Cookie is set automatically by the backend response.
            setUser(data.user);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
            setHasProfile(false); // New user won't have a profile
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Cookie is sent automatically; backend clears it
            await apiFetch(`${API_BASE_URL}/api/auth/logout/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setHasProfile(false);
            localStorage.removeItem(AUTH_USER_KEY);
        }
    }, []);

    const setAuthFromOAuth = useCallback((userData: User) => {
        // Cookie was already set by the backend redirect.
        // We just store user data in state and localStorage.
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        refreshProfileStatus();
    }, [refreshProfileStatus]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                accessToken: user ? "cookie-auth-active" : null, // Backward compat for components checking this
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
