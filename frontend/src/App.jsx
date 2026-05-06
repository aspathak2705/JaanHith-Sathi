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
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Profile" description="Manage your personal details and preferences." /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/chat" replace /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
