const express = require('express');
const app     = express();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);
const path    = require('path');

const PORT    = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../client/')));
app.use(express.static(path.join(__dirname, '../build/')));

// Initial search page.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/', 'index.html'));
});

server.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
