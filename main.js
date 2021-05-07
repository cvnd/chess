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

// app.get('/play', (req, res) => {
//   res.sendFile(__dirname + '/chess.html');
// });


app.get('/lobby', (req, res) => {
  res.sendFile(__dirname + '/lobby.html');
});

app.get('/play/:id', (req, res) => {
  var status = 'light';
  var room = io.sockets.adapter.rooms.get(req.params.id);
  //console.log(room);
  if(typeof room !== 'undefined'){
    console.log("Joining room with size: " + room.size);

    if(room.size == 1) {
      let playingSockets = Object.keys(room.players);

      if(room.players[playingSockets[0]] === 'light') {
        status = 'dark';
      }
      // //let playingSockets = room.values();
      // //console.log("other sockets: " + playingSockets.next().side);
      // // Object.keys(playingSockets.next()).forEach((prop)=> console.log(prop));

      // //playingSockets.next().value;
      // // status = io.to(playingSockets.next().value).emit('fetch side');
      // // io.sockets.on('return side', function(side) {
      // //   console.log("side fetched: " + side);
      //   // if(side === 'light') {
      //status = 'dark';
      //   // }
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
  //console.log(socket.id);
  socket.room = '';
  socket.side = '';
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('join', function(data) {
    var room_id = data.room;
    socket.join(room_id);
    // console.log(io.sockets.adapter.rooms);
    socket.room = room_id;
    var room = io.sockets.adapter.rooms.get(room_id);
    console.log(room);
    console.log("SocketID: " + socket.id + " Room Joined: " + room_id + " Room Size: " + room.size);

    if(room.size == 1) {
      room.players = {};
      room.players[socket.id] = 'light';
      socket.side = 'light';
    } else if (room.size == 2) {
      room.players[socket.id] = 'dark';
      socket.side = 'dark';
    }

    //Stringify to JSON object
    // room.players = JSON.parse(room.players);
    //socket.side = data.side;
    if(room.size == 2) {
      io.to(room_id).emit('start game');
    }
    // console.log(room);
    // // //console.log(io.sockets.adapter.rooms);
    // // console.log(room);
    // // if(typeof room !== 'undefined'){
    // //   console.log(room.length);
  
    // //   if(room.length == 1) {
    // //     console.log('noboday');
    // //     status = 'dark';
    // //   } else if(room.length > 2) {
    // //     status = 'observer';
    // //   }
    // // }
  });


  socket.on('victory', function(winner) {
    io.to(socket.room).emit('gameOver', winner);
  });
  socket.on('move', function(data) {
    io.to(data.room).emit('piece moved', data);
  });

  socket.on('disconnecting', function() {
    io.to(socket.room).emit('forfeiting', socket.side);
  });

  socket.on('check', function(data) {
    console.log("checking...");
    io.to(data.room).emit('checked', data.side);
  });
});


http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
