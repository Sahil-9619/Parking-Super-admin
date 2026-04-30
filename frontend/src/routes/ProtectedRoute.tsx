import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
}