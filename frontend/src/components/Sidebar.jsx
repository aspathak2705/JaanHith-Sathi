import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Sidebar() {
  const location = useLocation();
  const { profile, unreadCount } = useUser();

  const navLinks = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/chat', icon: 'chat_bubble', label: 'Civic Assistant' },
    { path: '/location', icon: 'location_on', label: 'Location' },
    { path: '/verification', icon: 'fact_check', label: 'Verification' },
    { path: '/notifications', icon: 'notifications', label: 'Notifications' },
    { path: '/profile', icon: 'person', label: 'Profile' },
    { path: '/about', icon: 'info', label: 'About' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-gray-200 bg-slate-50 flex flex-col py-6 z-50">
      <div className="px-6 mb-10">
        <h1 className="text-lg font-black text-primary-container uppercase tracking-wider">Janhith Sathi</h1>
        <p className="font-label-sm text-on-tertiary-fixed-variant">Civic Intelligence</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navLinks.map((link, idx) => {
          const isActive = location.pathname === link.path || (link.path === '/dashboard' && location.pathname === '/chat');
          return (
            <Link
              key={idx}
              to={link.path}
              className={`px-4 py-3 flex items-center gap-3 font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-primary-container border-l-4 border-primary-container'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
              <span className="font-public-sans text-sm">{link.label}</span>
              {link.path === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold">
            {profile ? getInitials(profile.name) : 'JS'}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{profile?.name || 'Citizen'}</p>
            <p className="text-[10px] text-outline capitalize">{profile?.state ? profile.state.replaceAll('_', ' ').toLowerCase() : 'Not verified'}</p>
          </div>
          <button onClick={() => { localStorage.removeItem('user_id'); window.location.href='/login'; }} className="ml-auto text-error hover:text-red-700">
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
