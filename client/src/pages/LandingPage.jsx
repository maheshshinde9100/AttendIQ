import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Fingerprint,
    ShieldCheck,
    Zap,
    BarChart3,
    ChevronRight,
    Github,
    Monitor
} from 'lucide-react';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-violet-500/30">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20">
                                <Fingerprint className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                AttendIQ
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#technology" className="hover:text-white transition-colors">Technology</a>
                            <Link to="/kiosk" className="hover:text-white transition-colors flex items-center gap-1">
                                <Monitor className="w-4 h-4" /> Kiosk Mode
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="bg-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/20 active:scale-95">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-all shadow-xl shadow-white/10 active:scale-95">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-400 text-xs font-semibold mb-8 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            Now powered by Llama 3
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            The Future of Attendance is <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400">
                                AI & Biometrics.
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Eliminate proxy attendance with lightning-fast face recognition.
                            Secure, automated, and powered by advanced ONNX deep learning.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                                    Return to Dashboard <ChevronRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                                    Start for Free <ChevronRight className="w-5 h-5" />
                                </Link>
                            )}
                            <Link to="/kiosk" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                Launch Kiosk Mode
                            </Link>
                        </div>

                        {/* Dashboard Mockup Preview */}
                        <div className="mt-20 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden aspect-video shadow-2xl">
                                <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                </div>
                                <div className="p-8 flex flex-col items-center justify-center h-full">
                                    <Fingerprint className="w-20 h-20 text-violet-500/20 mb-4" />
                                    <p className="text-slate-500 font-mono text-sm">System Ready - Waiting for capture...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {[
                            { label: 'Recognition Speed', value: '45ms' },
                            { label: 'Accuracy Rate', value: '99.8%' },
                            { label: 'Llama 3 Powered', value: 'Yes' },
                            { label: 'Users Secured', value: '10k+' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</p>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to scale</h2>
                        <p className="text-slate-400">Enterprise-grade biometrics for any institution</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Anti-Proxy Security"
                            desc="Real-time face verification prevents one person from marking for others."
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="AI Analytics"
                            desc="Deep insights into student engagement and absenteeism using Llama 3."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Verification"
                            desc="Processed locally on the edge for sub-100ms verification speed."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2 opacity-60">
                            <Fingerprint className="w-5 h-5 text-violet-500" />
                            <span className="font-bold tracking-tight">AttendIQ</span>
                        </div>

                        <p className="text-slate-500 text-sm">
                            &copy; 2026 AttendIQ. Engineered for modern institutions.
                        </p>

                        <div className="flex gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                            <a href="#"><Github className="w-5 h-5 text-white" /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group">
        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-violet-500" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

export default LandingPage;
