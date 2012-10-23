var source = new EventSource('/events');

function updatePosition (e) {
	var data = JSON.parse(e.data);
	console.log(data);
}

source.addEventListener('position', updatePosition, false);