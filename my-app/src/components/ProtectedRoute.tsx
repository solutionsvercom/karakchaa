import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState, AppDispatch } from "../store/Store";
import { verifyToken } from "../features/AuthSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "manager" | "staff")[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {

  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const { isAuthenticated, user, loading, token } = useSelector(
    (state: RootState) => state.auth
  );

  // ONLY verify token if token exists
  useEffect(() => {

    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }

  }, [dispatch, token, isAuthenticated]);

  // Show loading only when token exists and verifying
  if (loading && token) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if authentication failed
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role protection
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column"
      }}>
        <h2>Access Denied</h2>
        <p>Your role: {user.role}</p>
      </div>
    );
  }

  return <>{children}</>;

}
