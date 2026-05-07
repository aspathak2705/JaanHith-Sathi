import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://127.0.0.1:8000/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          if(!data.error) setProfile(data);
        })
        .catch(console.error);
    }
  }, []);

  const getStateLevel = (state) => {
    if (!state) return 0;
    if (state === 'NEW_USER') return 1;
    if (state === 'ELIGIBILITY_CHECKED' || state === 'VERIFIED') return 2;
    if (state === 'DOCUMENT_VERIFIED' || state === 'REGISTRATION_IN_PROGRESS') return 3;
    if (state === 'READY_TO_VOTE' || state === 'ACTIVATED' || state === 'READY') return 4;
    return 1;
  };

  const level = profile ? getStateLevel(profile.state) : 0;

  const steps = [
    { num: 1, label: 'Eligibility', status: level >= 1 ? 'Completed' : 'Pending', active: level >= 1 },
    { num: 2, label: 'Verification', status: level >= 2 ? 'Completed' : 'Pending', active: level >= 2 },
    { num: 3, label: 'Registration', status: level >= 3 ? 'Completed' : 'Pending', active: level >= 3 },
    { num: 4, label: 'Vote Ready', status: level >= 4 ? 'Ready' : 'Locked', active: level >= 4 }
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-gutter space-y-stack-lg pb-12">
      <section className="relative h-[400px] rounded-xl overflow-hidden bg-primary-container flex items-center px-12 mt-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img className="w-full h-full object-cover" src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Parliament_House_of_India_New_Delhi.jpg" alt="Parliament House"/>
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-block px-3 py-1 bg-secondary text-on-secondary text-label-sm rounded-full">AI-Powered Civic Platform</div>
          <h2 className="text-h1 font-h1 text-white leading-tight">Empowering Citizens through AI</h2>
          <p className="text-body-lg text-primary-fixed-dim max-w-lg">Navigate government services, understand your eligibility, and manage your civic journey with our intelligent companion.</p>
          <div className="flex items-center gap-4">
            <Link to="/chat" className="px-8 py-4 bg-white text-primary-container font-bold rounded-lg shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span> Start AI Assistant
            </Link>
            <Link to="/about" className="px-8 py-4 bg-transparent border border-primary-fixed-dim text-white font-bold rounded-lg hover:bg-white/10 transition-all">
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-h3 font-h3 text-primary">Your Civic Status</h3>
            <p className="text-body-md text-outline">Keep track of your current registration and eligibility progress.</p>
          </div>
          <span className={`px-4 py-2 font-bold rounded-full text-sm flex items-center gap-2 ${level >= 4 ? 'bg-secondary-container text-secondary' : 'bg-error-container text-on-error-container'}`}>
            <span className="material-symbols-outlined text-sm">{level >= 4 ? 'check_circle' : 'pending'}</span>
            {profile?.state ? profile.state.replace('_', ' ').toUpperCase() : 'AWAITING REGISTRATION'}
          </span>
        </div>
        <div className="relative pt-4 pb-2">
          <div className="absolute top-8 left-0 w-full h-1 bg-gray-100 rounded-full"></div>
          <div className={`absolute top-8 left-0 h-1 bg-secondary rounded-full transition-all duration-500`} style={{ width: `${(level - 1) * 33.33}%` }}></div>
          <div className="grid grid-cols-4 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-md ${step.active ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: step.active ? "'FILL' 1" : "'FILL' 0"}}>{step.active ? 'check' : 'trip_origin'}</span>
                </div>
                <div>
                  <p className={`text-label-sm font-bold ${step.active ? 'text-primary' : 'text-gray-400'}`}>{step.label}</p>
                  <p className={`text-caption ${step.active ? 'text-secondary' : 'text-outline'}`}>{step.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <div className="fixed bottom-8 right-8 z-50">
        <Link to="/chat" className="w-16 h-16 bg-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>chat</span>
        </Link>
      </div>
    </div>
  );
}
