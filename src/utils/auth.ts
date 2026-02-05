import Cookies from "js-cookie";

const TokenKey = 'Admin-Token';

// Function to set the token securely
export function setToken(token: string): void {
  Cookies.set(TokenKey, token, {
    expires: 7, // Cookie will expire after 7 days
    path: '/', // Cookie is accessible throughout the site
    secure: import.meta.env.VITE_NODE_ENV === 'production', // Ensures cookie is sent over HTTPS in production
    sameSite: 'Strict', // Restricts cross-site cookie transmission
    httpOnly: false, // js-cookie doesn't support httpOnly, but we can make it secure and restrict access by configuring the backend
  });
}

// Function to get the token
export function getToken(): string | undefined {
  return Cookies.get(TokenKey);
}

// Function to remove the token
export function removeToken(): void {
  Cookies.remove(TokenKey);
}
