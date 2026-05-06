import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/notification/list/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setNotifications(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getIconColor = (color) => {
    const colors = {
      amber: 'bg-amber-100 text-amber-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      primary: 'bg-primary-container/20 text-primary-container'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="max-w-[1200px] mx-auto p-gutter space-y-stack-lg pb-12">
      <div className="mt-8 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Notifications</h2>
          <p className="text-gray-500 mt-2">Stay updated on your civic journey and important deadlines.</p>
        </div>
        <button className="text-sm font-bold text-primary hover:underline">Mark all as read</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined animate-spin text-4xl text-gray-300">refresh</span>
            <p className="text-gray-500 mt-4">Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">notifications_off</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">You're all caught up!</h3>
            <p className="text-gray-500">There are no new notifications or actions required at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, idx) => (
              <div 
                key={idx} 
                className={`p-6 flex items-start gap-5 transition-colors hover:bg-slate-50 ${notification.is_urgent ? 'bg-amber-50/30' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notification.color)}`}>
                  <span className="material-symbols-outlined text-xl">{notification.icon}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {notification.title}
                      {notification.is_urgent && (
                        <span className="bg-red-100 text-red-600 text-[10px] uppercase font-black px-2 py-0.5 rounded">Urgent</span>
                      )}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{notification.message}</p>
                  
                  {notification.action_text && (
                    <Link to={notification.type === 'document' ? '/chat' : notification.type === 'location' ? '/location' : '/chat'} className={`inline-block px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 ${notification.is_urgent ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20' : 'bg-primary-container text-white hover:bg-primary shadow-primary/20'}`}>
                      {notification.action_text}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
