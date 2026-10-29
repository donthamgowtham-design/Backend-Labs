// Part 2: same server rewritten with Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// GET / -> welcome text
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Lab 1 Express server!');
});

// GET /about -> JSON with name and section
app.get('/about', (req, res) => {
  res.status(200).json({ name: 'GOWTHAM YADAV', section: 'CSE-QE-2A' , registrationnumber:'252U1R8017' });
});

// GET /time -> current date and time
app.get('/time', (req, res) => {
  res.status(200).send(new Date().toString());
});

// 404 for any unknown path (must stay AFTER all routes)
app.use((req, res) => {
  res.status(404).send('404 - Route not found');
});

// In Express 5 the callback receives an error if the server could not start
app.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other server (Ctrl+C) or run: PORT=3001 npm start`);
    } else {
      console.error('Could not start server:', err.message);
    }
    process.exit(1);
  }
  console.log(`Express server running on http://localhost:${PORT}`);
});
