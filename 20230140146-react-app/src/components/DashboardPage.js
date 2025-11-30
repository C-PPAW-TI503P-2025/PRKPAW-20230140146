import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [waktu, setWaktu] = useState("");

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
      if (jam < 12) setWaktu("Selamat Pagi");
      else if (jam < 18) setWaktu("Selamat Siang");
      else setWaktu("Selamat Malam");

    } catch (err) {
      console.error("Token invalid");
      handleLogout();
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email"); // diganti nama menjadi email
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Jika user belum siap
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
        <p className="text-gray-600">Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
                    bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-6">

      {/* Card Box */}
      <div className="bg-white w-full max-w-lg p-10 rounded-3xl shadow-xl border border-gray-100
                      transform transition-all hover:scale-[1.02] duration-300">

        {/* Greeting Title */}
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-3">
          {waktu}, {user.email}!
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Selamat datang kembali di Dashboard Anda
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-1 gap-4">

          {/* Presensi */}
          <button
            onClick={() => navigate("/presensi")}
            className="py-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                       font-semibold rounded-xl shadow-md hover:opacity-90 transition-all active:scale-95"
          >
            Lakukan Presensi
          </button>

          {/* Tombol Laporan (Admin Only) */}
          {user.role.toLowerCase() === "admin" && (
            <button
              onClick={() => navigate("/reports")}
              className="py-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                         font-semibold rounded-xl shadow-md hover:opacity-90 transition-all active:scale-95"
            >
              Lihat Laporan
            </button>
          )}

          {/* Logout */}
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
