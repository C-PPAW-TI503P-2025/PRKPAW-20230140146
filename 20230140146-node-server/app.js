const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3001;

// Impor rute buku
const bookRoutes = require('./routes/books');

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

// Menggunakan rute buku SEBELUM app.listen
app.use('/api/books', bookRoutes);

// Error Handling untuk 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});

