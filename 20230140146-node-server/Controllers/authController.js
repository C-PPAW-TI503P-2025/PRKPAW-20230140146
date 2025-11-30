const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // VALIDASI
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: "Email dan password wajib diisi"
      });
    }

    if (role && !['mahasiswa', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: "Role tidak valid! Hanya 'mahasiswa' atau 'admin'"
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: "Email sudah terdaftar! Silakan gunakan email lain"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || 'mahasiswa'
    });

    res.status(201).json({
      status: 'success',
      message: "Registrasi berhasil",
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      status: 'error',
      message: "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};

// LOGIN
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
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: "Login berhasil",
      token,
      user: payload
    });

  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};