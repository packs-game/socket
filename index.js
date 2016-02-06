var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var lib = require('packs-lib');
var api = lib.api;

io.on('connection', function(socket) {
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
	socket.on('auth', function(data) {
		api.checkAuth(data.token, function(err,user){
			if (err) { return console.log(err); }
			socket.sockUser = user;
			socket.join(user.id);
		});
	});
	socket.on('logout', function() {
		socket.leave(socket.sockUser.id);
		socket.sockUser = null;
	});
});

http.listen(3004, function() {
	console.log('listening on *:3004');
});

var queue = lib.queue;

function sendSocketMsg(msg,done) {
	msg.to.forEach(function(room) {
		io.to(room).emit(msg.type, msg.data);
	});
	done();
}

queue.listen('socket', sendSocketMsg);