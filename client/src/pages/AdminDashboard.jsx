import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI, aiAPI, userAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import {
    Users,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Calendar,
    Brain,
    RefreshCw,
    Clock,
    MapPin,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [flaggedLogs, setFlaggedLogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, attendanceRes, usersRes, flaggedRes] = await Promise.all([
                dashboardAPI.getStats(),
                attendanceAPI.getTodayAttendance(),
                userAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
                aiAPI.getFlaggedLogs().catch(() => ({ data: { data: [] } }))
            ]);
            setStats(statsRes.data.data);
            setTodayAttendance(attendanceRes.data.data || []);
            setAllUsers(usersRes.data.data || []);
            setFlaggedLogs(flaggedRes.data.data || []);
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
        <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-violet-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
                    {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-slate-800/80 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-3xl p-8 border border-white/5">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Command Center</h1>
                        <p className="text-slate-300 max-w-2xl">
                            Real-time monitoring and AI analysis of campus attendance patterns.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 text-white/5">
                        <ShieldAlert className="w-32 h-32" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        <>
                            <StatCard
                                icon={Users}
                                title="Total Users"
                                value={stats?.totalStudents || 0}
                                color="text-blue-400"
                                subtext="Registered users"
                            />
                            <StatCard
                                icon={CheckCircle}
                                title="Present Today"
                                value={stats?.presentToday || 0}
                                color="text-emerald-400"
                                subtext={`${((stats?.presentToday || 0) / (stats?.totalStudents || 1) * 100).toFixed(1)}% attendance`}
                            />
                            <StatCard
                                icon={AlertTriangle}
                                title="Flagged"
                                value={stats?.flaggedAttempts || 0}
                                color="text-amber-400"
                                subtext="AI suspicion alerts"
                            />
                            <StatCard
                                icon={TrendingUp}
                                title="Global Rate"
                                value={`${(stats?.overallAttendanceRate || 0).toFixed(1)}%`}
                                color="text-violet-400"
                                subtext="Academic average"
                            />
                        </>
                    )}
                </div>

                {/* Main Content Tabs */}
                <div className="space-y-6">
                    <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-2xl border border-white/5">
                        {[
                            { id: 'overview', label: 'Attendance', icon: Calendar },
                            { id: 'flagged', label: 'Flagged', icon: ShieldAlert },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'ai-insights', label: 'AI Analysis', icon: Brain }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#1e293b]/30 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
                        {activeTab === 'overview' && (
                            <div className="p-1 sm:p-6">
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6 px-4 pt-4 sm:p-0">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search name or email..."
                                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="PRESENT">Present</option>
                                            <option value="LATE">Late</option>
                                            <option value="FLAGGED">Flagged</option>
                                        </select>
                                        <button
                                            onClick={fetchData}
                                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition"
                                        >
                                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto ring-1 ring-white/5 rounded-2xl">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-white/5 text-slate-400 font-medium">
                                                <th className="text-left py-4 px-6">User</th>
                                                <th className="text-left py-4 px-6">Status</th>
                                                <th className="text-left py-4 px-6">Time</th>
                                                <th className="text-left py-4 px-6">Discovery</th>
                                                <th className="text-left py-4 px-6">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {paginatedAttendance.length > 0 ? paginatedAttendance.map((record, index) => (
                                                <tr key={index} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gradient-to-tr from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-violet-400 font-bold border border-white/5">
                                                                {record.user?.fullName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{record.user?.fullName}</p>
                                                                <p className="text-slate-500 text-xs">{record.user?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${record.status === 'PRESENT'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : record.status === 'FLAGGED'
                                                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            }`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-300">
                                                        {new Date(record.attendanceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-slate-400 text-xs px-2 py-1 bg-white/5 rounded-md">
                                                            {record.verifiedBy?.replace('AI_', '') || 'MANUAL'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={12} />
                                                            {record.location || 'Unknown'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="py-20 text-center text-slate-500">
                                                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                        No attendance records found for this view.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6 px-4 pb-4 sm:p-0">
                                        <p className="text-slate-500 text-xs">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-lg transition"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-lg transition"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Other tabs follow similar premium styling... */}
                        {activeTab === 'flagged' && (
                            <div className="p-6">
                                <div className="space-y-4">
                                    {flaggedLogs.length > 0 ? flaggedLogs.map((log, index) => (
                                        <div key={index} className="group bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 hover:bg-rose-500/10 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400">
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-semibold">{log.user?.fullName}</h3>
                                                        <p className="text-slate-400 text-sm italic">"{log.details}"</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-rose-400 px-2 py-1 bg-rose-500/10 rounded-lg">
                                                        CONFIDENCE: {(log.confidenceScore * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-rose-500/5">
                                                <div className="flex gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.createdAt).toLocaleString()}</span>
                                                </div>
                                                <button className="text-xs font-bold text-white px-4 py-2 bg-rose-600 rounded-xl hover:bg-rose-500 transition-colors">
                                                    Detailed Review
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center text-slate-500">
                                            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                            No security flags detected in the current period.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allUsers.map((u, index) => (
                                        <div key={index} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-violet-500/30 transition-all cursor-default group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                                                    {u.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{u.fullName}</p>
                                                    <p className="text-slate-500 text-xs">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-widest ${u.role === 'ROLE_ADMIN' ? 'bg-rose-500/10 text-rose-400' :
                                                    u.role === 'ROLE_TEACHER' ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                    {u.role?.replace('ROLE_', '')}
                                                </span>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${u.faceRegistered ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 bg-white/5'}`}>
                                                    {u.faceRegistered ? 'BIOMETRIC READY' : 'NO FACE DATA'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai-insights' && (
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Brain className="text-violet-400" />
                                            Predictive Analysis
                                        </h2>
                                        <p className="text-slate-400 text-sm">Powered by Ollama LLaMA3 Engine</p>
                                    </div>
                                    <button
                                        onClick={runAiAnalysis}
                                        disabled={aiLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-500 transition-all disabled:opacity-50"
                                    >
                                        {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                        {aiLoading ? 'Analyzing...' : 'Run Analysis'}
                                    </button>
                                </div>

                                {aiAnalysis ? (
                                    <div className="bg-slate-800/20 backdrop-blur-md rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-3xl rounded-full -mr-16 -mt-16" />
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-slate-300 leading-relaxed font-sans italic">
                                                {aiAnalysis}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                        <Brain className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium font-sans">Awaiting Instruction</p>
                                        <p className="text-slate-600 text-sm mt-1">Initiate analysis to see attendance trends and anomalies.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
