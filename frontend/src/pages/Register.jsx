import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', age: '', location: '', is_citizen: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age) || 0 }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user_id', data.data.user_id);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-10 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-container">Janhith Sathi</h2>
          <p className="text-sm text-outline mt-1">Create your Civic Account</p>
        </div>
        {error && <div className="bg-error-container text-on-error-container p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">Age</label>
              <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-primary-container outline-none" placeholder="e.g., Central District, New Delhi" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-container text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mt-6">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-outline mt-6">
          Already have an account? <Link to="/login" className="text-primary-container font-bold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
