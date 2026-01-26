import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import {
    Camera,
    CheckCircle,
    AlertCircle,
    Fingerprint,
    LogOut,
    Clock,
    Calendar,
    MapPin,
    Loader2,
    XCircle
} from 'lucide-react';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [result, setResult] = useState(null);
    const [myAttendance, setMyAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('Main Campus');

    useEffect(() => {
        fetchMyAttendance();
        return () => stopCamera();
    }, []);

    const fetchMyAttendance = async () => {
        try {
            const response = await attendanceAPI.getMyAttendance();
            setMyAttendance(response.data.data || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setCameraActive(true);
            setResult(null);
        } catch (error) {
            setResult({ type: 'error', message: 'Unable to access camera. Please allow camera permissions.' });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraActive(false);
        }
    };

    const captureAndSubmit = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setCapturing(true);
        setResult(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Flip horizontally for mirror effect
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);

            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Send to backend
            const response = await attendanceAPI.markAttendance({
                status: 'PRESENT',
                location: location,
                deviceId: 'Web-Browser-' + navigator.userAgent.slice(0, 20),
                faceImage: imageData // Backend will process this
            });

            if (response.data.success) {
                setResult({
                    type: 'success',
                    message: response.data.message || 'Attendance marked successfully!'
                });
                stopCamera();
                fetchMyAttendance();
            } else {
                setResult({ type: 'error', message: response.data.message });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to mark attendance. Please try again.';
            setResult({ type: 'error', message: errorMsg });
        } finally {
            setCapturing(false);
        }
    };

    const getTodayAttendance = () => {
        const today = new Date().toDateString();
        return myAttendance.find(att => new Date(att.attendanceDate).toDateString() === today);
    };

    const todayRecord = getTodayAttendance();

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
                {/* Today's Status Card */}
                <div className={`rounded-2xl p-6 mb-8 border ${todayRecord
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-violet-500/10 border-violet-500/30'
                    }`}>
                    <div className="flex items-center gap-4">
                        {todayRecord ? (
                            <>
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Attendance Marked!</h2>
                                    <p className="text-green-300">
                                        Today at {new Date(todayRecord.attendanceDate).toLocaleTimeString()} • {todayRecord.location}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-violet-500/20 rounded-xl">
                                    <Calendar className="w-8 h-8 text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Mark Your Attendance</h2>
                                    <p className="text-violet-300">Use the camera below to verify your identity</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Camera Section */}
                {!todayRecord && (
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden mb-8">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5" />
                                Face Verification
                            </h3>

                            {/* Location Input */}
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Your Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="Enter your location"
                                    />
                                </div>
                            </div>

                            {/* Camera View */}
                            <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden mb-4">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transform scale-x-[-1] ${!cameraActive && 'hidden'}`}
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {!cameraActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Camera className="w-16 h-16 text-slate-600 mb-4" />
                                        <p className="text-slate-400">Camera is off</p>
                                        <p className="text-slate-500 text-sm">Click the button below to start</p>
                                    </div>
                                )}

                                {capturing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="text-center">
                                            <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-3" />
                                            <p className="text-white font-medium">Verifying face...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${result.type === 'success'
                                        ? 'bg-green-500/20 border border-green-500/50'
                                        : 'bg-red-500/20 border border-red-500/50'
                                    }`}>
                                    {result.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    )}
                                    <p className={result.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                                        {result.message}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {!cameraActive ? (
                                    <button
                                        onClick={startCamera}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Camera size={20} />
                                        Start Camera
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={stopCamera}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={captureAndSubmit}
                                            disabled={capturing}
                                            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {capturing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <CheckCircle size={20} />
                                            )}
                                            {capturing ? 'Processing...' : 'Mark Attendance'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance History */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Your Attendance History
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                            </div>
                        ) : myAttendance.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No attendance records yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myAttendance.slice(0, 10).map((record, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${record.status === 'PRESENT' ? 'bg-green-500/20' :
                                                    record.status === 'FLAGGED' ? 'bg-red-500/20' : 'bg-amber-500/20'
                                                }`}>
                                                {record.status === 'PRESENT' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    {new Date(record.attendanceDate).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    {new Date(record.attendanceDate).toLocaleTimeString()} • {record.location || 'N/A'}
                                                </p>
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
