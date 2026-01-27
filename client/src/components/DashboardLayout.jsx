import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Fingerprint,
    LayoutDashboard,
    User,
    LogOut,
    Monitor,
    Menu,
    X,
    Bell
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Sidebar - Desktop */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e293b]/50 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col z-40">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20">
                        <Fingerprint className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">AttendIQ</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                    </NavLink>

                    <NavLink
                        to="/kiosk"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <Monitor className="w-5 h-5" />
                        <span className="font-medium">Kiosk Mode</span>
                    </NavLink>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-800 rounded-full border border-white/10 flex items-center justify-center font-bold text-violet-400">
                            {user?.fullName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role?.replace('ROLE_', '').toLowerCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                {/* Header - Mobile & Action Bar */}
                <header className="h-16 lg:h-20 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 border-b border-white/5">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Fingerprint className="w-6 h-6 text-violet-500" />
                            <span className="font-bold">AttendIQ</span>
                        </div>
                    </div>

                    <div className="hidden lg:block text-slate-400 text-sm font-medium">
                        Welcome back, <span className="text-white font-semibold">{user?.fullName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-violet-600 rounded-full border-2 border-[#0f172a]" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex lg:hidden items-center justify-center font-bold text-violet-400">
                            {user?.fullName?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" />
                    <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-[#1e293b] p-6 shadow-2xl border-r border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-6 h-6 text-violet-500" />
                                <span className="font-bold">AttendIQ</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-4">
                            <NavLink
                                to="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 active:bg-violet-600 active:text-white"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 active:bg-violet-600 active:text-white"
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">Profile</span>
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 rounded-xl"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Log out</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
