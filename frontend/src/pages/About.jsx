export default function About() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-12">
      {/* Hero Section / Vision */}
      <section className="mb-16">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-7">
            <span className="text-secondary text-sm uppercase tracking-widest mb-4 block font-bold">Official Documentation</span>
            <h2 className="text-4xl font-bold text-primary-container mb-6">What is Janhith Sathi?</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Janhith Sathi is a revolutionary Civic Intelligence platform designed to bridge the gap between complex governmental procedures and citizen empowerment. It operates as a high-fidelity "State-Driven" engine that guides users through legal, administrative, and social welfare journeys with absolute precision and transparency.
            </p>
            <div className="flex gap-4">
              <button className="bg-primary-container text-white px-6 py-3 font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                View Whitepaper <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button className="border border-gray-300 text-primary-container px-6 py-3 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Institutional Access
              </button>
            </div>
          </div>
          <div className="col-span-5">
            <div className="relative rounded-xl overflow-hidden shadow-xl aspect-square bg-blue-50">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBitnD-dWKFzd9gY6QuDfQTP9eSJ8PQQR1xKzHKb4s2uwfL8E25w9W7tGWL_NW2Umhose16-km-LLxLQsoz6XBJeATlr8yWYrACxCkTOJpmiw8Io_pOVqHs5qFacP1CWUz88sOw9XdUB5YlIKEUq5BUJEKyVA_92k1wFcRtAPDkuOJ6kt0A9-htwhnouM5MJpwUv4OoCQpQL29ZCxbxoQi9ETs3NlOQLIdB0SQYaXul0HhY6lPndigNFvYyx0pMMxkxNBJpEwfmhOpn" alt="Building" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission Statement */}
      <section className="mb-20 py-16 bg-blue-50 rounded-xl px-12 border border-blue-100">
        <div className="max-w-3xl">
          <h3 className="text-2xl font-bold text-primary-container mb-4">Our Mission</h3>
          <p className="text-lg text-gray-700 italic border-l-4 border-secondary pl-6 py-2">
            "To transform the interface between the state and the citizen from a bureaucratic hurdle into a streamlined digital partnership, ensuring that justice, welfare, and information are accessible to every individual with zero friction."
          </p>
        </div>
      </section>

      {/* Core Features Bento Grid */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-sm font-bold text-secondary uppercase tracking-widest block mb-2">Core Capabilities</span>
            <h3 className="text-3xl font-bold text-primary-container">Intelligence Infrastructure</h3>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          {/* AI Assistant */}
          <div className="col-span-8 bg-white p-8 border border-gray-200 rounded-xl shadow-sm border-t-2 border-t-secondary relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-5">
              <span className="material-symbols-outlined text-[200px]">smart_toy</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <h4 className="text-2xl font-bold mb-3">Sathi AI Assistant</h4>
              <p className="text-gray-600 mb-6 max-w-lg">A sophisticated, document-style conversational interface that interprets legal jargon and translates complex government notifications into actionable steps for common citizens.</p>
              <ul className="space-y-3 text-sm font-bold text-gray-800">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> Contextual legal grounding</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> Multi-language synthesis</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> Document-aware querying</li>
              </ul>
            </div>
          </div>
          {/* Journey Dashboard */}
          <div className="col-span-4 bg-primary-container p-8 rounded-xl shadow-sm text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white">account_tree</span>
              </div>
              <h4 className="text-2xl font-bold mb-3">Journey Tracking</h4>
              <p className="text-white/70 text-sm">Real-time state tracking for every application, grievance, or civic request submitted through the platform.</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span>Processing</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full w-[82%]"></div>
              </div>
            </div>
          </div>
          {/* Location Intelligence */}
          <div className="col-span-4 bg-white p-8 border border-gray-200 rounded-xl shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-blue-50 text-primary-container rounded-lg flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <h4 className="text-[20px] font-bold mb-3 leading-tight">Geospatial Awareness</h4>
            <p className="text-gray-600 text-sm mb-6 flex-1">Connecting users to the closest administrative offices, service centers, and resources based on verified civic boundaries.</p>
            <a className="text-primary-container font-bold text-sm flex items-center gap-1" href="#">Explore Map <span className="material-symbols-outlined text-sm">open_in_new</span></a>
          </div>
          {/* Document Validation */}
          <div className="col-span-8 bg-white p-8 border border-gray-200 rounded-xl shadow-sm flex items-center gap-10">
            <div className="flex-1">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <h4 className="text-2xl font-bold mb-3">Validation Engine</h4>
              <p className="text-gray-600 text-sm">Automated verification of civic documents against institutional databases to reduce processing times and prevent data silos.</p>
            </div>
            <div className="hidden md:block w-48 h-32 bg-slate-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-gray-400 text-4xl block mb-2">upload_file</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Drag Documents</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="mb-20">
        <div className="bg-[#001e40] p-12 rounded-2xl relative overflow-hidden">
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          <div className="relative z-10 grid grid-cols-12 gap-12 items-center">
            <div className="col-span-6 text-white">
              <h3 className="text-3xl font-bold mb-6">The State-Driven Engine</h3>
              <p className="text-white/80 text-base mb-8 leading-relaxed">
                Behind the interface lies a powerful tech stack built for reliability and massive scale. Our core engine uses a deterministic state-machine architecture ensuring that no citizen request ever enters an undefined state.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="text-[#79d8b6] font-bold text-sm mb-2 uppercase">Infrastructure</h5>
                  <p className="text-xs text-white/60">Distributed Ledger Technology & Hybrid-Cloud Compute</p>
                </div>
                <div>
                  <h5 className="text-[#79d8b6] font-bold text-sm mb-2 uppercase">Intelligence</h5>
                  <p className="text-xs text-white/60">Private LLMs & Natural Language Processing</p>
                </div>
              </div>
            </div>
            <div className="col-span-6 flex justify-center">
              <div className="w-full max-w-[400px] aspect-video bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                  <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                  <div className="h-2 bg-white/10 rounded-full w-full"></div>
                  <div className="pt-4 flex gap-2">
                    <div className="h-8 w-8 bg-[#006c52]/30 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">code</span>
                    </div>
                    <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">database</span>
                    </div>
                    <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA / Support */}
      <section className="text-center py-10 border-t border-gray-200">
        <h4 className="text-2xl font-bold text-primary-container mb-4">Empowering the Public Interest</h4>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">Join thousands of citizens using Janhith Sathi to navigate their civic life with confidence and ease.</p>
        <div className="flex justify-center gap-4">
          <button className="bg-primary-container text-white px-10 py-4 font-bold rounded shadow-md hover:translate-y-[-2px] transition-all">Get Started Today</button>
          <button className="bg-white border border-gray-200 px-10 py-4 font-bold text-primary-container hover:bg-slate-50 transition-colors">Contact Support</button>
        </div>
      </section>

      {/* Footer Documentation */}
      <footer className="bg-white border-t border-gray-200 py-12 -mx-10 px-10 mt-12">
        <div className="grid grid-cols-4 gap-12">
          <div className="col-span-1">
            <h5 className="font-bold text-primary-container mb-4 uppercase text-xs tracking-widest">Platform</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a className="hover:text-secondary" href="#">Release Notes</a></li>
              <li><a className="hover:text-secondary" href="#">System Status</a></li>
              <li><a className="hover:text-secondary" href="#">Security Policy</a></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h5 className="font-bold text-primary-container mb-4 uppercase text-xs tracking-widest">Legal</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a className="hover:text-secondary" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-secondary" href="#">Terms of Service</a></li>
              <li><a className="hover:text-secondary" href="#">Accessibility</a></li>
            </ul>
          </div>
          <div className="col-span-2 text-right">
            <div className="inline-block text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary-container">gavel</span>
                <span className="font-bold text-primary-container uppercase text-sm">Official Institutional Partner</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs ml-auto leading-relaxed">
                Janhith Sathi is an independent initiative collaborating with local and state institutions to improve civic digital infrastructure.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>© 2024 Janhith Sathi Intelligence Engine</span>
          <div className="flex gap-6">
            <span>X (Twitter)</span>
            <span>LinkedIn</span>
            <span>GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
