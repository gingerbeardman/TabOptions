(function () {
	const MODIFIERS = ['altKey','ctrlKey','metaKey','shiftKey'];
	const KEYPROPS = ['keyCode'].concat(MODIFIERS);
	
	if (window.scriptLoaded) {
		return;
	}
	var settings = {};
	
	if (!/^cks/.test(window.name)) {
		safari.self.addEventListener('message', handleMessage, false);
		if (safari.self instanceof SafariContentReader) {
			setTimeout(function () {
				var props = ['cycleModifier', 'mapNumbersToTabs', 'mntModifiers', 'pauseKey'];
				safari.self.tab.dispatchMessage('passSettings', props);
				safari.self.tab.dispatchMessage('passAllHotkeys');
			}, 500);
		} else {
			var props = ['cycleModifier', 'mapNumbersToTabs', 'mntModifiers', 'pauseKey'];
			safari.self.tab.dispatchMessage('passSettings', props);
			safari.self.tab.dispatchMessage('passAllHotkeys');
		}
	}
	window.scriptLoaded = true;
	
	function getMatchingHotkeyAction(keyEvt) {
		var hotkeyMatchesEvent = function (prop) {
			return this[prop] == keyEvt[prop];
		}
		for (var hk, i = 0; i < hotkeys.length; i++) {
			hk = hotkeys[i];
			if (KEYPROPS.every(hotkeyMatchesEvent, hk)) {
				return { action: hk.action, params: null };
			}
		}
		if (settings.mapNumbersToTabs) {
			var code = keyEvt.keyCode;
			if (MODIFIERS.every(hotkeyMatchesEvent, settings.mntModifiers)) {
				if (code >= 48 && code <= 57) {
					return { action: 'nthTab', num: code - 49 }
				}
				else if (code >= 96 && code <= 105) {
					return { action: 'nthTab', num: code - 97 }
				}
			}
		}
		return null;
	}
	function handleKeydown(e) {
		if (!okayToDoHotkey(e))
			return;
		var match = getMatchingHotkeyAction(e);
		if (match) {
			e.preventDefault();
			e.stopPropagation();
			window.addEventListener('keypress', stopNextEvent, true);
			window.addEventListener('keyup', stopNextEvent, true);
			safari.self.tab.dispatchMessage('handleHotkey', {
				match : match,
				tv    : window.toolbar.visible,
				time  : event.timeStamp
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
				window.addEventListener('keydown', handleKeydown, true);
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
		var node = mde.target;
		if (node == document.documentElement) return;
		while (node.href == undefined && node.parentNode)
			node = node.parentNode;
		if (node.href) {
			safari.self.tab.dispatchMessage('linkClicked');
		}
		window.removeEventListener('keydown', handleKeydown, true);
		window.addEventListener('mouseup', function onMouseup(mue) {
			if (mue.button === mde.button) {
				window.addEventListener('keydown', handleKeydown, true);
				window.removeEventListener('mouseup', onMouseup, false);
			}
		}, false);
	}
	function okayToDoHotkey(e) {
		if ((e.metaKey || e.ctrlKey) && (e.keyCode < 37 || e.keyCode > 40))
			return true;
		if (['INPUT','BUTTON','SELECT','TEXTAREA'].indexOf(e.target.nodeName) > -1)
			return false;
		if (e.target.isContentEditable)
			return false;
		return true;
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
	function stopNextEvent(e) {
		e.preventDefault();
		e.stopPropagation();
		window.removeEventListener(e.type, stopNextEvent, true);
	}
})();
