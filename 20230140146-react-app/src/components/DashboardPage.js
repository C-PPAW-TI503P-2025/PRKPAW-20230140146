import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [waktu, setWaktu] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('nama') || 'Pengguna';
    setNama(storedName);

    const jam = new Date().getHours();
    if (jam < 12) setWaktu('Selamat Pagi');
    else if (jam < 18) setWaktu('Selamat Siang');
    else setWaktu('Selamat Malam');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
                    bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-6">

      {/* Card */}
      <div className="bg-white w-full max-w-lg p-10 rounded-3xl shadow-xl border border-gray-100
                      transform transition-all hover:scale-[1.02] duration-300">

        {/* Title */}
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-3">
          {waktu}, {nama}!
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Selamat datang kembali di Dashboard Anda
        </p>

        {/* Feature Buttons */}
        <div className="grid grid-cols-1 gap-4">

          <button
            onClick={() => alert('Fitur aktivitas belum tersedia')}
            className="py-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                       font-semibold rounded-xl shadow-md hover:opacity-90 transition-all active:scale-95"
          >
            Lihat Aktivitas
          </button>

          <button
            onClick={handleLogout}
            className="py-3 w-full bg-red-500 text-white font-semibold rounded-xl shadow-md 
                       hover:bg-red-600 transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-gray-700 text-sm opacity-80">
        © {new Date().getFullYear()} Dashboard App
      </footer>
    </div>
  );
}

export default DashboardPage;
