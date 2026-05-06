import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { text: 'Hello Janhith Sathi, I need to know if I am eligible for the upcoming municipal elections. I recently moved to New Delhi.', sender: 'user', time: '10:24 AM' },
    { text: 'To determine your eligibility for the New Delhi municipal elections, we need to verify three primary criteria:\n\n- Residential Status: Must be a resident for 6+ months.\n- Age Requirement: 18 years or older as of Jan 1st.\n\nWould you like me to check your specific address against the current electoral roll?', sender: 'bot', time: '10:25 AM' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const timeNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { text: `Uploading document: ${file.name}...`, sender: 'user', time: timeNow }]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("http://127.0.0.1:8000/document/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { 
        text: `Document processed successfully. Extracted Validation Data:\n\n${JSON.stringify(data.data || data, null, 2)}`, 
        sender: 'bot', 
        time: botTime 
      }]);
    } catch (e) {
      const errTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { text: "Error connecting to document service.", sender: 'bot', time: errTime }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (textToSend) => {
    const msgText = textToSend || input;
    if (!msgText.trim()) return;
    
    const timeNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const userMsg = { text: msgText, sender: 'user', time: timeNow };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('user_id') || 1;
      const res = await fetch("http://127.0.0.1:8000/chat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parseInt(userId), message: msgText })
      });
      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { text: data.answer, sender: 'bot', time: botTime }]);
    } catch (e) {
      const errTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { text: "Error connecting to backend.", sender: 'bot', time: errTime }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left Side: AI Chat Interface (60%) */}
      <section className="w-3/5 h-full flex flex-col bg-white border-r border-gray-100">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'user' ? (
                <div className="max-w-[80%] bg-surface-container-high p-4 rounded-2xl rounded-tr-none">
                  <p className="font-body-md text-on-surface whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] text-outline mt-2 block text-right">{msg.time}</span>
                </div>
              ) : (
                <div className="max-w-[90%] space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-primary-container rounded-md flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                    </div>
                    <span className="text-xs font-bold text-primary-container uppercase tracking-wide">Janhith AI</span>
                  </div>
                  <div className="bg-surface-container-lowest border border-primary-container/10 p-5 rounded-2xl rounded-tl-none shadow-sm">
                    <p className="font-body-md text-on-surface whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-outline mt-1 block">{msg.time}</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[90%] space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-primary-container rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                  </div>
                  <span className="text-xs font-bold text-primary-container uppercase tracking-wide">Janhith AI</span>
                </div>
                <div className="bg-surface-container-lowest border border-primary-container/10 p-5 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="font-body-md text-on-surface animate-pulse">Analyzing...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        
        {/* Chat Interaction Area */}
        <div className="p-6 border-t border-gray-100 bg-slate-50/50">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
            {['Am I eligible?', 'Documents needed', 'Locate Polling Booth', 'Track Application'].map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => sendMessage(chip)}
                className="whitespace-nowrap px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="w-full p-4 pr-12 bg-white border border-gray-200 rounded-xl text-body-md focus:ring-2 focus:ring-primary-container outline-none resize-none shadow-sm" 
                placeholder="Type your civic query here..." 
                rows="1"
              ></textarea>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-outline hover:text-primary transition-colors"
                title="Upload Document for Validation"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
            </div>
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading}
              className="w-12 h-12 bg-primary-container text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right Side: Journey Dashboard (40%) */}
      <section className="w-2/5 h-full overflow-y-auto p-8 bg-slate-50/30">
        <div className="mb-8">
          <h3 className="text-h3 font-h3 text-primary mb-2">Journey Dashboard</h3>
          <p className="text-sm text-outline">Tracking your civic progress</p>
        </div>
        
        {/* Vertical Stepper */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
          <div className="space-y-0">
            {/* Step 1 */}
            <div className="relative pb-10">
              <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${level > 1 ? 'bg-secondary' : 'bg-gray-200'}`}></div>
              <div className="flex items-start gap-4 relative">
                {level >= 1 ? (
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                  </div>
                ) : (
                   <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center z-10">
                    <span className="text-xs font-bold">01</span>
                  </div>
                )}
                <div>
                  <h4 className={`text-sm font-bold ${level >= 1 ? 'text-primary' : 'text-gray-400'}`}>Eligibility</h4>
                  <p className="text-xs text-outline">{level >= 1 ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative pb-10">
              <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${level > 2 ? 'bg-secondary' : 'bg-gray-200'}`}></div>
              <div className="flex items-start gap-4 relative">
                {level > 2 ? (
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                  </div>
                ) : level === 2 ? (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center z-10 shadow-[0_0_0_4px_rgba(0,51,102,0.1)]">
                    <span className="text-xs font-bold">02</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center z-10">
                    <span className="text-xs font-bold">02</span>
                  </div>
                )}
                <div>
                  <h4 className={`text-sm font-bold ${level >= 2 ? 'text-primary' : 'text-gray-400'}`}>Verification</h4>
                  <p className={`text-xs mt-1 flex items-center gap-1 font-bold ${level === 2 ? 'text-secondary' : 'text-gray-400'}`}>
                    {level > 2 ? 'Completed' : level === 2 ? <><span className="material-symbols-outlined text-[14px]">pending_actions</span> Pending</> : 'Locked'}
                  </p>
                </div>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative pb-10">
              <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${level > 3 ? 'bg-secondary' : 'bg-gray-200'}`}></div>
              <div className="flex items-start gap-4 relative">
                 {level > 3 ? (
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                  </div>
                ) : level === 3 ? (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center z-10 shadow-[0_0_0_4px_rgba(0,51,102,0.1)]">
                    <span className="text-xs font-bold">03</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center z-10">
                    <span className="text-xs font-bold">03</span>
                  </div>
                )}
                <div>
                  <h4 className={`text-sm font-bold ${level >= 3 ? 'text-primary' : 'text-gray-400'}`}>Registration</h4>
                  <p className="text-xs text-gray-400 mt-1">{level > 3 ? 'Completed' : (level === 3 ? 'Pending' : 'Locked')}</p>
                </div>
              </div>
            </div>
            {/* Step 4 */}
            <div className="relative">
              <div className="flex items-start gap-4 relative">
                {level >= 4 ? (
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>how_to_vote</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
                  </div>
                )}
                <div>
                  <h4 className={`text-sm font-bold ${level >= 4 ? 'text-primary' : 'text-gray-400'}`}>Vote Ready</h4>
                  <p className="text-xs text-gray-400 mt-1">{level >= 4 ? 'Ready' : 'Locked'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        {level < 4 && (
          <div>
            <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">Recommended Next Steps</h4>
            <div className="space-y-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-white rounded-xl border border-gray-200 flex items-center gap-4 hover:border-primary-container transition-colors cursor-pointer group shadow-sm"
              >
                <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-primary">Upload ID Proof</h5>
                  <p className="text-xs text-outline">Click here to upload document for verification</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden relative h-40 group cursor-pointer shadow-lg">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfei0UgM_2l1OXzsYotwXx_cc9nMDhUC0zNTmQ0_VWNTmdMSvqyR-cwTJdN6Bccu3ZmjAMzgqqD-Fh5AgfpCyHd_drgEC3IJIwsrLvrSaAQZc0ra2t9BAtL_o2LDAcV6OcN8zqzEc8eGd2J49gkiloKtudWn09octYGFxI7IcvwO2bu-nxC9yY2cXPdFwTzV1hAIuu_qRN5FM5c3l1eMESd83aRUPzWy5FzO6bCpCg88yG69UQ_Y5g6qfkGd1WB9Pl27nkr8PhvTiH" alt="Civic Meeting"/>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent p-6 flex flex-col justify-end">
                  <h5 className="text-white font-bold text-sm">Join Local Assembly</h5>
                  <p className="text-white/80 text-xs mt-1">Participate in ward-level discussions this weekend.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
