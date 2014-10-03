var listElement;
var litmpl = '<img src="{{imgurl}}">' + '<span class="title">{{title}}</span>' + '<span class="url">{{url}}</span>';

function handleMessage(e) {
	switch (e.name) {
		case 'receiveRecents':
			e.message.forEach(addListItem);
		break;
	}
}
function addListItem(item) {
	var li = document.createElement('li');
	li.id = item.id;
	li.innerHTML = litmpl.replace('{{imgurl}}', item.image).replace('{{title}}', item.title).replace('{{url}}', item.url);
	listElement.appendChild(li);
	li.onclick = function (e) {
		safari.self.tab.dispatchMessage('reopenClosedTab', li.id * 1);
		listElement.removeChild(li);
	};
}
function addOption(item) {
	var opt = document.createElement('option');
	opt.text = item.title;
	opt.value = opt.title = item.url;
	this.add(opt);
}
function requestReopen() {
	var options = [].slice.call(document.querySelector('select').options);
	var selectedIndexes = [];
	for (var i = options.length - 1; i >= 0; i--) {
		options[i].selected && selectedIndexes.push(i);
	};
	safari.self.tab.dispatchMessage('reopenClosedTabsWithIndexes', selectedIndexes);
	safari.self.tab.dispatchMessage('closeRecentsList');
}
function loadImageUrl(url) {
	console.log('Loading image url.');
	document.querySelector('img').src = url;
}

window.onload = function () {
	listElement = document.querySelector('ol');
	safari.self.addEventListener('message', handleMessage, false);
	safari.self.tab.dispatchMessage('passRecents');
};
