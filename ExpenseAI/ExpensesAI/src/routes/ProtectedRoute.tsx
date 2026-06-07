import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Protect routes by ensuring the current user is authenticated.
export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // In development mode allow bypassing auth so the app can be inspected
  // without a Supabase session. This keeps the production behavior unchanged.
  if (import.meta.env.DEV) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
