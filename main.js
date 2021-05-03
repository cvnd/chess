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
  console.log(room);
  if(typeof room !== 'undefined'){
    console.log(room.size);

    if(room.size == 1) {
      console.log('noboday');
      status = 'dark';
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
  console.log(socket.id);
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('join', function(room_id) {
    socket.join(room_id);
    console.log("room joined: " + room_id);
    // console.log(io.sockets.adapter.rooms);
    const room = io.sockets.adapter.rooms.get(room_id);
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

  socket.on('move', function(data) {
    io.to(data.room).emit('piece moved', data);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
