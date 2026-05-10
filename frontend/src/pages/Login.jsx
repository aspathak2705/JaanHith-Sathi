import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user_id', data.data.user_id);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-container">Janhith Sathi</h2>
          <p className="text-sm text-outline mt-1">Sign in to your Civic Account</p>
        </div>
        {error && <div className="bg-error-container text-on-error-container p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-container text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mt-4">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-outline mt-6">
          Don't have an account? <Link to="/register" className="text-primary-container font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
