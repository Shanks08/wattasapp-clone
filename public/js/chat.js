// CLIENT

// ELEMENTS
const socket = io();
const $messageForm = document.querySelector("#message-form");
const $messageInput = document.querySelector("#message-input");
const $messageSendButton = document.querySelector("#message-send-button");
const $sendLocationButton = document.querySelector("#send-location-button");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// TEMPLATES
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoScroll = () => {
	// New Message
	const $newMessage = $messages.lastElementChild;

	// Height of the new Message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// visible height
	const visibleHeight = $messages.offsetHeight;

	// height of messages container
	const containerHeight = $messages.scrollHeight;

	// how far have I scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

// From Server
socket.on("message", (messageObj) => {
	console.log(messageObj);
	const html = Mustache.render(messageTemplate, {
		username: messageObj.username,
		message: messageObj.text,
		createdAt: moment(messageObj.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("locationMessage", (urlObj) => {
	console.log(urlObj);
	const html = Mustache.render(locationTemplate, {
		username: urlObj.username,
		url: urlObj.url,
		createdAt: moment(urlObj.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const message = $messageInput.value;
	$messageInput.value = "";
	$messageSendButton.setAttribute("disabled", "disabled");
	socket.emit("sendMessage", message, (error) => {
		$messageSendButton.removeAttribute("disabled");
		$messageInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log("Message Sent");
	});
});

$sendLocationButton.addEventListener("click", (e) => {
	if (!navigator.geolocation) {
		return alert("Geolocation not available in current version");
	}

	$sendLocationButton.setAttribute("disabled", "disabled");
	navigator.geolocation.getCurrentPosition((position) => {
		const url = `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;

		socket.emit("sendLocation", url, (error) => {
			$sendLocationButton.removeAttribute("disabled");
			if (error) {
				return console.log(error);
			}
			console.log("Location Sent");
		});
	});
});

socket.emit("join", { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	$sidebar.innerHTML = html;
});
