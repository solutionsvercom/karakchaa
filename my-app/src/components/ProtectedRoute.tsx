import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { verifyToken } from "../features/AuthSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredModule?: string;
}

// Normalize module keys - handles 'customers' vs 'customer' etc
const normalizeModule = (module: string): string => {
  const map: Record<string, string> = {
    "customers":      "customer",
    "customer":       "customer",
    "stockmanagement":"stockmanagement",
    "stock-management":"stockmanagement",
    "pos":            "pos",
    "dashboard":      "dashboard",
    "products":       "products",
    "sales":          "sales",
    "suppliers":      "suppliers",
    "employees":      "employees",
    "expenses":       "expenses",
    "reports":        "reports",
    "feedback":       "feedback",
    "users":          "users",
    "roles":          "roles",
  };
  return map[module?.toLowerCase()] || module?.toLowerCase() || module;
};

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredModule,
}: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { isAuthenticated, user, loading, token, initializing } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token && !isAuthenticated && !loading) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated, loading]);

  // Show loading spinner during initial token verification
  if (initializing || (loading && token)) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #8b5cf6",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if no token
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if authentication failed
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ROLE-BASED CHECK
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          height: "100vh", flexDirection: "column", backgroundColor: "#f5f5f5"
        }}>
          <div style={{
            backgroundColor: "white", padding: "40px", borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "400px"
          }}>
            <h2 style={{ color: "#e74c3c", marginBottom: "16px" }}>🚫 Access Denied</h2>
            <p style={{ color: "#666", marginBottom: "8px" }}>
              You don't have permission to access this page.
            </p>
            <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
              Your role: <strong>{user.role}</strong>
            </p>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: "10px 24px", backgroundColor: "#8b5cf6", color: "white",
                border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px"
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // MODULE-BASED CHECK (with normalization)
  if (requiredModule) {
    if (user.role !== "admin") {
      const normalizedRequired = normalizeModule(requiredModule);
      const userModules = (user.modules || []).map(m => normalizeModule(m));

      if (!userModules.includes(normalizedRequired)) {
        return (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            height: "100vh", flexDirection: "column", backgroundColor: "#f5f5f5"
          }}>
            <div style={{
              backgroundColor: "white", padding: "40px", borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "400px"
            }}>
              <h2 style={{ color: "#e74c3c", marginBottom: "16px" }}>🔒 Module Access Denied</h2>
              <p style={{ color: "#666", marginBottom: "8px" }}>
                You don't have access to the <strong>{requiredModule}</strong> module.
              </p>
              <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
                Contact your administrator to request access.
              </p>
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: "10px 24px", backgroundColor: "#8b5cf6", color: "white",
                  border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px"
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
}