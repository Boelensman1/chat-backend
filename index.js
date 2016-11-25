var http = require('http');
var server = http.createServer();
var socket_io = require('socket.io');
server.listen(8080);
var io = socket_io();
io.attach(server);

const rooms = {};

io.set('authorization', function (handshake, callback) {
  callback(null, handshake._query.chatRoom);
});

io.on('connection', function(socket){
  const chatRoom = socket.request._query.chatRoom;

  console.log("Socket connected: " + socket.id);

  if (!rooms[chatRoom]) {
    rooms[chatRoom] = []
  }
  rooms[chatRoom].push(socket)

  if (rooms[chatRoom].length > 1) {
    rooms[chatRoom].forEach((gsocket) => {
      console.log('chat for ' + chatRoom + ' is ready');
      gsocket.emit('chatReady');
    })
  }


  socket.on('newMessage', (message) => {
    console.log(message);
    rooms[chatRoom].forEach((gsocket) => {
      if (socket != gsocket) {
        console.log('sending message to group ' + chatRoom)
        gsocket.emit('newMessage', message);
      }
    })
  });

  socket.on('disconnect', function () {
    rooms[chatRoom].forEach((gsocket) => {
      if (socket != gsocket) {
        console.log('user disconnected ' + chatRoom)
        gsocket.disconnect()
      }
    })
    delete rooms[chatRoom]
  });
});
