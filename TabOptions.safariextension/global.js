const DEFAULTS = {
	actions: {
		newTab           : [{ keyCode: 84, keyIdentifier:'U+0054', altKey:0, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		newBgTab         : [{ keyCode: 84, keyIdentifier:'U+0054', altKey:0, ctrlKey:0, metaKey:0, shiftKey:1 }, {}, {}],
		nextTab          : [{ keyCode: 67, keyIdentifier:'U+0043', altKey:0, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		prevTab          : [{ keyCode: 88, keyIdentifier:'U+0058', altKey:0, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		toggleTab        : [{ keyCode: 90, keyIdentifier:'U+005A', altKey:0, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		cycleTabsFwd     : [{ keyCode:  9, keyIdentifier:'U+0009', altKey:1, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		cycleTabsRev     : [{ keyCode:  9, keyIdentifier:'U+0009', altKey:1, ctrlKey:0, metaKey:0, shiftKey:1 }, {}, {}],
		closeTab         : [{ keyCode: 87, keyIdentifier:'U+0057', altKey:0, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		closeLeftTabs    : [{ keyCode:188, keyIdentifier:'U+003C', altKey:0, ctrlKey:1, metaKey:0, shiftKey:1 }, {}, {}],
		closeRightTabs   : [{ keyCode:190, keyIdentifier:'U+003E', altKey:0, ctrlKey:1, metaKey:0, shiftKey:1 }, {}, {}],
		reopenTab        : [{ keyCode: 90, keyIdentifier:'U+005A', altKey:1, ctrlKey:0, metaKey:1, shiftKey:0 }, {}, {}],
		showRecentTabs   : [{ keyCode: 84, keyIdentifier:'U+0054', altKey:1, ctrlKey:1, metaKey:1, shiftKey:0 }, {}, {}],
		duplicateTab     : [{ keyCode: 84, keyIdentifier:'U+0054', altKey:1, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		reloadTab        : [{ keyCode: 82, keyIdentifier:'U+0052', altKey:0, ctrlKey:0, metaKey:0, shiftKey:1 }, {}, {}],
		moveTabRight     : [{ keyCode:190, keyIdentifier:'U+003E', altKey:0, ctrlKey:0, metaKey:0, shiftKey:1 }, {}, {}],
		moveTabLeft      : [{ keyCode:188, keyIdentifier:'U+003C', altKey:0, ctrlKey:0, metaKey:0, shiftKey:1 }, {}, {}],
		moveTabRightMost : [{ keyCode:190, keyIdentifier:'U+003E', altKey:1, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		moveTabLeftMost  : [{ keyCode:188, keyIdentifier:'U+003C', altKey:1, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		goBack           : [{ keyCode:  8, keyIdentifier:'U+0008', altKey:0, ctrlKey:0, metaKey:0, shiftKey:0 }, {}, {}],
		goForward        : [{ keyCode:  8, keyIdentifier:'U+0008', altKey:0, ctrlKey:0, metaKey:0, shiftKey:1 }, {}, {}],
		dupeBack         : [{ keyCode:  8, keyIdentifier:'U+0008', altKey:0, ctrlKey:0, metaKey:1, shiftKey:0 }, {}, {}],
		dupeBgBack       : [{ keyCode:  8, keyIdentifier:'U+0008', altKey:0, ctrlKey:0, metaKey:1, shiftKey:1 }, {}, {}],
		openSettings     : [{ keyCode:188, keyIdentifier:'U+003C', altKey:0, ctrlKey:0, metaKey:1, shiftKey:1 }, {}, {}]
	},
	newFgTabPosition : -1,
	newBgTabPosition : -1,
	focusTabOnClose  : -1,
	preserveLastTab  : 0,
	mapNumbersToTabs : true,
	mntModifiers     : { altKey:0, ctrlKey:1, metaKey:0, shiftKey:0 },
	blacklist        : [],
	homeUrl          : 'http://www.google.com/',
	backupSvc        : 'Delicious',
	pauseKey         : {
		keyCode       : 191,
		keyIdentifier : "U+002F",
		altKey        : false,
		ctrlKey       : false,
		metaKey       : false,
		shiftKey      : false
	}
};
const FRIENDLYNAMES = {
	newTab           : 'Open New Tab',
	newBgTab         : 'Open New Background Tab',
	nextTab          : 'Switch to Right Tab',
	prevTab          : 'Switch to Left Tab',
	toggleTab        : 'Switch to Last Active Tab',
	cycleTabsFwd     : 'Cycle Tabs Forward (in focus order)',
	cycleTabsRev     : 'Cycle Tabs Reverse (in focus order)',
	closeTab         : 'Close Tab',
	closeLeftTabs    : 'Close Tabs to Left',
	closeRightTabs   : 'Close Tabs to Right',
	reopenTab        : 'Reopen Closed Tabs (one by one)',
	showRecentTabs   : 'List Recently-Closed Tabs',
	duplicateTab     : 'Duplicate Tab',
	reloadTab        : 'Reload Tab',
	moveTabRight     : 'Move Tab Right',
	moveTabLeft      : 'Move Tab Left',
	moveTabRightMost : 'Move Tab Rightmost',
	moveTabLeftMost  : 'Move Tab Leftmost',
	goBack           : 'Go Back',
	goForward        : 'Go Forward',
	dupeBack         : 'Copy to New Tab & Go Back',
	dupeBgBack       : 'Copy to Background Tab & Go Back',
	openSettings     : 'Open Tab Options Settings'
};
const NEWTABNAVDELAY = 50;

var sa = safari.application;
var se = safari.extension;
var lastTabOpenTime = new Date();
var openTabs = []; // to keep Safari from GCing tab objects
var openWins = [];
var closedTabs = [];
var closedTabsWithImages = [];
var tabImages = {};
var winId = 0;
var tabId = 0;
var tabTimer = null;

initializeSettings();
deleteTabImages();

sa.addEventListener('activate', handleActivate, true);
sa.addEventListener('open', handleOpen, true);
sa.addEventListener('close', handleClose, true);
sa.addEventListener('command', handleCommand, false);
sa.addEventListener('message', handleMessage, false);
se.settings.addEventListener('change', handleSettingChange, false);
se.addContentScriptFromURL(se.baseURI + 'injected.js', ['safari-reader://*/*'], null, true);

setTimeout(function () { sa.browserWindows.forEach(handleOpenWin) }, 10);

function Place(hotkey, name, url, tidx) {
	this.hotkey = hotkey || {};
	this.name   = name   || '';
	this.url    = url    || '';
	this.tidx   = tidx   || 0;
}
function chainAllHotkeys() {
	var actionHotkeys = (function () {
		var aha = [];
		var actions = se.settings.actions;
		for (var name in actions) {
			for (var h, i = 0; i < actions[name].length; i++) {
				h = actions[name][i];
				if (h.keyCode) {
					h.action = name;
					aha.push(h);
				}
			}
		}
		return aha;
	})();
	var placesHotkeys = JSON.parse(localStorage.places).map(function (place, index) {
		var ph = place.hotkey;
		ph.action = index.toString();
		return ph;
	});
	return actionHotkeys.concat(placesHotkeys);
}
function deleteTabImages() {
	tabImages = {};
}
function doXHR(url, responseHandler) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = responseHandler || function () {
		if (this.readyState == 4) {
			console.log(this);
		}
	};
	xhr.open('GET', url, true);
	xhr.send(null);
}
function focusLastTab(i) {
	var tabTracker = sa.activeBrowserWindow.tabTracker;
	if (tabTracker.length > 1) {
		if (i == 0) {
			trackingPaused = true;
			tabTracker.push(tabTracker.shift());
			tabTracker[0].activate();
		} else
		if (i == -1) {
			trackingPaused = true;
			tabTracker.unshift(tabTracker.pop());
			tabTracker[0].activate();
		} else {
			i = i || 1;
			tabTracker[i].activate();
		}
	}
}
function focusTabOnClose() {
	var activeWindow = sa.activeBrowserWindow;
	var activeTabIndex = activeWindow.tabs.indexOf(activeWindow.activeTab);
	switch (se.settings.focusTabOnClose) {
		case 0:
			if (activeTabIndex == 0)
				activeWindow.tabs[0].activate();
			else {
				activeWindow.tabs[activeTabIndex - 1].activate();
			}
		break;
		case 1:
			if (activeTabIndex == activeWindow.tabs.length - 1)
				activeWindow.tabs[activeWindow.tabs.length - 1].activate();
			else {
				activeWindow.tabs[activeTabIndex].activate();
			}
		break;
		case 2:
			var tabTracker = activeWindow.tabTracker;
			tabTracker[0] && tabTracker[0].activate();
		break;
	}
}
function getDefaultPlaces(makeEmpty) {
	if (makeEmpty)
		return [new Place()];
	else
		return [new Place({
			which: 71,
			keyCode: 71,
			keyIdentifier: 'U+0047',
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: true			
		}, 'Google', 'http://www.google.com/', 1)];
}
function handleActivate(event) {
	if (window.trackingPaused) {
		trackingPaused = false;
		return;
	}
	if (!(event.target instanceof SafariBrowserTab))
		return;
	var thisWindow = event.target.browserWindow;
	var tabTracker = thisWindow.tabTracker;
	var lati = tabTracker.indexOf(event.target);
	if (lati > -1)
		tabTracker.splice(lati, 1);
	tabTracker.unshift(event.target);
	if (tabTracker.length > 100) {
		tabTracker.pop();
	}
}
function handleClose(event) {
	if (event.target instanceof SafariBrowserTab) {
		var thisTab = event.target;
		var thisWindow = thisTab.browserWindow;
		var tabRec = {
			id    : thisTab.id,
			title : thisTab.title,
			url   : thisTab.url,
			index : thisWindow.tabs.indexOf(thisTab)
		};
		openTabs.splice(openTabs.indexOf(thisTab), 1);
		var tabTracker = thisWindow.tabTracker;
		var lati = tabTracker.indexOf(thisTab);
		if (lati > -1) {
			tabTracker.splice(lati, 1);
		}
		if (thisTab == sa.activeBrowserWindow.activeTab) {
			focusTabOnClose();
		}
		closedTabs.push(tabRec);
		if (closedTabs.length > 1024) {
			closedTabs.shift();
		}
		var tabRec2 = JSON.parse(JSON.stringify(tabRec));
		tabRec2.image = thisTab.imageUrl;
		closedTabsWithImages.unshift(tabRec2);
		if (closedTabsWithImages.length > 9) {
			closedTabsWithImages.pop();
		}
	} else 
	if (event.target instanceof SafariBrowserWindow) {
		openWins.splice(openWins.indexOf(event.target), 1);
	}
}
function handleCommand(event) {
	if (event.command == 'openSettings') {
		setTimeout(function () {
			sa.activeBrowserWindow.openTab('foreground').url = se.baseURI + 'settings.html';
		}, NEWTABNAVDELAY);
	} else
	if (event.command == 'listRecentTabs') {
		sa.activeBrowserWindow.openTab().url = se.baseURI + 'recents.html';
	}
}
function handleHotkey(match, toolbarVisible, srcTab) {
	var action = match.action;
	var thisWindow = sa.activeBrowserWindow;
	var thisTab = thisWindow.activeTab;
	var thisTabIndex = thisWindow.tabs.indexOf(thisTab);
	var ntp = (action == 'newBgTab') ? se.settings.newBgTabPosition : se.settings.newFgTabPosition;
	var newTabIndex = 
		(ntp == 0) ? thisTabIndex           :
		(ntp == 1) ? thisTabIndex + 1       :
		(ntp == 2) ? thisWindow.tabs.length :
		(ntp == 3) ? 0                      : undefined;
	switch (action) {
		case 'newTab':
			thisWindow.openTab('foreground', newTabIndex);
			break;
		case 'newBgTab':
			thisWindow.openTab('background', newTabIndex);
			break;
		case 'nextTab':
			var nextTab = thisWindow.tabs[thisTabIndex + 1];
			if (!nextTab)
				nextTab = thisWindow.tabs[0];
			nextTab.activate();
			break;
		case 'prevTab':
			var prevTab = thisWindow.tabs[thisTabIndex - 1];
			if (!prevTab)
				prevTab = thisWindow.tabs[thisWindow.tabs.length - 1];
			prevTab.activate();
			break;
		case 'nthTab':
			var tabNum = match.num;
			if (tabNum == -1)
				tabNum = 9;
			thisWindow.tabs[tabNum] && thisWindow.tabs[tabNum].activate();
			break;
		case 'toggleTab':
			focusLastTab(1);
			break;
		case 'cycleTabsFwd':
			focusLastTab(0);
			break;
		case 'cycleTabsRev':
			focusLastTab(-1);
			break;
		case 'closeTab':
			if (sa.activeBrowserWindow.tabs.length == 1 && se.settings.preserveLastTab && toolbarVisible) {
				thisTab.url = (se.settings.preserveLastTab == 2) ? se.settings.homeUrl : 'about:blank';
				break;
			}
			thisTab.close();
			if (!window.SafariCloseEvent)
				focusTabOnClose();
			break;
		case 'closeLeftTabs':
			var tabs = sa.activeBrowserWindow.tabs;
			var ai = tabs.indexOf(sa.activeBrowserWindow.activeTab);
			for (var i = 0; i < ai; i++)
				tabs[i].close();
			break;
		case 'closeRightTabs':
			var tabs = sa.activeBrowserWindow.tabs;
			var ai = tabs.indexOf(sa.activeBrowserWindow.activeTab);
			for (var i = ai + 1; i < tabs.length; i++)
				tabs[i].close();
			break;
		case 'reopenTab':
			if (closedTabs.length) {
				var tab = closedTabs.pop();
				tab.url && (thisWindow.openTab('foreground', tab.index).url = tab.url);
				for (var i = 0; i < closedTabsWithImages.length; i++) {
					if (closedTabsWithImages[i] == tab.id) {
						closedTabsWithImages.splice(i, 1);
						break;
					}
				}
			}
			break;
		case 'showRecentTabs':
			sa.activeBrowserWindow.openTab().url = se.baseURI + 'recents.html';
			break;
		case 'duplicateTab':
			var newTab = thisWindow.openTab('foreground', newTabIndex);
			setTimeout(function () {
				newTab.url = srcTab.url;
			}, NEWTABNAVDELAY);
			break;
		case 'reloadTab':
			srcTab.page.dispatchMessage('reload');
			break;
		case 'moveTabRight':
			if (thisTabIndex === thisWindow.tabs.length - 1)
				thisWindow.insertTab(thisTab, 0);
			else
				thisWindow.insertTab(thisTab, thisTabIndex + 2);
			break;
		case 'moveTabLeft':
			if (thisTabIndex === 0)
				thisWindow.insertTab(thisTab, thisWindow.tabs.length);
			else
				thisWindow.insertTab(thisTab, thisTabIndex - 1);
			break;
		case 'moveTabRightMost':
			thisWindow.insertTab(thisTab, thisWindow.tabs.length);
			break;
		case 'moveTabLeftMost':
			thisWindow.insertTab(thisTab, 0);
			break;
		case 'goBack':
			srcTab.page.dispatchMessage('goBack');
			break;
		case 'goForward':
			srcTab.page.dispatchMessage('goForward');
			break;
		case 'dupeBack':
			var newTab = thisWindow.openTab('foreground', newTabIndex);
			setTimeout(function () {
				newTab.url = srcTab.url;
				srcTab.page.dispatchMessage('goBack');
			}, NEWTABNAVDELAY);
			break;
		case 'dupeBgBack':
			var newTab = thisWindow.openTab('background', newTabIndex);
			setTimeout(function () {
				newTab.url = srcTab.url;
				srcTab.page.dispatchMessage('goBack');
			}, NEWTABNAVDELAY);
			break;
		case 'openSettings':
			var newTab = thisWindow.openTab('foreground', newTabIndex);
			setTimeout(function () {
				newTab.url = se.baseURI + 'settings.html';
			}, NEWTABNAVDELAY);
			break;
		default:
			var places = JSON.parse(localStorage.places);
			var url  = places[action].url;
			var tidx = places[action].tidx;
			if (url.indexOf('javascript') === 0)
				srcTab.page.dispatchMessage('loadUrl', url);
			else {
				switch(tidx) {
					case 0:
						var target = thisTab;
						break;
					case undefined:
					case 1:
						if ((thisTab.url == '' || thisTab.url == 'about:blank') && url !== 'about:blank')
							var target = thisTab;
						else
							var target = thisWindow.openTab('foreground', newTabIndex);
						break;
					case 2:
						var target = sa.openBrowserWindow().activeTab;
						break;
					default: break;
				}
				setTimeout(function () {
					target.url = url;
				}, NEWTABNAVDELAY);
			}
		break;
	}
}
function handleMessage(event) {
	// console.log('message "' + event.name + '" from:', event.target);
	var listener = (event.target instanceof SafariReader) ? event.target : event.target.page;
	if (!listener) return;
	switch (event.name) {
		case 'handleHotkey':
			event.target.eventTime = event.target.eventTime || 0;
			if (event.message.time > event.target.eventTime) {
				handleHotkey(event.message.match, event.message.tv, event.target);
				event.target.eventTime = event.message.time;
			} 
			break;
		case 'reopenClosedTab':
			var tabIdMatches = function (tab) { return tab.id == this.message };
			var closedTab = closedTabs.filter(tabIdMatches, event)[0];
			closedTab && closedTabs.splice(closedTabs.indexOf(closedTab), 1);
			closedTab.url && (sa.activeBrowserWindow.openTab('background', closedTab.index).url = closedTab.url);
			var closedTab2 = closedTabsWithImages.filter(tabIdMatches, event);
			closedTab2 && closedTabsWithImages.splice(closedTabsWithImages.indexOf(closedTab2), 1);
			break;
		case 'reopenClosedTabsWithIndexes':
			var indexes = event.message;
			console.log('indexes:', indexes);
			break;
		case 'closeRecentsList':
			listener.dispatchMessage('closeRecents');
			break;
		case 'passBlackList':
			listener.dispatchMessage('receiveBlackList', se.settings.blacklist);
			break;
		case 'passAllHotkeys':
			var blacklisted = se.settings.blacklist.some(function (pattern) {
				return (new RegExp(pattern)).test(event.target.url);
			});
			!blacklisted && listener.dispatchMessage('receiveAllHotkeys', chainAllHotkeys());
			break;
		case 'passRecents':
			listener.dispatchMessage('receiveRecents', closedTabsWithImages);
			break;
		case 'startScriptLoaded':
			// event.target.startUrl = event.message;
			break;
		case 'passSettings':
			if (event.message) {
				var response = {};
				event.message.forEach(function (key) {
					response[key] = se.settings[key];
				});
				listener.dispatchMessage('receiveSettings', response);
			} else {
				listener.dispatchMessage('receiveSettings', se.settings);
			}
			break;
		case 'passSetting':
			var message = { key: event.message, value: se.settings[event.message] };
			listener.dispatchMessage('receiveSetting', message);
			break;
		case 'saveSetting':
			se.settings[event.message.key] = event.message.value;
			if (event.message.key == 'mapNumbersToTabs' || event.message.key == 'mntModifiers')
				passSettingsToAllPages([event.message.key]);
			break;
		case 'passActionNames':
			listener.dispatchMessage('receiveActionNames', FRIENDLYNAMES);
			break;
		case 'passActions':
			listener.dispatchMessage('receiveActions', se.settings.actions);
			break;
		case 'saveHotkey':
			var mm = event.message;
			var actions = se.settings.actions;
			actions[mm.a][mm.i] = mm.h;
			se.settings.actions = actions;
			passHotkeysToAllPages();
			break;
		case 'resetHotkey':
			var hid = event.message;
			var actions = se.settings.actions;
			actions[hid] = DEFAULTS.actions[hid];
			se.settings.actions = actions;
			passHotkeysToAllPages();
			listener.dispatchMessage('receiveActions', actions);
			break;
		case 'passPlaces':
			listener.dispatchMessage('receivePlaces', JSON.parse(localStorage.places));
			break;
		case 'savePlace':
			var index = event.message.index;
			var placeData = event.message.placeData;
			var places = JSON.parse(localStorage.places);
			if (!places[index])
				places[index] = new Place();
			places[index].name = placeData.name;
			places[index].url  = placeData.url;
			places[index].tidx = placeData.tidx;
			localStorage.places = JSON.stringify(places);
			passHotkeysToAllPages();
			listener.dispatchMessage('receivePlaces', places);
			break;
		case 'savePlaceHotkey':
			var mm = event.message;
			var places = JSON.parse(localStorage.places);
			if (!places[mm.i])
				places[mm.i] = new Place();
			places[mm.i].hotkey = mm.h;
			localStorage.places = JSON.stringify(places);
			passHotkeysToAllPages();
			break;
		case 'removePlace':
			var places = JSON.parse(localStorage.places);
			var index = event.message;
			if (index === 0 && places.length === 1)
				places[index] = new Place();
			else
				places.splice(index, 1);
			localStorage.places = JSON.stringify(places);
			passHotkeysToAllPages();
			listener.dispatchMessage('receivePlaces', places);
			break;
		case 'removeAllPlaces':
			localStorage.places = JSON.stringify(getDefaultPlaces(true));
			listener.dispatchMessage('receivePlaces', JSON.parse(localStorage.places));
			passHotkeysToAllPages();
			break;
		case 'sortPlacesBy':
			var places = sortPlacesBy(JSON.parse(localStorage.places), event.message);
			localStorage.places = JSON.stringify(places);
			passHotkeysToAllPages();
			listener.dispatchMessage('receivePlaces', places);
			break;
		case 'pbExportPlaces':
			pbPrimeForExport(event.target);
			break;
		case 'pbImportPlaces':
			pbImportPlaces(event.target);
			break;
		case 'saveBlackList':
			se.settings.blacklist = event.message;
		break;
	}
}
function handleNavigate(event) {
	event.target.visibleContentsAsDataURL(function (dataUrl) {
		event.target.imageUrl = dataUrl;
	});
}
function handleOpen(event) {
	if (event.target instanceof SafariBrowserWindow && !tabTimer) {
		handleOpenWin(event.target);
	} else
	if (event.target instanceof SafariBrowserTab) {
		handleOpenTab(event.target);
	}
}
function handleOpenTab(tab) {
	clearTimeout(tabTimer);
	tabTimer = setTimeout(function () { tabTimer = null }, 99);
	tab.id = tabId++;
	openTabs.push(tab);
	tab.addEventListener('navigate', handleNavigate, false);
	if (new Date() - lastTabOpenTime >= 100)
		moveTabIntoPosition(tab);
	return tab;
}
function handleOpenWin(win) {
	openWins.push(win);
	win.tabTracker = win.tabs.map(handleOpenTab);
}
function handleSettingChange(event) {
	if (event.newValue !== event.oldValue) {
		if (event.key == 'settingsOpener') {
			sa.openBrowserWindow().activeTab.url = se.baseURI + 'settings.html';
		}
	}
}
function listRecentTabImages() {
	for (var key in tabImages) {
		console.log(key + ' (' + tabImages[key].length/1024 + 'K):', tabImages[key].slice(0, 80));
	}
}
function moveTabIntoPosition(tab) {
	lastTabOpenTime = new Date();
	var ntp = (tab == sa.activeBrowserWindow.activeTab) ? se.settings.newFgTabPosition : se.settings.newBgTabPosition;
	if (ntp == -1) 
		return;
	var thisWindow = tab.browserWindow;
	var thisTabIndex = thisWindow.tabs.indexOf(tab);
	var lastActiveTab = thisWindow.tabTracker[0];
	if (!lastActiveTab) 
		return;
	var lastActiveTabIndex = thisWindow.tabs.indexOf(lastActiveTab);
	if (lastActiveTabIndex == -1) 
		return;
	var newTabIndex = 
		ntp == 3 ? 0 : 
		ntp == 2 ? thisWindow.tabs.length  
		         : lastActiveTabIndex + ntp;
	if (newTabIndex == thisTabIndex) 
		return;
	thisWindow.insertTab(tab, newTabIndex);
}
function passHotkeysToAllPages() {
	for (var i = 0; i < sa.browserWindows.length; i++) {
		var thisWindow = sa.browserWindows[i];
		for (var j = 0; j < thisWindow.tabs.length; j++) {
			var thisTab = thisWindow.tabs[j];
			if (thisTab.page !== undefined) {
				thisTab.page.dispatchMessage('receiveAllHotkeys', chainAllHotkeys());
			}
		}
	}
}
function passSettingsToAllPages(keys) {
	var i, message = {};
	for (i = 0; i < keys.length; i++) {
		message[keys[i]] = se.settings[keys[i]];
	}
	for (i in sa.browserWindows) {
		var thisWindow = sa.browserWindows[i];
		for (var j in thisWindow.tabs) {
			var thisTab = thisWindow.tabs[j];
			if (/^http/.test(thisTab.url) || thisTab.url == 'about:blank') {
				thisTab.page.dispatchMessage('receiveSettings', message);
			}
		}
	}
}
function pbExportPlaces(target) {
	var baseUrl = (function () {
		switch (se.settings.backupSvc) {
			case 'Delicious': return 'https://api.del.icio.us/v1/posts/add';
			case 'Pinboard' : return 'https://api.pinboard.in/v1/posts/add';
		}
	})();
	var places = JSON.parse(localStorage.places);
	var responseHandler = function () {
		if (this.readyState == 4) {
			if (this.status == 200) {
				exportCount++;
				if (target && exportCount == places.length) {
					target.page.dispatchMessage('exImResult','success');
				}
			} else {
				if (target)
					target.page.dispatchMessage('exImResult','failure');
				var notice = 'Tab Options experienced an error trying to communicate with '
					+ se.settings.backupSvc + '. Please try again later.';
				alert(notice);
			}
		}
	};
	var svcUrl, extendedContent;
	exportCount = 0;
	places.forEach(function (place) {
		extendedContent = JSON.stringify({
			hotkey : place.hotkey,
			tidx   : place.tidx
		});
		svcUrl = baseUrl + '?url=' + encodeURIComponent(place.url);
		svcUrl += '&description=' + encodeURIComponent(place.name);
		svcUrl += '&extended=' + encodeURIComponent(extendedContent);
		svcUrl += '&tags=Tabkeys,NoMoof&replace=yes&shared=no';
		doXHR(svcUrl, responseHandler);
	});
}
function pbImportPlaces(target) {
	var svcUrl = (function () {
		switch (se.settings.backupSvc) {
			case 'Delicious': return 'https://api.del.icio.us/v1/posts/all?&tag=Tabkeys';
			case 'Pinboard' : return 'https://api.pinboard.in/v1/posts/all?&tag=Tabkeys';
		}
	})();
	doXHR(svcUrl, function () {
		if (this.readyState == 4) {
			if (this.status == 200) {
				var posts = this.responseXML.getElementsByTagName('post');
				if (posts.length > 0) {
					var localPlaces = JSON.parse(localStorage.places);
					var hkProps = ['keyCode','altKey','ctrlKey','metaKey','shiftKey'];
					for (var i = 0; i < posts.length; i++) {
						var importedName = posts[i].getAttribute('description');
						var importedUrl = posts[i].getAttribute('href');
						try {
							var importedProps = JSON.parse(posts[i].getAttribute('extended'));
						} catch(e) {
							var importedProps = null;
						}
						if (importedProps) {
							var importedTidx = importedProps.tidx || 0;
							var importedHotkey = importedProps.hotkey || {};
							if (!importedHotkey.keyCode)
								importedHotkey = {};
							console.log(importedName, importedUrl, importedHotkey);
							var localPlace, hotkeysMatch, matchFound = false;
							for (var j = 0; j < localPlaces.length; j++) {
								localPlace = localPlaces[j];
								if (localPlace.url == importedUrl && localPlace.tidx == importedTidx) {
									localPlace = new Place(importedHotkey, importedName, importedUrl, importedTidx);
									matchFound = true;
									break;
								}
							}
							if (!matchFound) {
								localPlaces.push(new Place(importedHotkey, importedName, importedUrl, importedTidx));
							}
						}
					}
					localStorage.places = JSON.stringify(localPlaces);
					if (target) {
						target.page.dispatchMessage('receivePlaces', localPlaces);
						target.page.dispatchMessage('exImResult','success');
					}
				} else {
					target.page.dispatchMessage('exImResult','nonefound');
				}
			} else {
				if (target)
					target.page.dispatchMessage('exImResult','failure');
				var notice = 'Tab Options experienced an error trying to communicate with ';
				   notice += 'the bookmarking service. Please try again later.';
				alert(notice);
			}
		}
	});
}
function pbPrimeForExport(target) {
	var svcUrl = (function () {
		switch (se.settings.backupSvc) {
			case 'Delicious': return 'https://api.del.icio.us/v1/posts/update';
			case 'Pinboard' : return 'https://api.pinboard.in/v1/posts/update';
		}
	})();
	if (target)
		target.page.dispatchMessage('exImResult','exporting');
	doXHR(svcUrl, function () {
		if (this.readyState == 4) {
			if (this.status == 200) {
				pbExportPlaces(target);
			} else {
				if (target)
					target.page.dispatchMessage('exImResult','failure');
				var notice = 'Tab Options could not log in to your Delicious or Pinboard account. ';
				   notice += 'Please check your username and password.';
				alert(notice);
			}
		}
	});
}
function sortPlacesBy(places, key) {
	places.sort(function (a,b) {
		var aProp = (key == 'hotkey') ? a[key][0].c.toLowerCase() : a[key].toLowerCase();
		var bProp = (key == 'hotkey') ? b[key][0].c.toLowerCase() : b[key].toLowerCase();
		if (aProp < bProp)
			return -1;
		if (aProp > bProp)
			return 1;
		return 0;
	});
	return places;
}
function initializeSettings() {
	var lastVersion = se.settings.lastVersion;
	for (var key in DEFAULTS) {
		if (!(key in se.settings)) {
			se.settings[key] = DEFAULTS[key];
		}
	}
	if (!localStorage.places)
		localStorage.places = JSON.stringify(getDefaultPlaces(false));
	if (!lastVersion) {
		if (sa.activeBrowserWindow.activeTab.url) {
			sa.activeBrowserWindow.activeTab.url = sa.activeBrowserWindow.activeTab.url;
		}
	} else {
		if (lastVersion < 1023) {
			try {
				var places = JSON.parse(localStorage.places);
				var newPlaces = places.forEach(function (place) {
					place.hotkey = {};
				});
				localStorage.places = JSON.stringify(places);
			} catch(e) {
				localStorage.places = JSON.stringify(getDefaultPlaces(false));
			}
			alert(
				'Tab Options Safari Extension has been updated.\n\n' + 
				'Due to major internal changes, all hotkeys have been reset to defaults. ' + 
				'The developer apologizes for the inconvenience.'
			);
		}
		if (lastVersion < 1030) {
			var actions = se.settings.actions;
			actions.toggleTab = DEFAULTS.actions.toggleTab;
			actions.cycleTabsFwd = DEFAULTS.actions.cycleTabsFwd;
			actions.cycleTabsRev = DEFAULTS.actions.cycleTabsRev;
			se.settings.actions = actions;
			if (se.settings.focusTabOnClose == 0)
				se.settings.focusTabOnClose = -1; else
			if (se.settings.focusTabOnClose == -1)
				se.settings.focusTabOnClose = 0;
			se.settings.newFgTabPosition = se.settings.newTabPosition;
			delete se.settings.newTabPosition;
		}
		if (lastVersion < 1034) {
			var actions = se.settings.actions;
			actions.closeLeftTabs = DEFAULTS.actions.closeLeftTabs;
			actions.closeRightTabs = DEFAULTS.actions.closeRightTabs;
			se.settings.actions = actions;
		}
		if (lastVersion < 1037) {
			var actions = se.settings.actions;
			actions.reopenTab = DEFAULTS.actions.reopenTab;
			actions.showRecentTabs = DEFAULTS.actions.showRecentTabs;
			se.settings.actions = actions;
		}
	}
	se.settings.lastVersion = 1045;
}
