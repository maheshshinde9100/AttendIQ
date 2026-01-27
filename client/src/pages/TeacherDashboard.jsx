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
    Search,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Info,
    AlertCircle
} from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('attendance');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
            // Filter to show only students for teacher view list
            setAllUsers((usersRes.data.data || []).filter(u => u.role === 'ROLE_STUDENT'));
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
            setAiAnalysis('OLLAMA_ERROR: Unable to communicate with locally running AI model.');
        } finally {
            setAiLoading(false);
        }
    };

    const filteredAttendance = todayAttendance.filter(record => {
        const matchesSearch = record.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
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
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Teacher Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/20 to-violet-600/20 rounded-3xl p-8 border border-white/5">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Teacher Portal</h1>
                            <p className="text-slate-300 max-w-xl">
                                Manage your classroom attendance and monitor student engagement through AI-driven insights.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchData}
                                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <GraduationCap className="text-indigo-400" size={24} />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Status</p>
                                    <p className="text-white text-sm font-bold">Active Session</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        title="Total Students"
                        value={stats?.totalStudents || 0}
                        color="text-blue-400"
                        subtext="Under your supervision"
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Present Today"
                        value={stats?.presentToday || 0}
                        color="text-emerald-400"
                        subtext={`${((stats?.presentToday || 0) / (stats?.totalStudents || 1) * 100).toFixed(1)}% checking rate`}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        title="Security Flags"
                        value={stats?.flaggedAttempts || 0}
                        color="text-amber-400"
                        subtext="Anomalies detected"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Average Presence"
                        value={`${(stats?.overallAttendanceRate || 0).toFixed(1)}%`}
                        color="text-violet-400"
                        subtext="Semester performance"
                    />
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-2xl border border-white/5">
                        {[
                            { id: 'attendance', label: 'Today\'s Attendance', icon: Calendar },
                            { id: 'students', label: 'My Students', icon: Users },
                            { id: 'insights', label: 'AI Class Insights', icon: Brain }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#1e293b]/30 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
                        {activeTab === 'attendance' && (
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <Clock className="text-indigo-500" />
                                        Real-time Attendance Log
                                    </h3>
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Quick search student..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-white/5">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="py-4 px-6">Student Information</th>
                                                <th className="py-4 px-6">Method</th>
                                                <th className="py-4 px-6">Timestamp</th>
                                                <th className="py-4 px-6">Security</th>
                                                <th className="py-4 px-6 text-right">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {paginatedAttendance.length > 0 ? paginatedAttendance.map((record, index) => (
                                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                                {record.user?.fullName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold">{record.user?.fullName}</p>
                                                                <p className="text-slate-500 text-xs">{record.user?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white/5 rounded-lg">
                                                            {record.verifiedBy?.replace('AI_', '') || 'AUTO'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                                                        {new Date(record.attendanceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${record.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                            {record.status === 'FLAGGED' ? 'SUSPICIOUS' : 'VERIFIED'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-slate-400 text-xs font-medium">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <MapPin size={12} />
                                                            {record.location || 'Campus'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="py-24 text-center">
                                                        <Calendar size={48} className="mx-auto mb-4 text-slate-800" />
                                                        <p className="text-slate-500 font-medium">No active records for today.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-8">
                                        <p className="text-slate-500 text-xs">Showing page {currentPage} of {totalPages}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 bg-white/5 rounded-lg text-white hover:bg-indigo-500 transition-colors disabled:opacity-20"><ChevronLeft size={16} /></button>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 bg-white/5 rounded-lg text-white hover:bg-indigo-500 transition-colors disabled:opacity-20"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(allUsers || []).map((student, i) => (
                                        <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-center gap-5">
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 text-xl font-bold">
                                                {student.fullName?.charAt(0)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-white font-bold truncate">{student.fullName}</h4>
                                                <p className="text-slate-500 text-xs truncate mb-2">{student.email}</p>
                                                <div className="flex gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${student.faceRegistered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                                                        {student.faceRegistered ? 'BIO_SYNCED' : 'BIO_PENDING'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'insights' && (
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                            <Brain className="text-indigo-400" />
                                            Class Intelligence
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1">Automatic patterns analysis and attendance forecasting.</p>
                                    </div>
                                    <button
                                        onClick={runAiAnalysis}
                                        disabled={aiLoading}
                                        className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {aiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                                        {aiLoading ? 'Synthesizing...' : 'Generate Review'}
                                    </button>
                                </div>

                                {aiAnalysis ? (
                                    aiAnalysis.includes('OLLAMA_ERROR') ? (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8">
                                            <div className="flex gap-4 items-start">
                                                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                                                    <AlertCircle size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-amber-400 font-bold text-lg mb-2">AI Engine Unreachable</h4>
                                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                                        The Class Intelligence module requires <strong>Ollama (Llama 3)</strong> to be running on the host machine.
                                                        AttendIQ cannot establish a connection to the local inference server at port 11434.
                                                    </p>
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Actions:</p>
                                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <li className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                                                Start Ollama application
                                                            </li>
                                                            <li className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                                                Run 'ollama run llama3'
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-indigo-500/5 backdrop-blur-md rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                                            <div className="flex gap-2 mb-6">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Report Generated Locally</span>
                                            </div>
                                            <div className="prose prose-invert max-w-none">
                                                <p className="text-slate-300 leading-loose text-lg font-sans">
                                                    {aiAnalysis}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-28 bg-white/5 rounded-[40px] border border-white/5 border-dashed">
                                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Info size={40} className="text-slate-700" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">No Analysis Found</h4>
                                        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                                            Click the button above to perform a real-time deep scan of classroom attendance data.
                                        </p>
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

export default TeacherDashboard;
