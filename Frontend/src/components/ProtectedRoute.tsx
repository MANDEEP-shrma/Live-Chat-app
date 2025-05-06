// ProtectedRoute.tsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "@/store/store"; // Adjust import path as needed
import { useToast } from "@/hooks/use-toast"; // Adjust import path as needed

// Protected route for authenticated users only
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated =
    useSelector((state: RootState) => state.auth.status) ||
    localStorage.getItem("authStatus") === "true";
  const { toast } = useToast();
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("Login Required", {
        description: "You must be logged in to access this page",
      });
    }
  }, []);

  // Redirect to login if not authenticated, otherwise render children
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// PublicOnlyRoute - For routes that should only be accessible when NOT logged in
export const PublicOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.status);
  const { toast } = useToast();
  useEffect(() => {
    if (isAuthenticated) {
      toast.warning("Already Logged In", {
        description: "You are already logged in",
      });
    }
  }, []);

  // Redirect to dashboard if authenticated, otherwise render children
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
