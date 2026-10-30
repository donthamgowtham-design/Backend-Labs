// Lab 2: Express + SQLite CRUD API
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json()); // lets us read JSON bodies (POST / PUT)

const dbPath = path.join(__dirname, 'books.db');
const PORT = process.env.PORT || 3000;
let db = null;

// Open the database FIRST, start the server only if that succeeds
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(PORT, (err) => {
      if (err) {
        console.error(`Could not start server: ${err.code === 'EADDRINUSE' ? `port ${PORT} is already in use` : err.message}`);
        process.exit(1);
      }
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

// Basic validation shared by POST and PUT
const validBook = ({ title, author, price, pages }) =>
  typeof title === 'string' && title.trim() !== '' &&
  typeof author === 'string' && author.trim() !== '' &&
  Number.isInteger(price) && price >= 0 &&
  Number.isInteger(pages) && pages > 0;

// Root route -> redirect to /books/
app.get('/', (req, res) => {
  res.redirect('/books/');
});

// GET all books
app.get('/books/', async (req, res) => {
  const books = await db.all('SELECT * FROM book ORDER BY id;');
  res.status(200).json(books);
});

// GET one book
app.get('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.status(200).json(book);
});

// POST add a book
app.post('/books/', async (req, res) => {
  const body = req.body || {};
  if (!validBook(body)) {
    return res.status(400).json({ error: 'title, author (text) and price, pages (whole numbers) are required' });
  }
  const { title, author, price, pages } = body;
  const result = await db.run(
    'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
    [title, author, price, pages]
  );
  res.status(201).json({ message: 'Book added successfully', bookId: result.lastID });
});

// PUT update a book
app.put('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  const body = req.body || {};
  if (!validBook(body)) {
    return res.status(400).json({ error: 'title, author (text) and price, pages (whole numbers) are required' });
  }
  const { title, author, price, pages } = body;
  const result = await db.run(
    'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
    [title, author, price, pages, bookId]
  );
  if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
  res.status(200).json({ message: 'Book updated successfully' });
});

// DELETE a book
app.delete('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId]);
  if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
  res.status(200).json({ message: 'Book deleted successfully' });
});

// Unknown path -> 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Bad JSON / unexpected errors -> proper status instead of a crash
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

initializeDBAndServer();
