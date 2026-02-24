/**
 * Centralized API client with cookie-based authentication.
 *
 * All authenticated API calls should use this module instead of raw fetch().
 * The JWT token is sent automatically via HttpOnly cookie (credentials: "include").
 */

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Make an authenticated API request.
 * Automatically includes credentials (cookies) for HttpOnly JWT auth.
 * Intercepts 401 responses to refresh the session seamlessly.
 */
export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers || {});

    // Set Content-Type for JSON requests if body is present and not FormData
    if (options.body && !(options.body instanceof FormData)) {
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
    }

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Always send cookies
    });

    // Intercept 401 Unauthorized errors to attempt a silent refresh
    if (response.status === 401 && !url.includes("/auth/refresh/") && !url.includes("/auth/login/")) {
        if (isRefreshing) {
            // Queue this request and wait for the refresh to finish
            try {
                await new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
                // Once resolved, retry the original request
                return fetch(url, { ...options, headers, credentials: "include" });
            } catch (err) {
                return new Response(JSON.stringify({ error: "Refresh failed" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        isRefreshing = true;

        try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
                method: "POST",
                credentials: "include",
            });

            if (refreshRes.ok) {
                processQueue(null);
                // Retry the original request
                response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: "include",
                });
            } else {
                processQueue(new Error("Refresh failed"));
                // Only forcefully redirect if we are in the browser
                if (typeof window !== "undefined" && !url.includes("/auth/me/")) {
                    window.location.href = "/login";
                }
            }
        } catch (err) {
            processQueue(err);
        } finally {
            isRefreshing = false;
        }
    }

    return response;
}

/**
 * Convenience helpers for common HTTP methods.
 */
export const api = {
    get: (endpoint: string, options?: RequestInit) =>
        apiFetch(endpoint, { ...options, method: "GET" }),

    post: (endpoint: string, body?: unknown, options?: RequestInit) =>
        apiFetch(endpoint, {
            ...options,
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    put: (endpoint: string, body?: unknown, options?: RequestInit) =>
        apiFetch(endpoint, {
            ...options,
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    patch: (endpoint: string, body?: unknown, options?: RequestInit) =>
        apiFetch(endpoint, {
            ...options,
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    delete: (endpoint: string, options?: RequestInit) =>
        apiFetch(endpoint, { ...options, method: "DELETE" }),
};
