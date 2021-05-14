const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets'));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.get('/lobby', (req, res) => {
  res.sendFile(__dirname + '/lobby.html');
});

app.get('/play/:id', (req, res) => {
  // Initial side set to light
  var status = 'light';
  var room = io.sockets.adapter.rooms.get(req.params.id);

  // If room exists, they're not the first player.
  if(typeof room !== 'undefined'){

    // If there is only one other person, then they are the 2nd player
    if(room.size == 1) {
      let playingSockets = Object.keys(room.players);

      if(room.players[playingSockets[0]] === 'light') {
        status = 'dark';
      }
    } else if(room.size >= 2) {
      status = 'observer';
    }
  }
  res.render('chess', {
    id: req.params.id,
    status: status
  });
});


io.on('connection', (socket) => {
  socket.room = '';
  socket.side = '';

  socket.on('join', function(data) {
    var room_id = data.room;
    socket.join(room_id);
    socket.room = room_id;
    var room = io.sockets.adapter.rooms.get(room_id);

    if(room.size == 1) {
      room.players = {};
      room.players[socket.id] = 'light';
      socket.side = 'light';
    } else if (room.size == 2) {
      room.players[socket.id] = 'dark';
      socket.side = 'dark';
    }

    if(room.size == 2) {
      io.to(room_id).emit('start game');
    }

  });


  socket.on('victory', function(winner) {
    io.to(socket.room).emit('gameOver', winner);
  });
  
  // Upon receiving signal that a player has moved, transmit to the other room
  socket.on('move', function(data) {
    io.to(data.room).emit('piece moved', data);
  });

  // The socket that diconnects is forfeiting
  socket.on('disconnecting', function() {
    io.to(socket.room).emit('forfeiting', socket.side);
  });

  socket.on('check', function(data) {
    io.to(data.room).emit('checked', data.side);
  });
});


http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
