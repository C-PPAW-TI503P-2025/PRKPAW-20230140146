const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');	
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

exports.register = async (req, res) => {
  try {
    console.log('DEBUG register body:', req.body);
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: "Data tidak lengkap! Nama, email, dan password wajib diisi" 
      });
    }

    if (role && !['mahasiswa', 'admin'].includes(role)) {
      return res.status(400).json({ 
        status: 'error',
        message: "Role tidak valid! Pilihan role hanya 'mahasiswa' atau 'admin'" 
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error', 
        message: "Email sudah terdaftar! Silakan gunakan email lain"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      role: role || 'mahasiswa' 
    });

    res.status(201).json({
      status: 'success',
      message: "Registrasi berhasil! Akun telah dibuat",
      data: { 
        id: newUser.id, 
        nama: newUser.nama,
        email: newUser.email, 
        role: newUser.role 
      }
    });

  } catch (error) {
    console.error('Error saat registrasi:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        status: 'error',
        message: "Email sudah terdaftar! Silakan gunakan email lain" 
      });
    }
    res.status(500).json({ 
      status: 'error',
      message: "Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti" 
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    const payload = {
      id: user.id,
      nama: user.nama,
      role: user.role 
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h' 
    });

    res.json({
      message: "Login berhasil",
      token: token 
    });

  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
