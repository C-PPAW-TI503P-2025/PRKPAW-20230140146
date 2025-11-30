import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon marker Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const navigate = useNavigate();

  const getLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false);
          console.log("Lokasi berhasil didapat:", position.coords);
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
          setLoadingLocation(false);
          console.error("Error lokasi:", err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError("Geolocation tidak didukung di browser Anda.");
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setMessage("");
    setError("");
    setIsLoading(true);

    if (!coords) {
      setError("Lokasi belum didapatkan. Mohon izinkan akses lokasi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || "Check-In berhasil!");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan Check-In");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || "Check-Out berhasil!");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan Check-Out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Presensi Harian
            </h2>
            <p className="text-gray-600">
              Lakukan check-in dan check-out Anda
            </p>
          </div>

          {/* Map lokasi */}
          {loadingLocation && !coords && (
            <div className="mb-6 p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
              <p className="text-gray-600">Mengambil lokasi Anda...</p>
              <p className="text-sm text-gray-500 mt-2">Mohon izinkan akses lokasi di browser Anda</p>
            </div>
          )}

          {coords && (
            <div className="mb-6 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={16}
                style={{ height: "350px", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coords.lat, coords.lng]}>
                  <Popup>
                    <div className="text-center">
                      <strong>Lokasi Anda</strong>
                      <br />
                      Lat: {coords.lat.toFixed(6)}
                      <br />
                      Lng: {coords.lng.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* Koordinat Display */}
          {coords && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 text-center">
                📍 Latitude: <strong>{coords.lat.toFixed(6)}</strong> | Longitude: <strong>{coords.lng.toFixed(6)}</strong>
              </p>
            </div>
          )}

          {/* Message & Error */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-medium">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Tombol */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCheckIn}
              disabled={isLoading || !coords}
              className="py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                         font-semibold rounded-xl shadow-md 
                         hover:from-green-600 hover:to-emerald-700 hover:shadow-lg
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {isLoading ? "Memproses..." : "Check-In"}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="py-4 px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white 
                         font-semibold rounded-xl shadow-md 
                         hover:from-red-600 hover:to-rose-700 hover:shadow-lg
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoading ? "Memproses..." : "Check-Out"}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Catatan Penting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan lokasi GPS Anda aktif</li>
                  <li>Check-in harus dilakukan sebelum check-out</li>
                  <li>Data presensi akan tersimpan secara otomatis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refresh Location Button */}
          {!coords && !loadingLocation && (
            <div className="mt-4 text-center">
              <button
                onClick={getLocation}
                className="py-2 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;