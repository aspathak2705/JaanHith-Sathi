import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Chat from './pages/Chat';
import LocationPage from './pages/LocationPage';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import PlaceholderPage from './pages/PlaceholderPage';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import { useUser } from './context/UserContext';

// Simple protected route wrapper
function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const { toasts, dismissToast, markNotificationRead } = useUser();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="bg-background min-h-screen font-work-sans text-on-surface flex">
      <Sidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-16 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/location" element={<ProtectedRoute><LocationPage /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/verification" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Navigate to="/verification" replace /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Profile" description="Manage your personal details and preferences." /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/chat" replace /></ProtectedRoute>} />
          </Routes>
        </main>
        <div className="fixed right-6 top-20 z-[70] space-y-3">
          {toasts.map((toast) => (
            <button
              key={toast.id}
              onClick={() => {
                markNotificationRead(toast.id);
                dismissToast(toast.id);
              }}
              className="w-[320px] rounded-xl border border-gray-200 bg-white p-4 text-left shadow-lg transition hover:shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-10 w-10 shrink-0 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">{toast.icon || 'notifications'}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary">{toast.title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">{toast.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
