import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Webcam from "react-webcam";
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
  const [image, setImage] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const [webcamReady, setWebcamReady] = useState(false);
  const [useFileInput, setUseFileInput] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
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
          timeout: 30000,
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

  const handleWebcamUserMedia = () => {
    setWebcamReady(true);
    setWebcamError(null);
    console.log("Webcam ready");
  };

  const handleWebcamError = (error) => {
    console.error("Webcam error:", error);
    setWebcamError("Gagal mengakses kamera. Gunakan upload foto sebagai alternatif.");
    setWebcamReady(false);
    // Auto switch ke file input setelah 3 detik
    setTimeout(() => {
      setUseFileInput(true);
    }, 3000);
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      setError("Kamera belum siap. Mohon tunggu sebentar.");
      return;
    }
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setError("");
    } else {
      setError("Gagal mengambil foto. Silakan coba lagi.");
    }
  }, [webcamRef]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        setError("File harus berupa gambar!");
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");
    
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.error('No token found, redirecting to login');
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

    if (!image) {
      setError("Foto selfie wajib diambil sebelum check-in!");
      setIsLoading(false);
      return;
    }

    try {
      console.log('Preparing check-in data:', {
        lat: coords.lat,
        lng: coords.lng,
        hasImage: !!image
      });

      // Convert base64 image to blob
      const base64Response = await fetch(image);
      const blob = await base64Response.blob();
      
      console.log('Blob created:', {
        size: blob.size,
        type: blob.type
      });
      
      // Buat FormData
      const formData = new FormData();
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());
      formData.append('buktiFoto', blob, 'selfie.jpg'); // ✅ FIXED: Sesuai dengan backend

      // Debug: Log FormData contents
      for (let pair of formData.entries()) {
        console.log('FormData:', pair[0], typeof pair[1] === 'object' ? 'File/Blob' : pair[1]);
      }

      console.log('Sending request to:', "http://localhost:3001/api/presensi/check-in");

      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Jangan set Content-Type manual, biarkan axios yang handle
          },
        }
      );

      console.log('Check-in response:', response.data);
      setMessage(response.data.message || "Check-In berhasil!");
      // Foto TIDAK dihapus, user bisa lihat foto yang sudah diupload
      
    } catch (err) {
      console.error('Check-in error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = "Gagal melakukan Check-In";
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                       `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "Tidak ada respons dari server. Pastikan server berjalan di http://localhost:3001";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");
    
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate("/login");
      return;
    }

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      console.log('Sending check-out request');
      
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Check-out response:', response.data);
      setMessage(response.data.message || "Check-Out berhasil!");
      
      // Reset foto setelah checkout berhasil
      setImage(null);
      
    } catch (err) {
      console.error('Check-out error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = "Gagal melakukan Check-Out";
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                       `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "Tidak ada respons dari server. Pastikan server berjalan di http://localhost:3001";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

          {/* Tampilan Kamera atau Upload */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {useFileInput ? "Upload Foto Selfie" : "Ambil Foto Selfie"}
              </h3>
              <p className="text-sm text-gray-600">Foto diperlukan untuk verifikasi check-in</p>
              
              {/* Toggle Button */}
              <div className="mt-2">
                <button
                  onClick={() => setUseFileInput(!useFileInput)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                >
                  {useFileInput ? "Gunakan Kamera" : "Upload dari File"}
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-black shadow-sm relative" style={{ minHeight: "300px" }}>
              {image ? (
                <img src={image} alt="Selfie Preview" className="w-full h-auto" />
              ) : useFileInput ? (
                // File Upload Mode
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                  <div className="text-center p-8">
                    <svg className="w-24 h-24 text-indigo-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-700 font-medium mb-2">Pilih foto selfie Anda</p>
                    <p className="text-sm text-gray-500 mb-4">JPG, PNG (max 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Pilih Foto
                    </button>
                  </div>
                </div>
              ) : (
                // Webcam Mode
                <>
                  {!webcamReady && !webcamError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-3"></div>
                        <p className="text-white">Memuat kamera...</p>
                        <p className="text-gray-300 text-sm mt-2">Mohon izinkan akses kamera</p>
                      </div>
                    </div>
                  )}
                  
                  {webcamError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90">
                      <div className="text-center p-6">
                        <svg className="w-16 h-16 text-red-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-white font-medium mb-2">Kamera Tidak Tersedia</p>
                        <p className="text-red-200 text-sm mb-4">{webcamError}</p>
                        <button
                          onClick={() => setUseFileInput(true)}
                          className="py-2 px-4 bg-white text-red-900 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Upload Foto Sebagai Gantinya
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-auto"
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user"
                      }}
                      onUserMedia={handleWebcamUserMedia}
                      onUserMediaError={handleWebcamError}
                    />
                  )}
                </>
              )}
            </div>

            <div className="mt-4">
              {!image ? (
                useFileInput ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                             font-semibold rounded-xl shadow-md 
                             hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg
                             transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Pilih Foto 📁
                  </button>
                ) : (
                  <button
                    onClick={capture}
                    disabled={!webcamReady || webcamError}
                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                             font-semibold rounded-xl shadow-md 
                             hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    {webcamReady ? "Ambil Foto 📸" : "Menunggu Kamera..."}
                  </button>
                )
              ) : (
                <button
                  onClick={() => setImage(null)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
                           font-semibold rounded-xl shadow-md 
                           hover:from-gray-600 hover:to-gray-700 hover:shadow-lg
                           transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Foto Ulang 🔄
                </button>
              )}
            </div>
          </div>

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
              disabled={isLoading || !coords || !image}
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
                  <li>Izinkan akses kamera atau upload foto selfie</li>
                  <li>Foto selfie wajib sebelum check-in</li>
                  <li>Check-in harus dilakukan sebelum check-out</li>
                  <li>Data presensi tersimpan otomatis</li>
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