const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3001;

// Import routes
const bookRoutes = require('./routes/books');
const reportRoutes = require('./routes/reports');
const presensiRoutes = require('./routes/presensi');
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rute
app.get('/', (req, res) => {
  res.send('Home Page for API');
});

// Register routes
app.use('/api/books', bookRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/auth', authRoutes);

// Error Handling untuk 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});

