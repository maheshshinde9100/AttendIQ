import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import {
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    ExternalLink,
    PieChart,
    ChevronRight,
    Search
} from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [myAttendance, setMyAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todayRecord, setTodayRecord] = useState(null);

    useEffect(() => {
        fetchMyAttendance();
    }, []);

    const fetchMyAttendance = async () => {
        setLoading(true);
        try {
            const response = await attendanceAPI.getMyAttendance();
            const records = response.data.data || [];
            setMyAttendance(records);

            const today = new Date().toDateString();
            const todayAtt = records.find(att => new Date(att.attendanceDate).toDateString() === today);
            setTodayRecord(todayAtt || null);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalDays = myAttendance.length;
    const presentDays = myAttendance.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Student Portal</h1>
                    <p className="text-slate-400">Manage your attendance and academic performance.</p>
                </div>

                {/* Today's Alert Section */}
                <div className={`relative overflow-hidden rounded-3xl p-8 border ${todayRecord
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                    }`}>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className={`p-4 rounded-2xl ${todayRecord ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                {todayRecord ? (
                                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-8 h-8 text-amber-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {todayRecord ? "Attendance Confirmed" : "Action Required"}
                                </h2>
                                <p className={`mt-1 text-sm ${todayRecord ? 'text-emerald-300/80' : 'text-amber-300/80'}`}>
                                    {todayRecord
                                        ? `Verified at ${formatTime(todayRecord.attendanceDate)} via ${todayRecord.verifiedBy?.replace('AI_', '') || 'Kiosk'}`
                                        : "You haven't marked your attendance for today yet."}
                                </p>
                            </div>
                        </div>

                        {!todayRecord && (
                            <a
                                href="/kiosk"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                            >
                                Open Kiosk Mode
                                <ExternalLink size={18} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-blue-400/50 uppercase tracking-wider text-right">Records</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{totalDays}</p>
                        <p className="text-slate-500 text-xs mt-1">Total academic days</p>
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-xs font-bold text-emerald-400/50 uppercase tracking-wider text-right">Presence</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{presentDays}</p>
                        <p className="text-slate-500 text-xs mt-1">Successful mark-ins</p>
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-violet-500/10 rounded-lg">
                                <PieChart className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="text-xs font-bold text-violet-400/50 uppercase tracking-wider text-right">Standard</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{attendanceRate}%</p>
                        <p className="text-slate-500 text-xs mt-1">Academic average</p>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-[#1e293b]/30 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Clock className="w-6 h-6 text-violet-500" />
                            Attendance History
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="p-4 sm:p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                                <p className="text-slate-500 font-medium">Synchronizing records...</p>
                            </div>
                        ) : myAttendance.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                <Calendar className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No records found</p>
                                <p className="text-slate-600 text-sm mt-1">Your attendance will appear here once you mark it.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {myAttendance.map((record, index) => (
                                    <div
                                        key={record.id || index}
                                        className="group flex items-center justify-between p-5 bg-[#1e293b]/40 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`p-3 rounded-xl ${record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' :
                                                record.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {record.status === 'PRESENT' ? <CheckCircle size={24} /> :
                                                    record.status === 'FLAGGED' ? <XCircle size={24} /> : <AlertCircle size={24} />}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{formatDate(record.attendanceDate)}</p>
                                                <div className="flex items-center gap-4 text-slate-500 text-xs mt-1">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> {formatTime(record.attendanceDate)}</span>
                                                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {record.location || 'Campus Main'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${record.status === 'PRESENT' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                                                record.status === 'FLAGGED' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {record.status}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
