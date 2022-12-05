const users = [];

const addUser = ({ id, username, room }) => {
	// clean data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	// validate data
	if (!username || !room) {
		return {
			error: "Username and Room are required",
		};
	}

	// check for existing user
	const existingUser = users.find(
		(user) => user.room === room && user.username === username
	);

	if (existingUser) {
		return {
			error: "Username already exists",
		};
	}
	const newUser = { id, username, room };
	users.push(newUser);
	// console.log(users);
	return { user: newUser };
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};

const removeUser = (id) => {
	const userIdx = users.findIndex((user) => user.id === id);
	if (userIdx !== -1) {
		return users.splice(userIdx, 1)[0];
	}
};

const getUserInRoom = (room) => {
	return users.filter((user) => user.room === room);
};

module.exports = {
	addUser,
	getUser,
	removeUser,
	getUserInRoom,
};
