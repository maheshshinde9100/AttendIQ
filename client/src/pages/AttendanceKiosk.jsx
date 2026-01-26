import { useState, useRef, useEffect } from 'react';
import {
    Camera,
    CheckCircle,
    XCircle,
    Fingerprint,
    Loader2,
    User,
    Clock,
    MapPin,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import api from '../services/api';

const AttendanceKiosk = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [location, setLocation] = useState('Main Campus');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(timer);
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setCameraActive(true);
            setResult(null);
        } catch (error) {
            setResult({
                type: 'error',
                message: 'Unable to access camera. Please allow camera permissions.',
                user: null
            });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraActive(false);
        }
    };

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setProcessing(true);
        setResult(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Mirror the image
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);

            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Call the public attendance endpoint
            const response = await api.post('/attendance/public/mark', {
                faceImage: imageData,
                location: location,
                deviceId: 'Kiosk-Web-' + navigator.userAgent.slice(0, 20)
            });

            const data = response.data;

            if (data.success) {
                setResult({
                    type: 'success',
                    message: data.message || 'Attendance marked successfully!',
                    user: data.data
                });
                stopCamera();

                // Auto reset after 5 seconds for next person
                setTimeout(() => {
                    setResult(null);
                }, 5000);
            } else {
                setResult({
                    type: 'error',
                    message: data.message || 'Face not recognized',
                    user: null
                });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to process. Please try again.';
            setResult({
                type: 'error',
                message: errorMsg,
                user: null
            });
        } finally {
            setProcessing(false);
        }
    };

    const resetKiosk = () => {
        setResult(null);
        startCamera();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
                                <Fingerprint className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">AttendIQ</h1>
                                <p className="text-slate-400 text-sm">Attendance Kiosk</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-white font-mono">
                                {currentTime.toLocaleTimeString()}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Success Modal */}
                    {result?.type === 'success' && result.user && (
                        <div className="bg-green-500/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-green-500/50 text-center animate-pulse-once">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-16 h-16 text-green-400" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">Attendance Marked!</h2>

                            <div className="bg-white/10 rounded-2xl p-6 mt-6 mb-6">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {result.user.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-2xl font-bold text-white">{result.user.fullName}</p>
                                        <p className="text-slate-400">{result.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-6 text-slate-300">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-green-400" />
                                        {currentTime.toLocaleTimeString()}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-green-400" />
                                        {location}
                                    </span>
                                </div>
                            </div>

                            <p className="text-green-300 text-lg">{result.message}</p>

                            <button
                                onClick={resetKiosk}
                                className="mt-6 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw size={20} />
                                Next Person
                            </button>
                        </div>
                    )}

                    {/* Error Result */}
                    {result?.type === 'error' && (
                        <div className="bg-red-500/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-red-500/50 text-center">
                            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-16 h-16 text-red-400" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-4">Face Not Recognized</h2>
                            <p className="text-red-300 text-lg mb-6">{result.message}</p>

                            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Make sure you have registered your face using the Python client
                                </p>
                            </div>

                            <button
                                onClick={resetKiosk}
                                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw size={20} />
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Camera View */}
                    {!result && (
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10 text-center">
                                <h2 className="text-2xl font-bold text-white">Mark Your Attendance</h2>
                                <p className="text-slate-400 mt-1">Position your face in the camera and click capture</p>
                            </div>

                            {/* Location Input */}
                            <div className="p-4 border-b border-white/10">
                                <div className="relative max-w-md mx-auto">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-center"
                                        placeholder="Enter location"
                                    />
                                </div>
                            </div>

                            {/* Camera */}
                            <div className="relative aspect-[4/3] bg-slate-800">
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
                                        <div className="w-32 h-32 border-4 border-dashed border-slate-600 rounded-full flex items-center justify-center mb-6">
                                            <User className="w-16 h-16 text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 text-lg">Camera is off</p>
                                        <p className="text-slate-500">Click the button below to start</p>
                                    </div>
                                )}

                                {/* Face Guide Overlay */}
                                {cameraActive && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-64 h-80 border-4 border-violet-500/50 rounded-[40%] shadow-lg shadow-violet-500/20"></div>
                                        </div>
                                    </div>
                                )}

                                {processing && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <div className="text-center">
                                            <Loader2 className="w-16 h-16 text-violet-400 animate-spin mx-auto mb-4" />
                                            <p className="text-white text-xl font-medium">Verifying face...</p>
                                            <p className="text-slate-400">Please wait</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6">
                                {!cameraActive ? (
                                    <button
                                        onClick={startCamera}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xl font-semibold rounded-2xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Camera size={28} />
                                        Start Camera
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={stopCamera}
                                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={captureAndVerify}
                                            disabled={processing}
                                            className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xl font-semibold rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <Loader2 className="w-7 h-7 animate-spin" />
                                            ) : (
                                                <CheckCircle size={28} />
                                            )}
                                            {processing ? 'Processing...' : 'Capture & Mark Attendance'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/5 border-t border-white/10 py-4">
                <p className="text-center text-slate-500 text-sm">
                    AttendIQ © 2026 • AI-Powered Biometric Attendance System
                </p>
            </footer>
        </div>
    );
};

export default AttendanceKiosk;
