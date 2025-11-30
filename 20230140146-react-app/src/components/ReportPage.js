import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/reports/daily";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Pastikan data ada dan array
      if (Array.isArray(response.data.data)) {
        setReports(response.data.data);
      } else {
        setReports([]);
      }

      setError(null);
    } catch (err) {
      setReports([]);
      setError(
        err.response && err.response.status === 403
          ? "Akses Ditolak: Halaman ini hanya untuk Admin."
          : err.response
          ? err.response.data.message
          : "Gagal mengambil data"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm ? `?email=${searchTerm}` : "";
    fetchReports(query);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
        >
          Cari
        </button>
      </form>

      {loading && (
        <p className="text-gray-600">Memuat laporan...</p>
      )}

      {error && !loading && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}

      {!error && !loading && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-Out
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((item, index) => {
                  // Data ada di dalam item.presensi
                  const email = item.email || item.user?.email || "N/A";
                  const checkIn = item.presensi?.checkIn;
                  const checkOut = item.presensi?.checkOut;

                  return (
                    <tr key={item.presensi?.id || `row-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {checkIn
                          ? new Date(checkIn).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                            })
                          : "Belum Check-In"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {checkOut
                          ? new Date(checkOut).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                            })
                          : "Belum Check-Out"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReportPage;