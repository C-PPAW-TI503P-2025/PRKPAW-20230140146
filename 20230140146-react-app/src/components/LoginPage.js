// src/components/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });

      const token = response.data.token;
      const decoded = jwtDecode(token);

      localStorage.setItem('token', token);
      localStorage.setItem('email', decoded.email); // diganti dari nama ke email
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('userId', decoded.id);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 
                    bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">

      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-gray-100">

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
          Login
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Silakan masukkan akun Anda
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              placeholder="contoh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl
                       bg-gradient-to-r from-blue-500 to-purple-600
                       hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            Login
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm text-center mt-4">{error}</p>
        )}

        <p className="text-center text-sm mt-6 text-gray-700">
          Belum punya akun?{" "}
          <Link className="text-indigo-600 font-semibold hover:underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
