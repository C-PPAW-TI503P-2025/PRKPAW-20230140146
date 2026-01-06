import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Token tidak valid");
                handleLogout();
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    // Helper function to check if link is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">

                    {/* Left Section - Logo & Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link 
                            to="/dashboard" 
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                PresensiApp
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        {user && (
                            <div className="hidden md:flex items-center space-x-2">
                                {/* Dashboard Link */}
                                <Link 
                                    to="/dashboard" 
                                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                        isActive('/dashboard')
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard
                                </Link>

                                {/* Presensi Link */}
                                <Link 
                                    to="/presensi" 
                                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                        isActive('/presensi')
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Presensi
                                </Link>

                                {/* BARU: Monitoring IoT Link */}
                                <Link 
                                    to="/monitoring" 
                                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                        isActive('/monitoring')
                                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Monitoring IoT
                                </Link>

                                {/* Admin Only - Laporan Link */}
                                {user.role?.toLowerCase() === "admin" && (
                                    <Link 
                                        to="/reports" 
                                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                            isActive('/reports')
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Laporan
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Section - User Info & Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* User Info */}
                                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {user.role?.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-lg
                                               hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg
                                               transform hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link 
                                    to="/login" 
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg
                                             hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg
                                             transform hover:scale-105 transition-all"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {user && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link 
                            to="/dashboard" 
                            className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                                isActive('/dashboard')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                            🏠 Dashboard
                        </Link>

                        <Link 
                            to="/presensi" 
                            className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                                isActive('/presensi')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                            📍 Presensi
                        </Link>

                        {/* BARU: Mobile Monitoring IoT Link */}
                        <Link 
                            to="/monitoring" 
                            className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                                isActive('/monitoring')
                                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                    : 'text-gray-700 hover:bg-orange-50'
                            }`}
                        >
                            📊 Monitoring IoT
                        </Link>

                        {user.role?.toLowerCase() === "admin" && (
                            <Link 
                                to="/reports" 
                                className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                                    isActive('/reports')
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                        : 'text-gray-700 hover:bg-emerald-50'
                                }`}
                            >
                                📋 Laporan
                            </Link>
                        )}

                        {/* Mobile User Info */}
                        <div className="lg:hidden mt-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{user.email}</p>
                                    <p className="text-xs text-gray-600">{user.role?.toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;