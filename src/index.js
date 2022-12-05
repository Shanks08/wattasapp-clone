const express = require("express");
const socketio = require("socket.io");
const badWords = require("bad-words");
const http = require("http");
const path = require("path");
const {
	generateMessage,
	generateLocationMessage,
	cleanUp,
} = require("./utils/messages");
const {
	addUser,
	getUser,
	removeUser,
	getUserInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const pathToPublicDir = path.join(__dirname, "../public");

app.use(express.static(pathToPublicDir));

io.on("connection", (socket) => {
	console.log("New connection");

	socket.on("join", ({ username, room }, callback) => {
		const { error, user } = addUser({
			id: socket.id,
			username,
			room,
		});
		if (error) {
			return callback(error);
		}

		socket.join(user.room);
		socket.emit(
			"message",
			generateMessage("SYSTEM", `WELCOME! ${user.username} 	🐱‍👤`)
		);

		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				generateMessage("SYSTEM", `${user.username} has joined!`)
			);
		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUserInRoom(user.room),
		});

		callback();
	});

	socket.on("sendMessage", (message, callback) => {
		message = cleanUp(message);
		const user = getUser(socket.id);
		if (message === "") {
			return callback("Message cant be empty");
		}
		const filter = new badWords();
		if (filter.isProfane(message)) {
			message = filter.clean(message);
		}
		io.to(user.room).emit("message", generateMessage(user.username, message));
		callback();
	});

	socket.on("sendLocation", (url, callback) => {
		const user = getUser(socket.id);
		// console.log(">>>", user, socket.id);
		io.to(user.room).emit(
			"locationMessage",
			generateLocationMessage(user.username, url)
		);
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				"message",
				generateMessage("SYSTEM", `${user.username} has left!`)
			);
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUserInRoom(user.room),
			});
		}
	});
});

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
