(function () {
	function eventMatchesHotkey(prop) {
		return this.hotkey[prop] === this.event[prop];
	}
	function getMatchingHotkeyAction(e) {
		var hotkeyMatchesEvent = function (p) {
			return this[p] == e[p];
		}
		var props = ['keyCode','altKey','ctrlKey','metaKey','shiftKey'];
		for (var h, m, i = 0; i < hotkeys.length; i++) {
			h = hotkeys[i];
			if (props.every(hotkeyMatchesEvent, h)) {
				return h.action;
			}
		} return null;
	}
	function handleKeydown(e) {
		var hid = getMatchingHotkeyAction(e);
		if (hid && okayToDoHotkey(e)) {
			e.preventDefault(); e.stopPropagation();
			safari.self.tab.dispatchMessage('handleHotkey', {
				hid  : hid,
				tv   : window.toolbar.visible,
				time : event.timeStamp
			});
		}
	}
	function handleMessage(msg) {
		switch (msg.name) {
			case 'receiveSettings': 
				for (var key in msg.message) {
					settings[key] = msg.message[key];
				}
			break;
			case 'receiveAllHotkeys': 
				hotkeys = msg.message;
				window.addEventListener('keydown', handleKeydown, false);
				window.addEventListener('mousedown', handleMousedown, false);
			break;
			case 'reload': 
				if (window == window.top) 
					window.location.reload(); 
			break;
			case 'goBack': 
				if (window == window.top) 
					window.history.back(); 
			break;
			case 'goForward': 
				if (window == window.top) 
					window.history.forward(); 
			break;
			case 'loadUrl': 
				if (window == window.top)
					window.location.href = msg.message; 
			break;
			case 'showRecents':
				if (window == window.top)
					showRecents();
			break;
			case 'closeRecents':
				document.documentElement.removeChild(document.getElementById('cksto_recents'));
			break;
		}
	}
	function handleMousedown(mde) {
		window.removeEventListener('keydown', handleKeydown, false);
		window.addEventListener('mouseup', function onMouseup(mue) {
			if (mue.button === mde.button) {
				window.addEventListener('keydown', handleKeydown, false);
				window.removeEventListener('mouseup', onMouseup, false);
			}
		}, false);
	}
	function okayToDoHotkey(e) {
		if (e.metaKey || e.ctrlKey)
			return true;
		var forbiddenTargets = ['INPUT','BUTTON','SELECT','TEXTAREA'];
		var elementIsForbidden = (forbiddenTargets.indexOf(e.target.nodeName) > -1);
		var elementIsEditable = e.target.isContentEditable;
		return !(elementIsForbidden || elementIsEditable);
	}
	function showRecents() {
		if (document.getElementById('cksto_recents')) {
			document.documentElement.removeChild(document.getElementById('cksto_recents'));
		}
		var recentsBox = document.createElement('iframe');
		recentsBox.id = 'cksto_recents';
		var recentsBoxStyle = 
			'position: fixed;' +
			'z-index: 2147483647;' + 
			'left: ' + ((window.innerWidth - 480) / 2) + 'px;' +
			'top: 48px;' +
			'width: 480px;' +
			'height: 480px;' +
			'opacity: 1;' +
			'border-style: none;' +
			'border-radius: 5px;' +
			'box-shadow: #222 0px 10px 32px';
		recentsBox.setAttribute('style', recentsBoxStyle);
		recentsBox.scrolling = 'no';
		recentsBox.src = safari.extension.baseURI + 'recents.html';
		document.documentElement.appendChild(recentsBox);
		recentsBox.focus();
		window.addEventListener('click', function requestClose(e) {
			var recentsBox = document.getElementById('cksto_recents');
			recentsBox && document.documentElement.removeChild(recentsBox);
			window.removeEventListener('click', requestClose, false);
		}, false);
	}
	
	if (window.scriptLoaded) {
		return;
	}
	var settings = {};
	// var keyListenerPaused = false;
	
	if (!window.name.match(/^cks/)) {
		safari.self.addEventListener('message', handleMessage, false);
		if (safari.self instanceof SafariContentReader) {
			setTimeout(function () {
				safari.self.tab.dispatchMessage('passSettings', ['cycleModifier', 'pauseKey']);
				safari.self.tab.dispatchMessage('passAllHotkeys');
			}, 500);
		} else {
			safari.self.tab.dispatchMessage('passSettings', ['cycleModifier', 'pauseKey']);
			safari.self.tab.dispatchMessage('passAllHotkeys');
		}
	}
	window.scriptLoaded = true;
})();
