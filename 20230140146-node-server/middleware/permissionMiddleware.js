	const jwt = require('jsonwebtoken');

	// Middleware: authenticate JWT token and attach user payload to req.user
	exports.authenticateToken = (req, res, next) => {
	  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
	  const token = authHeader && authHeader.split(' ')[1];
	  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });
	  const secret = process.env.JWT_SECRET || 'secretkey';
	  try {
	    const payload = jwt.verify(token, secret);
	    // payload expected to include id, nama, role
	    req.user = payload;
	    next();
	  } catch (err) {
	    return res.status(401).json({ message: 'Token tidak valid' });
	  }
	};
 	
 	exports.isAdmin = (req, res, next) => {
 	  if (req.user && req.user.role === 'admin') {
 	    console.log('Middleware: Izin admin diberikan.');
 	    next(); 
 	  } else {
 	    console.log('Middleware: Gagal! Pengguna bukan admin.');
 	    return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin'});
 	  }
 	};

	// Backward-compat: alias addUserData (useful for tests) -> attach dummy admin
	exports.addUserData = (req, res, next) => {
	  req.user = { id: 123, nama: 'User Karyawan', role: 'admin' };
	  next();
	};
