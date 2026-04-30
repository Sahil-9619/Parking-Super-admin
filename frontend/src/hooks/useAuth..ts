import { authService } from "../services/authService";

export const useAuth = () => {
    const user = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();

    return {
        user,
        isAuth,
    };
};