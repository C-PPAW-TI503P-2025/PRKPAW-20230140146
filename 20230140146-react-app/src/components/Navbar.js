// File: src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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
        localStorage.removeItem('email'); // hapus nama, pakai email
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md border-b sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">

                    {/* Left Section */}
                    <div className="flex items-center space-x-6">
                        <Link 
                            to="/dashboard" 
                            className="text-xl font-bold text-indigo-600 hover:text-indigo-700"
                        >
                            PresensiApp
                        </Link>

                        {user && (
                            <>
                                <Link 
                                    to="/presensi" 
                                    className="text-gray-700 hover:text-indigo-600 transition"
                                >
                                    Presensi
                                </Link>

                                {/* Hanya Admin */}
                                {user.role?.toLowerCase() === "admin" && (
                                    <Link 
                                        to="/reports" 
                                        className="text-gray-700 hover:text-green-600 font-semibold transition"
                                    >
                                        Laporan Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="hidden sm:inline text-gray-700 text-sm">
                                    Halo, <b className="text-indigo-600">{user.email}</b> ({user.role})
                                </span>

                                <button
                                    onClick={handleLogout}
                                    className="py-1 px-3 bg-red-500 text-white text-sm rounded-md 
                                               hover:bg-red-600 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-indigo-600 hover:text-indigo-800"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="text-indigo-600 hover:text-indigo-800"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
