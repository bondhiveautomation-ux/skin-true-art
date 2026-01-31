// IMPORTANT: useAuth MUST be a singleton source of truth.
// Multiple independent instances cause race conditions (e.g., admin badge flipping).
// All components should read auth state from a single provider.

export { useAuthContext as useAuth, AuthProvider } from "@/contexts/AuthContext";
