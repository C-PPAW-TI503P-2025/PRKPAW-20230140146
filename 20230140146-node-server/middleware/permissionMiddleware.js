const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan. Harap login terlebih dahulu.' });
    }

    const secret = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    console.error('Error verifikasi token:', err.message);
    return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('Izin diberikan: pengguna adalah admin');
    next();
  } else {
    console.warn(' Akses ditolak: pengguna bukan admin');
    return res.status(403).json({ message: 'Akses ditolak: hanya untuk admin.' });
  }
};

exports.addUserData = (req, res, next) => {
  req.user = { id: 123, nama: 'User Dummy', role: 'admin' };
  next();
};
