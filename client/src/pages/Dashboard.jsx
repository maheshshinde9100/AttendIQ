import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI, aiAPI } from '../services/api';
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
    User
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout, isAdmin, isTeacher } = useAuth();
    const [stats, setStats] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, attendanceRes] = await Promise.all([
                dashboardAPI.getStats(),
                attendanceAPI.getTodayAttendance()
            ]);
            setStats(statsRes.data.data);
            setTodayAttendance(attendanceRes.data.data || []);
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
                            <span className="text-xl font-bold text-white">AttendIQ</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-white font-medium">{user?.fullName}</p>
                                <p className="text-slate-400 text-sm">{user?.role?.replace('ROLE_', '')}</p>
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
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-300 mt-1">
                        Here's your attendance overview for today
                    </p>
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
                            subtext="Marked attendance"
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
                    {['overview', 'attendance', 'ai-insights'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium transition whitespace-nowrap ${activeTab === tab
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {tab === 'overview' && <Calendar className="inline-block w-4 h-4 mr-2" />}
                            {tab === 'attendance' && <Users className="inline-block w-4 h-4 mr-2" />}
                            {tab === 'ai-insights' && <Brain className="inline-block w-4 h-4 mr-2" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                    {activeTab === 'overview' && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Today's Attendance</h2>
                                <button
                                    onClick={fetchData}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                                >
                                    <RefreshCw size={16} />
                                    Refresh
                                </button>
                            </div>

                            {todayAttendance.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No attendance records for today yet.</p>
                                    <p className="text-slate-500 text-sm mt-1">Records will appear here once users mark attendance.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Time</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Method</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {todayAttendance.map((record, index) => (
                                                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                                                                <User className="w-4 h-4 text-violet-400" />
                                                            </div>
                                                            <span className="text-white font-medium">{record.user?.fullName || 'Unknown'}</span>
                                                        </div>
                                                    </td>
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
                                                    <td className="py-4 px-4 text-slate-300">{record.verifiedBy}</td>
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
                            )}
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Attendance Records</h2>
                            <p className="text-slate-400">
                                Detailed attendance records and history will be displayed here.
                                Use the Python client to mark attendance with biometric verification.
                            </p>
                        </div>
                    )}

                    {activeTab === 'ai-insights' && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">AI Insights</h2>
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
                                    {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}
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
                                    <p className="text-slate-500 text-sm mt-1">Click the button above to generate insights using Ollama.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
