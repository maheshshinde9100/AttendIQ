import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { faceAPI, pythonAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import {
    User,
    Mail,
    Shield,
    Fingerprint,
    Camera,
    CheckCircle,
    AlertCircle,
    Loader2,
    RefreshCw,
    Info
} from 'lucide-react';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [captureLoading, setCaptureLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        setIsRegistering(true);
        setError('');
        setSuccess('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError('Could not access camera. Please check permissions.');
            setIsRegistering(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsRegistering(false);
    };

    const handleCapture = async () => {
        if (!videoRef.current) return;

        setCaptureLoading(true);
        setError('');

        try {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const base64Image = canvas.toDataURL('image/jpeg', 0.9);

            // 1. Extract embedding via Python service
            const pyRes = await pythonAPI.extractEmbedding(base64Image);

            if (!pyRes.data.success) {
                throw new Error(pyRes.data.message || 'Failed to extract face features');
            }

            const embedding = pyRes.data.embedding;

            // 2. Register embedding in Java backend
            await faceAPI.register(embedding);

            setSuccess('Face biometric successfully registered!');
            stopCamera();
            if (refreshUser) refreshUser();
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to register face.');
        } finally {
            setCaptureLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                    <p className="text-slate-400">Manage your identity and biometric data.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-violet-500/20">
                                {user?.fullName?.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                            <p className="text-slate-500 text-sm mt-1">{user?.role?.replace('ROLE_', '').toLowerCase()}</p>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Mail size={18} className="text-violet-400" />
                                    <span className="text-sm truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Shield size={18} className="text-violet-400" />
                                    <span className="text-sm">{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Fingerprint size={16} className="text-violet-400" />
                                Biometric Status
                            </h3>
                            {user?.faceRegistered ? (
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Verified Secure</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-amber-400">
                                    <AlertCircle size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Unregistered</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Biometric Management */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#1e293b]/30 backdrop-blur-xl rounded-3xl p-8 border border-white/5 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Camera size={24} className="text-violet-500" />
                                    Face Biometric
                                </h3>
                                {user?.faceRegistered && !isRegistering && (
                                    <button
                                        onClick={startCamera}
                                        className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest"
                                    >
                                        Update Biometric
                                    </button>
                                )}
                            </div>

                            {!isRegistering ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    {user?.faceRegistered ? (
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle size={40} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">Biometric Linked</h4>
                                                <p className="text-slate-500 text-sm mt-2 max-w-sm">
                                                    Your face biometric is securely linked to your account. You can now use AI Kiosk Mode for attendance.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                                <Fingerprint size={40} className="text-slate-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">No Biometric Found</h4>
                                                <p className="text-slate-500 text-sm mt-2 max-w-md">
                                                    To enable AI-powered attendance, you need to register your face biometric. This takes less than 30 seconds.
                                                </p>
                                            </div>
                                            <button
                                                onClick={startCamera}
                                                className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                                            >
                                                Start Registration
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-violet-500/30">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover mirror"
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        {/* Scanner Overlay */}
                                        <div className="absolute inset-0 border-2 border-violet-500/50 rounded-2xl pointer-events-none">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-violet-400/50 rounded-full" />
                                        </div>

                                        {captureLoading && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                                                <p className="text-white font-medium">Extracting Features...</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-blue-500/5 p-4 rounded-xl flex gap-3">
                                        <Info size={20} className="text-blue-400 shrink-0" />
                                        <p className="text-xs text-blue-300/80 leading-relaxed">
                                            Position your face within the frame and ensure good lighting. We extract a 128-dimensional mathematical vector; your actual photo is never stored.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleCapture}
                                            disabled={captureLoading}
                                            className="flex-1 py-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
                                        >
                                            {captureLoading ? <Loader2 className="animate-spin" /> : <Camera />}
                                            Capture & Verify
                                        </button>
                                        <button
                                            onClick={stopCamera}
                                            disabled={captureLoading}
                                            className="px-6 py-4 bg-white/5 text-slate-400 font-bold rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                                    <AlertCircle size={18} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                                    <CheckCircle size={18} />
                                    <p className="text-sm font-medium">{success}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
