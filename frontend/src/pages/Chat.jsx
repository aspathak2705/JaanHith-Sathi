import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { apiUrl } from '../services/api';

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
  const { refreshAll } = useUser();

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(apiUrl(`/user/${userId}`))
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
    const userId = localStorage.getItem('user_id');

    const timeNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { text: `Uploading document: ${file.name}...`, sender: 'user', time: timeNow }]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('user_id', userId || '1');
    formData.append('document_name', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('document_type', 'Identity Proof');
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/document/upload'), {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Document upload failed.');
      }
      const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { 
        text: `Document processed successfully. Extracted Validation Data:\n\n${JSON.stringify(data.data || data, null, 2)}`, 
        sender: 'bot', 
        time: botTime 
      }]);
      refreshAll();
    } catch (e) {
      const errTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { text: e.message || "Error connecting to document service.", sender: 'bot', time: errTime }]);
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
      const res = await fetch(apiUrl('/chat/chat'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parseInt(userId), message: msgText })
      });
      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { text: data.answer, sender: 'bot', time: botTime }]);
      refreshAll();
    } catch (e) {
      const errTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { text: "Error connecting to backend.", sender: 'bot', time: errTime }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-slate-50/30">
      {/* AI Chat Interface */}
      <section className="w-full max-w-5xl mx-auto h-full flex flex-col bg-white border-x border-gray-100 shadow-sm">
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
            {[
              'Am I eligible to vote in the upcoming municipal elections?',
              'What documents are needed to register for voting?',
              'How can I locate my nearest polling booth?',
              'Track my current voter registration application',
              'What is the election process in India?',
              'How to apply for a new Voter ID card online?',
              'How to update my address on my existing Voter ID?',
              'What is the role of the Election Commission of India?',
              'How can I check if my name is on the electoral roll?',
              'What should I do if I lost my Voter ID card?',
              'Can I vote if I am living in another state temporarily?',
              'How do I file a grievance regarding the voting process?',
              'What are the responsibilities of a local assembly?',
              'Explain the process of postal ballot voting.',
              'What is a VVPAT and how does it work?'
            ].map((chip, idx) => (
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


    </div>
  );
}
