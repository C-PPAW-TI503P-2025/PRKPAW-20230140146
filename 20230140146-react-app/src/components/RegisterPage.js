// src/components/RegisterPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      await axios.post("http://localhost:3001/api/auth/register", formData);

      setMessage("Registrasi berhasil! Mengalihkan ke halaman login...");
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-indigo-300 to-purple-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-200">

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
          Daftar Akun
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Silakan lengkapi formulir berikut
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Role
            </label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition cursor-pointer"
            >
              <option value="">-- Pilih Role --</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="contoh@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-all duration-200 transform hover:scale-[1.03] disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "Register"}
          </button>
        </form>

        {message && (
          <p className={`text-center mt-4 font-medium ${
            message.includes("berhasil")
              ? "text-green-600"
              : "text-red-500"
          }`}>
            {message}
          </p>
        )}

        <p className="text-center text-sm mt-5 text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
