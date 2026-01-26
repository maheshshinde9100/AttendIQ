import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import {
    CheckCircle,
    XCircle,
    Fingerprint,
    LogOut,
    Clock,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle
} from 'lucide-react';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
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

            // Check if attendance marked today
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
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate attendance stats
    const totalDays = myAttendance.length;
    const presentDays = myAttendance.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                <p className="text-slate-400 text-sm">Student</p>
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome, {user?.fullName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-400">Here's your attendance summary</p>
                </div>

                {/* Today's Status Card */}
                <div className={`rounded-2xl p-6 mb-8 border ${todayRecord
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}>
                    <div className="flex items-center gap-4">
                        {todayRecord ? (
                            <>
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white">Today's Attendance: Marked ✓</h2>
                                    <p className="text-green-300 mt-1">
                                        Recorded at {formatTime(todayRecord.attendanceDate)} • {todayRecord.location || 'Main Campus'}
                                    </p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Verified by: {todayRecord.verifiedBy || 'System'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-amber-500/20 rounded-xl">
                                    <AlertCircle className="w-8 h-8 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white">Today's Attendance: Not Marked</h2>
                                    <p className="text-amber-300 mt-1">
                                        Please use the attendance kiosk to mark your attendance
                                    </p>
                                    <a
                                        href="/kiosk"
                                        target="_blank"
                                        className="inline-block mt-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
                                    >
                                        Go to Attendance Kiosk →
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 text-center">
                        <p className="text-3xl font-bold text-blue-400">{totalDays}</p>
                        <p className="text-slate-400 text-sm mt-1">Total Records</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 text-center">
                        <p className="text-3xl font-bold text-green-400">{presentDays}</p>
                        <p className="text-slate-400 text-sm mt-1">Days Present</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 text-center">
                        <p className="text-3xl font-bold text-purple-400">{attendanceRate}%</p>
                        <p className="text-slate-400 text-sm mt-1">Attendance Rate</p>
                    </div>
                </div>

                {/* Attendance History */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-violet-400" />
                            Your Attendance History
                        </h3>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                            </div>
                        ) : myAttendance.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No attendance records yet</p>
                                <p className="text-slate-500 text-sm mt-1">Your records will appear here after marking attendance</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myAttendance.slice(0, 15).map((record, index) => (
                                    <div
                                        key={record.id || index}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${record.status === 'PRESENT' ? 'bg-green-500/20' :
                                                    record.status === 'FLAGGED' ? 'bg-red-500/20' : 'bg-amber-500/20'
                                                }`}>
                                                {record.status === 'PRESENT' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                ) : record.status === 'FLAGGED' ? (
                                                    <XCircle className="w-5 h-5 text-red-400" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{formatDate(record.attendanceDate)}</p>
                                                <div className="flex items-center gap-3 text-slate-400 text-sm mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTime(record.attendanceDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {record.location || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                                                record.status === 'FLAGGED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
