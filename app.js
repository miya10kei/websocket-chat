var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type' : 'text/html'});
    res.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).listen(3000);  // ポート競合の場合は値を変更

var io = socketio.listen(server);

io.sockets.on('connection', function(socket) {
    var name;
    socket.on('client_to_server', function(data) {
        io.sockets.emit('server_to_client', {value : data.value});
    });

    socket.on('client_to_server_broadcast', function(data) {
        socket.broadcast.emit('server_to_client', {value: data.value});
    });

    socket.on('client_to_server_unicast', function(data) {
        var id = socket.id;
        name = data.value;
        var message = "あなたは" + name + "さんとして入出しました。";
        io.to(id).emit('server_to_client', {value: message});
    });

    socket.on('disconnect', function() {
        if (name == 'undefined') {
            console.log('未入室のままどこかに去っていきました。');
        } else {
            var endMessage = name + "さんが退出しました。";
            io.sockets.emit('server_to_client', {value: endMessage});
        }
    });
});
