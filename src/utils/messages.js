const generateMessage = (username, text) => {
	return {
		username,
		text,
		createdAt: new Date().getTime(),
	};
};

const generateLocationMessage = (username, url) => {
	return {
		username,
		url,
		createdAt: new Date().getTime(),
	};
};

const cleanUp = (text) => {
	return text.trim();
};

module.exports = {
	generateMessage,
	generateLocationMessage,
	cleanUp,
};
