import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('attendiq_token'));
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await userAPI.getProfile();
            setUser(response.data.data);
        } catch (e) {
            console.error('Failed to fetch profile:', e);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [token]);

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        const { token: newToken, refreshToken, fullName, role } = response.data;

        localStorage.setItem('attendiq_token', newToken);
        localStorage.setItem('attendiq_refresh', refreshToken);
        localStorage.setItem('attendiq_name', fullName);
        localStorage.setItem('attendiq_role', role);

        setToken(newToken);
        // We set initial user info, fetchUserProfile will get the rest
        setUser({ email, fullName, role });

        return response.data;
    };

    const register = async (data) => {
        const response = await authAPI.register(data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('attendiq_token');
        localStorage.removeItem('attendiq_refresh');
        localStorage.removeItem('attendiq_name');
        localStorage.removeItem('attendiq_role');
        setToken(null);
        setUser(null);
    };

    const refreshUser = () => fetchUserProfile();

    const isAdmin = () => user?.role === 'ROLE_ADMIN';
    const isTeacher = () => user?.role === 'ROLE_TEACHER';
    const isStudent = () => user?.role === 'ROLE_STUDENT';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            refreshUser,
            loading,
            isAdmin,
            isTeacher,
            isStudent,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
