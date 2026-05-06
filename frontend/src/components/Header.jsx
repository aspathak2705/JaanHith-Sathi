import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Home';
      case '/chat': return 'AI Intelligence Center';
      case '/location': return 'Location & Polling Booths';
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
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
