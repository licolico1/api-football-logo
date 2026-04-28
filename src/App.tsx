/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Search, Globe, Trophy } from "lucide-react";

interface Club {
  country: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export default function App() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  
  useEffect(() => {
    fetch("/api/logos")
      .then(res => res.json())
      .then((data: Club[]) => {
        setClubs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load clubs:", err);
        setLoading(false);
      });
  }, []);

  const countries = ["All", ...Array.from(new Set(clubs.map(c => c.country)))].sort() as string[];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "All" || club.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Football Logos</h1>
                <p className="text-sm text-gray-500">API & Gallery ({clubs.length} clubs)</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="w-full sm:w-48 pl-9 pr-8 py-2 bg-gray-100 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c === "All" ? "All Countries" : c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">API Access</h2>
          <p className="text-sm text-blue-800 mb-4">
            You can access this logo dataset programmatically.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto text-green-400 flex items-center justify-between">
            <code>GET {window.location.origin}/api/logos</code>
            <a href="/api/logos" target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-gray-600 transition-colors">
              View JSON
            </a>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-b-blue-600"></div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-6">Showing {filteredClubs.length} clubs</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredClubs.map((club) => (
                <div key={`${club.country}-${club.slug}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center hover:shadow-md transition-shadow group">
                  <div className="w-24 h-24 mb-4 flex items-center justify-center p-2 bg-gray-50 rounded-full group-hover:scale-105 transition-transform duration-300">
                    {club.logoUrl ? (
                      <img 
                        src={club.logoUrl.startsWith('http') ? club.logoUrl : `https://assets.football-logos.cc${club.logoUrl}`} 
                        alt={`${club.name} logo`} 
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-gray-300">No Image</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-center text-gray-900 mb-1 line-clamp-2" title={club.name}>
                    {club.name}
                  </h3>
                  <span className="text-xs text-gray-500 text-center uppercase tracking-wider">
                    {club.country.replace(/-/g, ' ')}
                  </span>
                </div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">No clubs found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

