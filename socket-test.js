var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io-client')(http);

io.sockets.on('connection', function(socket) {
    console.log('connected', socket.client.id);
});

http.listen(9001, function() {
    console.log('listening on port 9001');
});
