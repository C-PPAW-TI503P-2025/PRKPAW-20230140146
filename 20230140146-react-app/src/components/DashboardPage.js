import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [waktu, setWaktu] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // Update waktu real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ambil data user dari token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);

      // Tentukan greeting
      const jam = new Date().getHours();
      if (jam < 12) {
        setWaktu("Selamat Pagi");
        setGreeting("Semoga hari Anda menyenangkan! ☀️");
      } else if (jam < 15) {
        setWaktu("Selamat Siang");
        setGreeting("Tetap semangat bekerja! 🌤️");
      } else if (jam < 18) {
        setWaktu("Selamat Sore");
        setGreeting("Semoga produktif hari ini! 🌅");
      } else {
        setWaktu("Selamat Malam");
        setGreeting("Waktunya istirahat yang cukup! 🌙");
      }

    } catch (err) {
      console.error("Token invalid");
      handleLogout();
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Jika user belum siap
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-xl font-semibold">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-200 opacity-20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        
        {/* Main Container */}
        <div className="w-full max-w-5xl">
          
          {/* Header Card with Time */}
          <div className="bg-white rounded-3xl p-8 mb-6 shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {waktu}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  {greeting}
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {currentTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-gray-500">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 transform transition-all hover:scale-[1.02] duration-300">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {user.email}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role.toLowerCase() === 'admin' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                  <span className="text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Presensi Button */}
              <button
                onClick={() => navigate("/presensi")}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 
                         text-white font-semibold rounded-2xl p-6 shadow-lg
                         hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-lg font-bold mb-1">Presensi</div>
                    <div className="text-sm text-white/80">Check-in & Check-out</div>
                  </div>
                  <svg className="w-10 h-10 transform group-hover:translate-x-2 transition-transform" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>

              {/* Laporan Button (Admin Only) */}
              {user.role.toLowerCase() === "admin" && (
                <button
                  onClick={() => navigate("/reports")}
                  className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 
                           text-white font-semibold rounded-2xl p-6 shadow-lg
                           hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-lg font-bold mb-1">Laporan</div>
                      <div className="text-sm text-white/80">Data Presensi</div>
                    </div>
                    <svg className="w-10 h-10 transform group-hover:translate-x-2 transition-transform" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm mt-6">
            <p>© {new Date().getFullYear()} Dashboard App - Made with 146</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;