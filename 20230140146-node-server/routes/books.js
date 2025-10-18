const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer' },
  { id: 2, title: 'Laskar Pelangi', author: 'Andrea Hirata' }
];
let nextId = 3; 


// =================================================================
// IMPLEMENTASI CRUD (CREATE, READ, UPDATE, DELETE)
// =================================================================

// [R]EAD - Mendapatkan semua data buku
router.get('/', (req, res) => {
  res.status(200).json(books);
});

// [R]EAD - Mendapatkan satu buku berdasarkan ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ message: 'Buku tidak ditemukan' });
  }
  res.status(200).json(book);
});

// [C]REATE - Membuat buku baru
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Judul dan penulis wajib diisi' });
  }
  const newBook = {
    id: nextId++, 
    title: title,
    author: author
  };
  books.push(newBook);
  res.status(201).json({ message: 'Buku berhasil ditambahkan', data: newBook });
});

// [U]PDATE - Memperbarui buku berdasarkan ID
router.put('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Buku tidak ditemukan' });
  }

  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Judul dan penulis wajib diisi untuk pembaruan' });
  }

  const updatedBook = {
    ...books[bookIndex],
    title: title,
    author: author
  };

  books[bookIndex] = updatedBook;
  res.status(200).json({ message: 'Buku berhasil diperbarui', data: updatedBook });
});

// [D]ELETE - Menghapus buku berdasarkan ID
router.delete('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Buku tidak ditemukan' });
  }

  books.splice(bookIndex, 1);
  res.status(200).json({ message: 'Buku berhasil dihapus' });
});

module.exports = router;

