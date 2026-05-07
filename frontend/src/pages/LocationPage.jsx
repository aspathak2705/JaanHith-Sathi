import { useState, useEffect } from 'react';

export default function LocationPage() {
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch districts on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/location/districts')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setDistricts(data.data);
          setDistrict(data.data[0]);
        }
      })
      .catch(err => console.error("Error fetching districts", err));
  }, []);

  // Fetch cities when district changes
  useEffect(() => {
    if (!district) return;
    fetch(`http://127.0.0.1:8000/location/cities?district=${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setCities(data.data);
          setCity(data.data[0]);
        } else {
          setCities([]);
          setCity('');
        }
      })
      .catch(err => console.error("Error fetching cities", err));
  }, [district]);

  const fetchBooths = async () => {
    if (!district || !city) return;
    setLoading(true);
    setMessage('');
    setBooths([]);
    try {
      const res = await fetch(`http://127.0.0.1:8000/location/booths?district=${encodeURIComponent(district)}&city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setBooths(data.data);
      } else {
        setMessage("No booths found.");
      }
    } catch (e) {
      setMessage("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Search & Filter Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col p-6 overflow-y-auto shrink-0">
        <div className="mb-8">
          <label className="block text-xs font-bold text-primary-container uppercase tracking-wider mb-2">Region Filter</label>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block mb-1">DISTRICT</span>
              <select 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border-gray-200 rounded-lg text-sm focus:ring-primary-container"
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold block mb-1">MUNICIPAL CITY</span>
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-gray-200 rounded-lg text-sm focus:ring-primary-container"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
        


        <div className="mt-auto">
          <button 
            onClick={fetchBooths} 
            disabled={loading || !district || !city}
            className="w-full bg-primary-container text-white py-3 rounded-lg font-bold text-sm hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">filter_alt</span> 
            {loading ? 'Filtering...' : 'Apply Intelligence Filters'}
          </button>
        </div>
      </div>
      
      {/* Content Area: Grid + Map */}
      <div className="flex-1 flex flex-col bg-surface overflow-hidden">
        {/* Map Intelligence Section */}
        <section className="h-[40%] relative border-b border-gray-200 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-slate-200">
            <img className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXcLADUTTkcVauP2UgzmZPWQbFAR0lWQbsybg2Gob3SdBSG8fXvs47HdaYqKHQclOJ8O1j7T9-QfwZGIfU_6jyg783ZEYhRJ9aKAWTs_YUyODYfge56ayBCTgYOu8e7k_py33ClQxPmnnr7Pk8juHifJsxF8cvqcuEQ0xzPApEB4KppcwC96m4FPcKWZxz8aYTw0-l7-_SmW_sgvdqE9t7z0IeU_Cno6ZBL9gVVqY8D9Kya3ZJ3pdc-wNelQ5HqOizNcYNNQTeOPLe" alt="Map View" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
          </div>
          
          {/* Floating Info Card */}
          <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md border border-white p-4 rounded-xl shadow-xl max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">my_location</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">Your Location</h4>
                <p className="text-xs text-gray-500 capitalize">{city || 'Location Unknown'}</p>
              </div>
            </div>
            {booths.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Nearest Booth:</span>
                  <span className="font-bold text-primary-container">{booths[0].distance_km ? `${booths[0].distance_km} km` : 'Found'}</span>
                </div>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full" style={{ width: booths[0].distance_km ? `${Math.min(100, Math.max(10, 100 - (booths[0].distance_km * 10)))}%` : '50%' }}></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">Search for booths to see nearest</p>
            )}
          </div>

          {/* Map Action Layer */}
          <div className="absolute bottom-4 right-6 flex gap-2">
            <button className="bg-white border border-gray-200 p-2 rounded shadow-md hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="bg-white border border-gray-200 p-2 rounded shadow-md hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined">remove</span>
            </button>
            <button className="bg-white border border-gray-200 p-2 rounded shadow-md hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined">layers</span>
            </button>
          </div>
        </section>

        {/* Booth Cards List */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-h3 text-primary">Intelligence Grid</h3>
              <p className="text-caption text-gray-500">{booths.length > 0 ? `${booths.length} Validated Polling Booths found in this radius.` : 'Search to find polling booths.'}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded text-gray-400 hover:text-primary-container transition-colors">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button className="p-2 border border-gray-200 rounded text-gray-400 hover:text-primary-container transition-colors">
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>
          
          {message && <p className="text-gray-500 mb-4">{message}</p>}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {booths.map((booth, idx) => (
              <div key={idx} className="bg-white border-t-2 border-secondary rounded-lg p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase">Verified</span>
                    <h4 className="font-bold text-primary mt-2">{booth.booth_name || 'Booth'}</h4>
                  </div>
                  <span className="material-symbols-outlined text-secondary">verified</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="material-symbols-outlined text-lg">home_pin</span>
                    <span>{[booth.building, booth.area, booth.room].filter(Boolean).join(', ') || 'Location Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="material-symbols-outlined text-lg">distance</span>
                    <span>{booth.distance_km !== undefined ? `${booth.distance_km} km away` : 'Distance Unknown'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([booth.building, booth.area, booth.room].filter(Boolean).join(', ') + ' ' + city)}`, '_blank')}
                  className="mt-4 w-full text-center py-2 text-xs font-bold text-primary-container border border-gray-100 rounded group-hover:border-primary-container transition-all"
                >
                  View on Map
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
