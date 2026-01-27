import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AttendanceKiosk from './pages/AttendanceKiosk';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import './index.css';

// Role-based dashboard router
const DashboardRouter = () => {
  const { user } = useAuth();

  // Route based on role
  if (user?.role === 'ROLE_ADMIN') {
    return <AdminDashboard />;
  }

  if (user?.role === 'ROLE_TEACHER') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/kiosk" element={<AttendanceKiosk />} />

          {/* Guest only routes (Redirect to dashboard if logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;
