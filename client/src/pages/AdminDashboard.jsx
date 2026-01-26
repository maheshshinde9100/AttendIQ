import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI, aiAPI, userAPI } from '../services/api';
import {
    Users,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Calendar,
    Brain,
    RefreshCw,
    LogOut,
    Fingerprint,
    Clock,
    MapPin,
    User,
    Download,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, attendanceRes, usersRes] = await Promise.all([
                dashboardAPI.getStats(),
                attendanceAPI.getTodayAttendance(),
                userAPI.getAllUsers().catch(() => ({ data: { data: [] } }))
            ]);
            setStats(statsRes.data.data);
            setTodayAttendance(attendanceRes.data.data || []);
            setAllUsers(usersRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runAiAnalysis = async () => {
        setAiLoading(true);
        try {
            const response = await aiAPI.analyzeToday();
            setAiAnalysis(response.data.data);
        } catch (error) {
            setAiAnalysis('Unable to run AI analysis. Please ensure Ollama is running.');
        } finally {
            setAiLoading(false);
        }
    };

    const filteredAttendance = todayAttendance.filter(record => {
        const matchesSearch = record.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const paginatedAttendance = filteredAttendance.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

    const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
                    {subtext && <p className="text-slate-500 text-sm mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('400', '500/20')}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
                                <Fingerprint className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white">AttendIQ</span>
                                <span className="ml-2 px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-medium rounded-full">Admin</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-white font-medium">{user?.fullName}</p>
                                <p className="text-slate-400 text-sm">Administrator</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl p-6 mb-8 border border-violet-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Admin Dashboard 🎛️
                            </h1>
                            <p className="text-slate-300 mt-1">
                                Monitor attendance, manage users, and view AI insights
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-slate-400 text-sm">Today's Date</p>
                            <p className="text-white font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white/10 rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-white/20 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-white/20 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={Users}
                            title="Total Users"
                            value={stats?.totalStudents || 0}
                            color="text-blue-400"
                            subtext="Registered in system"
                        />
                        <StatCard
                            icon={CheckCircle}
                            title="Present Today"
                            value={stats?.presentToday || 0}
                            color="text-green-400"
                            subtext={`of ${stats?.totalStudents || 0} users`}
                        />
                        <StatCard
                            icon={AlertTriangle}
                            title="Flagged Attempts"
                            value={stats?.flaggedAttempts || 0}
                            color="text-amber-400"
                            subtext="Requires review"
                        />
                        <StatCard
                            icon={TrendingUp}
                            title="Attendance Rate"
                            value={`${(stats?.overallAttendanceRate || 0).toFixed(1)}%`}
                            color="text-purple-400"
                            subtext="Overall average"
                        />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Today\'s Attendance', icon: Calendar },
                        { id: 'users', label: 'All Users', icon: Users },
                        { id: 'ai-insights', label: 'AI Insights', icon: Brain }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                    {activeTab === 'overview' && (
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name or email..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="all" className="bg-slate-800">All Status</option>
                                        <option value="PRESENT" className="bg-slate-800">Present</option>
                                        <option value="LATE" className="bg-slate-800">Late</option>
                                        <option value="FLAGGED" className="bg-slate-800">Flagged</option>
                                    </select>
                                    <button
                                        onClick={fetchData}
                                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {filteredAttendance.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No attendance records found.</p>
                                    <p className="text-slate-500 text-sm mt-1">Records will appear here once users mark attendance.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Time</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Verification</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedAttendance.map((record, index) => (
                                                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                                                    {record.user?.fullName?.charAt(0) || '?'}
                                                                </div>
                                                                <span className="text-white font-medium">{record.user?.fullName || 'Unknown'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-slate-400">{record.user?.email || 'N/A'}</td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'PRESENT'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : record.status === 'FLAGGED'
                                                                        ? 'bg-red-500/20 text-red-400'
                                                                        : 'bg-amber-500/20 text-amber-400'
                                                                }`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-2 text-slate-300">
                                                                <Clock className="w-4 h-4 text-slate-500" />
                                                                {new Date(record.attendanceDate).toLocaleTimeString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs ${record.verifiedBy?.includes('AI')
                                                                    ? 'bg-violet-500/20 text-violet-300'
                                                                    : 'bg-slate-500/20 text-slate-300'
                                                                }`}>
                                                                {record.verifiedBy || 'Manual'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-2 text-slate-300">
                                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                                {record.location || 'N/A'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                                            <p className="text-slate-400 text-sm">
                                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAttendance.length)} of {filteredAttendance.length} records
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Registered Users</h2>
                            {allUsers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No users found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allUsers.map((u, index) => (
                                        <div key={index} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {u.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{u.fullName}</p>
                                                    <p className="text-slate-400 text-sm">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded-lg text-xs ${u.role === 'ROLE_ADMIN' ? 'bg-red-500/20 text-red-300' :
                                                        u.role === 'ROLE_TEACHER' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-green-500/20 text-green-300'
                                                    }`}>
                                                    {u.role?.replace('ROLE_', '')}
                                                </span>
                                                <span className={`px-2 py-1 rounded-lg text-xs ${u.faceRegistered ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {u.faceRegistered ? '✓ Face Registered' : 'No Face Data'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ai-insights' && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">AI-Powered Insights</h2>
                                    <p className="text-slate-400 text-sm mt-1">Powered by Ollama LLaMA3</p>
                                </div>
                                <button
                                    onClick={runAiAnalysis}
                                    disabled={aiLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl transition disabled:opacity-50"
                                >
                                    {aiLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Brain size={16} />
                                    )}
                                    {aiLoading ? 'Analyzing...' : 'Generate Analysis'}
                                </button>
                            </div>

                            {aiAnalysis ? (
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                        {aiAnalysis}
                                    </pre>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No AI analysis available yet.</p>
                                    <p className="text-slate-500 text-sm mt-1">Click the button above to generate insights using local AI.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
