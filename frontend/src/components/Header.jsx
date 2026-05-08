import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useUser();
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Home';
      case '/chat': return 'AI Intelligence Center';
      case '/location': return 'Location & Polling Booths';
      case '/verification': return 'Verification';
      case '/notifications': return 'Notifications';
      case '/about': return 'Institutional Modernism';
      default: return 'Janhith Sathi';
    }
  };

  return (
    <header className="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center px-6 z-40 transition-all duration-200 ml-[280px] w-[calc(100%-280px)]">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-tight text-primary-container">{getPageTitle()}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <input className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search civic queries..." type="text" />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
        </div>
        <button onClick={() => navigate('/notifications')} className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
