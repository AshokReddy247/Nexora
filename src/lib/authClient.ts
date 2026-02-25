/**
 * Auth client — proxies Django JWT API through Next.js API routes.
 * Keeps the Django base URL server-side only.
 */

export interface AuthTokens {
    access: string;
    refresh: string;
    username: string;
    email: string;
    preferred_mode: string;
}

const API = '/api/auth';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) {
        const msg =
            typeof data === 'object'
                ? Object.values(data).flat().join(' ')
                : 'Request failed';
        throw new Error(msg);
    }
    return data as T;
}

export async function register(payload: {
    username: string;
    email: string;
    password: string;
    password2: string;
    preferred_mode?: string;
}) {
    return request<{ message: string; username: string }>('/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function login(username: string, password: string) {
    return request<AuthTokens>('/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export async function refreshToken(refresh: string) {
    return request<{ access: string }>('/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
    });
}

export async function getProfile(accessToken: string) {
    return request<{ id: number; username: string; email: string; preferred_mode: string }>
        ('/profile/', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
}

// Token storage helpers (localStorage — swap to httpOnly cookies for prod)
export const TokenStorage = {
    save: (tokens: AuthTokens) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('nexor_access', tokens.access);
        localStorage.setItem('nexor_refresh', tokens.refresh);
        localStorage.setItem('nexor_user', JSON.stringify({
            username: tokens.username,
            email: tokens.email,
            preferred_mode: tokens.preferred_mode,
        }));
    },
    getAccess: (): string | null =>
        typeof window !== 'undefined' ? localStorage.getItem('nexor_access') : null,
    getRefresh: (): string | null =>
        typeof window !== 'undefined' ? localStorage.getItem('nexor_refresh') : null,
    getUser: () => {
        if (typeof window === 'undefined') return null;
        const u = localStorage.getItem('nexor_user');
        return u ? JSON.parse(u) : null;
    },
    clear: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('nexor_access');
        localStorage.removeItem('nexor_refresh');
        localStorage.removeItem('nexor_user');
    },
};
