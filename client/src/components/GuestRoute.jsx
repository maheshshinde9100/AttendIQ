import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const GuestRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                <p className="text-slate-400 font-medium">Authenticating...</p>
            </div>
        );
    }

    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // If not authenticated, allow access to public routes (Login/Register)
    return <Outlet />;
};

export default GuestRoute;
