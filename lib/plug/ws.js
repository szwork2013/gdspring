// var WebSocketServer = $['websocket'].server;

// module.exports= () => {
// 	wsServer = new WebSocketServer({
// 	    httpServer: $.server,
// 	    // You should not use autoAcceptConnections for production
// 	    // applications, as it defeats all standard cross-origin protection
// 	    // facilities built into the protocol and the browser.  You should
// 	    // *always* verify the connection's origin and decide whether or not
// 	    // to accept it.
// 	    //autoAcceptConnections: false
// 	    fragmentOutgoingMessages: false
// 	});

// 	function originIsAllowed(origin) {
// 	  // put logic here to detect whether the specified origin is allowed.
// 	  return true;
// 	}

// 	var connections = [];

// 	wsServer.on('request', function(request) {
// 	    if (!originIsAllowed(request.origin)) {
// 	      // Make sure we only accept requests from an allowed origin
// 	      request.reject();
// 	      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
// 	      return;
// 	    }

// 	    var connection = request.accept('echo-protocol', request.origin);
// 	    console.log(connection);
// 	    connections.push(connection);

// 	    console.log((new Date()) + ' Connection accepted.');
// 	    connection.on('message', function(message) {
// 	        connections.forEach(function(destination) {
// 		            if (message.type === 'utf8') {
// 			            console.log('Received Message: ' + message.utf8Data);
// 			            destination.sendUTF(message.utf8Data);
// 			        }
// 			        else if (message.type === 'binary') {
// 			            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
// 			            destination.sendBytes(message.binaryData);
// 			        }
//             });
// 	    });
// 	    connection.on('close', function(reasonCode, description) {
// 	    	 var index = connections.indexOf(connection);
// 	        if (index !== -1) {
// 	            // remove the connection from the pool
// 	            connections.splice(index, 1);
// 	        }
// 	        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
// 	    });
// 	});
// }


var connections = [];
var WebSocket = $['faye-websocket'];

module.exports = () => {
	$.server.on('upgrade', function(request, socket, body) {
	  if (WebSocket.isWebSocket(request)) {
	  	//console.log(body);
	    var ws = new WebSocket(request, socket, body);
	    connections.push(ws);
	    //console.log(connections.length);
	    ws.on('message', function(event) {

	    	connections.forEach(function(destination) {
	    	   //console.log(destination.url);
	    	   //console.log(ws.url);
	    	   if(destination.url === ws.url)
	           {
	    		 destination.send(event.data);
	           }
	    	});
	    });

	    ws.on('close', function(event) {
	      var index = connections.indexOf(ws);
          if (index !== -1) {
            // remove the connection from the pool
            connections.splice(index, 1);
          }
	      //console.log('close', event.code, event.reason);
	      ws = null;
	    });
	  }
	});
};

// module.exports = () => {
// 	// 创建WebSocket服务器
// 	var io = $['socket.io']($.server);
// 	// 打印提示
// 	console.log("╔══════════════════════════════════════════════════════════════════════════════════╗");
// 	console.log("╠═ "    + new Date() + " 启动WebSocket成功，端口: " + $.config.port +    " ═╣");
// 	console.log("╚══════════════════════════════════════════════════════════════════════════════════╝");
// 	// 监听WebSocket服务器连接
// 	io.of('/socket')
// 	  .on('connection', socket => {
// 		// 获得ip
// 		var ip = socket.handshake.address.split(':').pop();
// 	 	// 有人上线
// 	 	socket.on('online', (data) => {
// 	 		// 检查是否是已经登录绑定
// 	 		if (!$.config.socket.clients[data.user]) {
// 	 			// 打印提示
// 	 			console.log(data.user + "【" + ip + "】已连接成功");
// 	 			// 发送提示
// 	 			socket.emit('system', { code: '200', msg: '已连接成功' });
// 	 			// 存储用户
// 	      		$.config.socket.users.unshift(data.user);
// 	 		}
// 	 		// 存储连接
// 	 		$.config.socket.clients[data.user] = socket;
// 	 		// 执行完消息
// 	 		for (var key in $.config.socket.message) {
// 	 			for (var i=0; i < $.config.socket.message[key].length; i++) {
// 	 				$.config.socket.clients[key].emit($.config.socket.message[key][i].name, $.config.socket.message[key][i].data);
// 	 				$.config.socket.message[key].splice($.config.socket.message[key].indexOf(i), 1);
// 	 			}
// 	 		}
// 	 	});
// 	 	// 手动下线
// 	 	socket.on('offline', (data) => {
// 	 		if ($.config.socket.clients[data.user]) {
// 	 			// 发送提示
// 		 		$.config.socket.clients[data.user].emit('system', { code: '200', msg: '已成功断开' });
// 		 		// 触发下线
// 			    $.config.socket.clients[data.user].disconnect();
// 			}
// 		});
// 	 	// 自动下线
// 	 	socket.on('disconnect', () => {
// 	 		// 5秒后下线
// 	    	setTimeout(userOffline, 100);
// 	    	// 执行下线
// 	 		function userOffline() {
// 	 			// 遍历连接
// 			    for(var index in $.config.socket.clients) {
// 			    	// 找到连接
// 			        if($.config.socket.clients[index] == socket) {
// 			        	// 打印提示
// 			        	console.log(index + "【" + ip + "】已成功断开");
// 			        	// 取消用户
// 			          	$.config.socket.users.splice($.config.socket.users.indexOf(index), 1);
// 			          	// 取消服务
// 			          	delete $.config.socket.clients[index];
// 			          	// 跳出
// 			          	break;
// 			        }
// 			    }
// 		    }
// 	 	});
// 	 	// 扩展监听
// 	 	for (var key in $.config.socket.listeners) {
// 	 		// 追加监听
// 	 		socket.on(key, $.config.socket.listeners[key]);
// 	 	}
// 	});
// };