function addInputEventListeners() {
	var hkInputBoxes = document.getElementsByClassName('hkInput');
	for (var hkib, i = 0; i < hkInputBoxes.length; i++) {
		hkib = hkInputBoxes[i];
		hkib.addEventListener('focus', handleHotKeyFocus);
		hkib.addEventListener('blur', handleHotKeyBlur);
		hkib.addEventListener('keydown', handleHotKeyDown);
		hkib.parentNode.addEventListener('mouseover', handleHotKeyMouseOver);
		hkib.parentNode.addEventListener('mouseout', handleHotKeyMouseOut);
	}
	var cButtons = document.getElementsByClassName('cButton');
	for (var j = 0; j < cButtons.length; j++) {
		cButtons[j].addEventListener('click', clearHotkey);
	}
	var sButtons = document.getElementsByClassName('sButton');
	for (var k = 0; k < sButtons.length; k++) {
		sButtons[k].addEventListener('click', resetHotkeys);
	}
}
function addNewPlaceForm() {
	var placesTable = document.getElementById('placesTable');
	var idx = placesTable.childNodes.length;
	var newPlaceForm = addPlaceForm({ hotkey: {}, name: '', url: '', tidx: 1}, idx);
	placesTable.appendChild(newPlaceForm);
	newPlaceForm.childNodes[0].focus();
}
function addPlaceForm(place) {
	console.log('Place:', place);
	var newPlaceForm = document.createElement('form');
	newPlaceForm.className = 'placeForm';
	newPlaceForm.onsubmit= handleFormSubmit;
	
	var thisThing;
	
	thisThing = document.createElement('input');
	thisThing.name = 'hkInput';
	thisThing.type = 'text';
	thisThing.className = 'textInput phkInput';
	thisThing.onfocus = handleHotKeyFocus;
	thisThing.onkeydown = handleHotKeyDown;
	thisThing.value = getHotkeyInputValue(place.hotkey);
	thisThing.title = thisThing.value;
	newPlaceForm.appendChild(thisThing);
	
	thisThing = document.createElement('input');
	thisThing.name = 'nameInput';
	thisThing.type = 'text';
	thisThing.className = 'textInput nameInput';
	thisThing.onfocus = handleInputFocus;
	thisThing.onblur = handleInputBlur;
	thisThing.onkeydown = handleInputKeyDown;
	thisThing.value = place.name;
	thisThing.title = thisThing.value;
	newPlaceForm.appendChild(thisThing);
	
	thisThing = document.createElement('input');
	thisThing.name = 'urlInput';
	thisThing.type = 'text';
	thisThing.className = 'textInput urlInput';
	thisThing.onfocus = handleInputFocus;
	thisThing.onblur = handleInputBlur;
	thisThing.onkeydown = handleInputKeyDown;
	thisThing.value = place.url;
	thisThing.title = thisThing.value;
	newPlaceForm.appendChild(thisThing);
	
	thisThing = document.createElement('input');
	thisThing.name = 'targInput';
	thisThing.type = 'checkbox';
	thisThing.className = 'targInput';
	thisThing.onchange = handleCheckboxChange;
	thisThing.defaultChecked = place.tidx;
	thisThing.checked = thisThing.defaultChecked;
	newPlaceForm.appendChild(thisThing);
	
	thisThing = document.createElement('button');
	thisThing.name = 'saveButton';
	thisThing.type = 'submit';
	thisThing.className = 'sButton saveButton';
	thisThing.innerHTML = 'Save';
	thisThing.disabled = true;
	newPlaceForm.appendChild(thisThing);
	
	thisThing = document.createElement('button');
	thisThing.name = 'cancelButton';
	thisThing.type = 'button';
	thisThing.className = 'sButton cancelButton';
	thisThing.innerHTML = 'Cancel';
	thisThing.disabled = true;
	thisThing.onclick = handleInputCancel;
	newPlaceForm.appendChild(thisThing);
	
	thisThing = document.createElement('button');
	thisThing.name = 'removeButton';
	thisThing.type = 'button';
	thisThing.className = 'sButton removeButton';
	thisThing.innerHTML = 'Remove';
	thisThing.onclick = removePlace;
	newPlaceForm.appendChild(thisThing);
	
	return newPlaceForm;
}
function cancelPlaceEdits() {
	editBox.value = editBox.title;
	cancelButton.disabled = true;
	saveButton.disabled = true;
	saveButton.removeAttribute('style');
}
function cleanUpValue(string) {
	while (string.indexOf('\n\n') > -1)
		string = string.replace(/\n\n/g,'\n');
	string = string.replace(/^\n/,'');
	if (string[string.length-1] == '\n')
		string = string.slice(0,string.length-1)
	return string;
}
function clearHotkey(e) {
	var message = {
		a : e.currentTarget.parentNode.parentNode.id, 
		i : e.currentTarget.parentNode.getAttribute('index'),
		h : {}
	};
	safari.self.tab.dispatchMessage('saveHotkey', message);
	e.currentTarget.previousElementSibling.value = '';
	writeStatus(message.a, 'Hotkey cleared.');
}
function createExImPIBox() {
	exImPIBox = document.createElement('div');
	exImPIBox.remove = function () {
		document.body.removeChild(document.getElementById('exImPIBox'));
		exImPIBox = null;
	};
	exImPIBox.w = 96;
	exImPIBox.h = 72;
	exImPIBox.id = 'exImPIBox';
	exImPIBox.style.position = 'fixed';
	exImPIBox.style.left = document.body.clientWidth/2  - exImPIBox.w/2 + 'px';
	exImPIBox.style.top  = window.innerHeight/2 - exImPIBox.h/2 + 'px';
	exImPIBox.style.width = exImPIBox.w + 'px';
	exImPIBox.style.height = exImPIBox.h + 'px';
	
	var exImPIIcon = document.createElement('img');
	exImPIIcon.id = 'exImPIIcon';
	exImPIIcon.style.left = exImPIBox.w/2 - 16 + 'px';
	exImPIBox.appendChild(exImPIIcon);
	
	var exImPIText = document.createElement('span');
	exImPIText.id = 'exImPIText';
	exImPIBox.appendChild(exImPIText);
	
	document.body.appendChild(exImPIBox);
}
function getHotkeyInputValue(hotkey) {
	if (!hotkey || !hotkey.keyCode)
		return '';
	var mStr = '';
	if (hotkey.ctrlKey)  mStr += '⌃';
	if (hotkey.altKey)   mStr += '⌥';
	if (hotkey.shiftKey) mStr += '⇧';
	if (hotkey.metaKey)  mStr += '⌘';
	var cStr = 
		(hotkey.keyCode ==  8) ? 'Delete' :
		(hotkey.keyCode ==  9) ? 'Tab'    :
		(hotkey.keyCode == 32) ? 'Space'  :
		(hotkey.keyCode == 46) ? 'Del'    :
		String.fromCharCode(hotkey.keyCode);
	if (!/[0-9A-Z]/.test(cStr))
		cStr = String.fromCharCode(parseInt(hotkey.keyIdentifier.slice(2), 16));
	return mStr + cStr;
}
function getPlaceIndex(thisForm) {
	var allForms = thisForm.parentNode.childNodes;
	var formIndex = 0;
	for (var i = 0; i < allForms.length; i++) {
		if (thisForm === allForms[i]) {
			formIndex = i;
			break;
		}
	}
	return formIndex;
}
function getRadioValue(name) {
	var inputs = document.querySelectorAll('input[name="'+ name +'"]');
	return [].slice.call(inputs).filter(function (i) { return i.checked })[0].value;
}
function handleCheckboxChange(e) {
	var thisForm = e.target.parentNode;
	var saveButton   = thisForm.getElementsByTagName('button')[0];
	var cancelButton = thisForm.getElementsByTagName('button')[1];
	if (e.target.checked === e.target.defaultChecked) {
		saveButton.disabled = true;
		cancelButton.disabled = true;
	} else {
		saveButton.disabled = false;
		cancelButton.disabled = false;
	}
}
function handleEditBoxBlur() {
	if ( event.target.value === event.target.title ) 
	{
		saveButton.disabled = true;
		saveButton.removeAttribute('style');
		cancelButton.disabled = true; 
	}
	else {
		saveButton.style.color = 'red';
	}
}
function handleEditBoxKeyDown() {
	switch (event.which)
	{
		case 27: event.target.blur(); break;
		case 8: 
		case 46: handleEditBoxKeyPress(); break;
	}
}
function handleEditBoxKeyPress() {
	saveButton.disabled = false;
	cancelButton.disabled = false;
}
function handleFormSubmit(e) {
	e.preventDefault();
	var nameInput    = e.target.getElementsByTagName('input')[1];
	var urlInput     = e.target.getElementsByTagName('input')[2];
	var targInput    = e.target.getElementsByTagName('input')[3];
	var saveButton   = e.target.getElementsByTagName('button')[0];
	var cancelButton = e.target.getElementsByTagName('button')[1];
	var newName = nameInput.value;
	var oldName = nameInput.title;
	var newUrl  = urlInput.value;
	var oldUrl  = urlInput.title;
	var newTidx = targInput.checked?1:0;
	var oldTidx = targInput.defaultChecked?1:0;
	
	if (newUrl === '') {
		alert('Please enter a URL for this place.');
		urlInput.focus();
	} else if (newName === oldName && newUrl === oldUrl && newTidx === oldTidx) {
		alert('No change.');
	} else {
		saveButton.removeAttribute('style');
		var placeIndex = getPlaceIndex(e.target);
		var placeData = {name: newName, url: newUrl, tidx: newTidx};
		var message = {index: placeIndex, placeData: placeData};
		safari.self.tab.dispatchMessage('savePlace', message);
		saveButton.disabled = true;
		saveButton.removeAttribute('style');
		cancelButton.disabled = true;
		nameInput.title = newName;
		urlInput.title   = newUrl;
		targInput.defaultChecked = targInput.checked;
	}
}
function handleHotKeyDown(e) {
	e.stopPropagation();
	switch (e.keyCode) {
		case  9:	// tab
			if (e.ctrlKey || e.altKey) {
				e.preventDefault();
				if (e.target.name == 'hkInput') {
					savePlaceHotkey(e);
				} else {
					saveHotkey(e);
				}
			}
		break;
		case 27:	// escape
			e.target.blur();
		break;
		case 37:	// left
		case 38:	// up
		case 39:	// right
		case 40:	// down
			e.preventDefault();
		break;
		case 16:	// shift
		case 17:	// ctrl
		case 18:	// option
		case 91:	// command-left
		case 93:	// command-right
		break;
		default:
			e.preventDefault();
			if (e.target.name == 'hkInput') {
				savePlaceHotkey(e);
			} else {
				saveHotkey(e);
			}
		break;
	}
}
function handleHotKeyBlur(e) {
	e.target.style.zIndex = '';
}
function handleHotKeyFocus(e) {
	e.target.style.zIndex = '20';
	setTimeout(function () {
		e.target.select();
	}, 10);
}
function handleHotKeyMouseOver(e) {
	if (e.currentTarget.querySelector('.hkInput').value)
		e.currentTarget.querySelector('.cButton').style.visibility = 'visible';
}
function handleHotKeyMouseOut(e) {
	e.currentTarget.querySelector('.cButton').style.visibility = '';
}
function handleInputBlur(e) {
	var thisForm = e.target.parentNode;
	var nameInput    = thisForm.getElementsByTagName('input')[1];
	var urlInput     = thisForm.getElementsByTagName('input')[2];
	var saveButton   = thisForm.getElementsByTagName('button')[0];
	var cancelButton = thisForm.getElementsByTagName('button')[1];
	if ( nameInput.value === nameInput.title && urlInput.value  === urlInput.title ) {
		saveButton.disabled = true;
		saveButton.removeAttribute('style');
		cancelButton.disabled = true; 
	} else {
		saveButton.style.color = 'red';
	}
}
function handleInputCancel(e) {
	var thisForm = e.target.parentNode;
	var nameInput  = thisForm.getElementsByTagName('input')[1];
	var urlInput   = thisForm.getElementsByTagName('input')[2];
	var targInput  = thisForm.getElementsByTagName('input')[3];
	var saveButton = thisForm.getElementsByTagName('button')[0];
	nameInput.value = nameInput.title;
	urlInput.value = urlInput.title;
	targInput.checked = targInput.defaultChecked;
	e.target.blur();
	e.target.disabled = true;
	saveButton.disabled = true;
	saveButton.removeAttribute('style');
}
function handleInputFocus(e) {
	var thisForm = e.target.parentNode;
	var saveButton   = thisForm.getElementsByTagName('button')[0];
	var cancelButton = thisForm.getElementsByTagName('button')[1];
	saveButton.disabled = false;
	cancelButton.disabled = false;
	e.target.select();
}
function handleInputKeyDown(e) {
	if (e.which === 27) e.target.blur();
}
function handleMessage(msg) {
	switch (msg.name) {
		case 'receiveActionNames':
			console.log('Action names:', msg.message);
			insertHotkeyForms(msg.message)
			safari.self.tab.dispatchMessage('passActions');
		break;
		case 'receiveActions':
			console.log('Actions:', msg.message);
			populateHotkeyInputs(msg.message);
		break;
		case 'receivePlaces':
			var places = msg.message;
			var placesDiv = document.getElementById('placesDiv');
			var placesTable = document.getElementById('placesTable');
			placesTable.innerHTML = '';
			for (i = 0; i < places.length; i++) {
				placesTable.appendChild(addPlaceForm(places[i],i)); 
			}
		break;
		case 'receiveSetting':
			if (msg.message.key === 'backupSvc') {
				var bsSelect = document.getElementById('bsSelect');
				bsSelect.selectedIndex = (function () {
					for (var i = 0; i < bsSelect.options.length; i++) {
						if (bsSelect.options[i].value == msg.message.value) {
							return i;
						}
					}
				})();
				document.getElementById('backupButton').value = 'Back Up To ' + msg.message.value;
				document.getElementById('restoreButton').value = 'Restore From ' + msg.message.value;
			}
		break;
		case 'receiveSettings':
			var settings = msg.message;
			for (var key in settings) {
				var i = document.querySelector('input[name="'+ key +'"][value="'+ settings[key] +'"]');
				i && (i.checked = true);
			}
			if (settings.preserveLastTab !== undefined) {
				document.querySelector('input[name="homeUrl"]').disabled = (settings.preserveLastTab !== 2);
			}
			if (settings.homeUrl !== undefined) {
				document.querySelector('input[name="homeUrl"]').value = settings.homeUrl;
			}
			document.addEventListener('change', handleSettingChange, false);
		break;
		case 'receiveBlackList':
			editBox.value = msg.message.join('\n');
			editBox.title = editBox.value;
		break;
		case 'exImResult':
			setExImProgressIndicator(msg.message);
		break;
	}
}
function handleSettingChange(e) {
	var inputs, value, name = e.target.name;
	switch (name) {
		case 'preserveLastTab':
			value = getRadioValue(name) * 1;
			document.querySelector('input[name="homeUrl"]').disabled = (value != '2');
		break;
		case 'homeUrl':
			value = document.querySelector('input[name="homeUrl"]').value;
		break;
		default:
			value = getRadioValue(name) * 1;
		break;
	}
	safari.self.tab.dispatchMessage('saveSetting', { key: name, value: value });
}
function initializeBlacklist() {
	editBox      = document.getElementById('editBox');
	saveButton   = document.getElementById('saveButton');
	cancelButton = document.getElementById('cancelButton');
	safari.self.addEventListener("message", handleMessage, false);
	safari.self.tab.dispatchMessage('passBlackList');
}
function initializeOptions() {
	safari.self.addEventListener('message', handleMessage, false);
	safari.self.tab.dispatchMessage('passSettings', [
		'newFgTabPosition','newBgTabPosition','focusTabOnClose','preserveLastTab','homeUrl'
	]);
}
function initializeHotkeys() {
	safari.self.addEventListener('message', handleMessage, false);
	safari.self.tab.dispatchMessage('passActionNames');
}
function initializePlaces() {
	exImPIBox = null;
	safari.self.addEventListener("message", handleMessage, false);
	safari.self.tab.dispatchMessage('passPlaces');
	safari.self.tab.dispatchMessage('passSetting', 'backupSvc');
}
function insertHotkeyForms(actionNames) {
	var formContents = '\
		<h4 class="actionLabel"></h4>\
		<span class="hkWrapper" index="0"><input type="text" class="hkInput"><a class="cButton"></a></span>\
		<span class="hkWrapper" index="1"><input type="text" class="hkInput"><a class="cButton"></a></span>\
		<span class="hkWrapper" index="2"><input type="text" class="hkInput"><a class="cButton"></a></span>\
		<button type="button" class="sButton">Reset to Default</button>\
		<span class="statusMsg"></span>\
	';
	var h4, form;
	for (var key in actionNames) {
		form = document.createElement('form');
		form.className = 'hkForm';
		form.id = key;
		form.innerHTML = formContents;
		form.querySelector('h4').textContent = actionNames[key];
		document.getElementById('hotkeysDiv').appendChild(form);
	}
	addInputEventListeners();
}
function pbExport() {
	safari.self.tab.dispatchMessage('pbExportPlaces');
}
function pbImport() {
	setExImProgressIndicator('importing');
	safari.self.tab.dispatchMessage('pbImportPlaces');
}
function populateHotkeyInputs(actions) {
	var inputs = document.querySelectorAll('input.hkInput');
	for (var input, name, column, i = 0; i < inputs.length; i++) {
		input = inputs[i];
		name = input.parentNode.parentNode.id;
		column = input.parentNode.getAttribute('index');
		input.value = getHotkeyInputValue(actions[name][column]);
	}
}
function removeAllPlaces() {
	safari.self.tab.dispatchMessage('removeAllPlaces');
}
function removePlace(e) {
	e.preventDefault();
	var placeIndex = getPlaceIndex(e.target.parentNode);
	safari.self.tab.dispatchMessage('removePlace', placeIndex);
}
function resetHotkeys(e) {
	safari.self.tab.dispatchMessage('resetHotkey', e.target.parentNode.id);
}
function saveBlackList() {
	cancelButton.disabled = true;
	saveButton.disabled = true;
	saveButton.removeAttribute('style');
	editBox.title = editBox.value;
	var blString = cleanUpValue(editBox.value);
	safari.self.tab.dispatchMessage('saveBlackList', 
		(blString==='')?[]:blString.split('\n'));
}
function saveHotkey(e) {
	e.target.blur();
	var props = ['keyCode','keyIdentifier','altKey','ctrlKey','metaKey','shiftKey'];
	var hotkey = {};
	for (var i = 0; i < props.length; i++)
		hotkey[props[i]] = e[props[i]];
	var message = {
		a : e.target.parentNode.parentNode.id, 
		i : e.target.parentNode.getAttribute('index'),
		h : hotkey
	};
	safari.self.tab.dispatchMessage('saveHotkey', message);
	e.target.value = getHotkeyInputValue(hotkey);
	writeStatus(message.a, 'Hotkey saved.');
}
function savePlaceHotkey(e) {
	e.target.blur();
	e.target.title = e.target.value;
	var props = ['keyCode','keyIdentifier','altKey','ctrlKey','metaKey','shiftKey'];
	var hotkey = {};
	if (e.keyCode != 8) {
		for (var i = 0; i < props.length; i++) {
			hotkey[props[i]] = e[props[i]];
		}
	}
	var message = {
		i : getPlaceIndex(e.target.parentNode),
		h : hotkey
	};
	safari.self.tab.dispatchMessage('savePlaceHotkey', message);
	e.target.value = getHotkeyInputValue(hotkey);
}
function setBackupSvc() {
	var bsSelect = document.getElementById('bsSelect');
	var bsValue = bsSelect.options[bsSelect.selectedIndex].value;
	safari.self.tab.dispatchMessage('saveSetting', { 
		key   : 'backupSvc',
		value : bsValue
	});
	document.getElementById('backupButton').value = 'Back Up To ' + bsValue;
	document.getElementById('restoreButton').value = 'Restore From ' + bsValue;
}
function setExImProgressIndicator(state, message) {
	switch (state) {
		case 'exporting': 
			document.getElementById('exImPIBox') || createExImPIBox();
			var exImPIIcon = document.getElementById('exImPIIcon');
			var exImPIText = document.getElementById('exImPIText');
			exImPIIcon.src = safari.extension.baseURI + 'working.gif';
			exImPIText.textContent = 'Exporting...';
		break;
		case 'importing': 
			document.getElementById('exImPIBox') || createExImPIBox();
			var exImPIIcon = document.getElementById('exImPIIcon');
			var exImPIText = document.getElementById('exImPIText');
			exImPIIcon.src = safari.extension.baseURI + 'working.gif';
			exImPIText.textContent = 'Importing...';
		break;
		case 'success': 
		case 'nonefound':
			var exImPIIcon = document.getElementById('exImPIIcon');
			var exImPIText = document.getElementById('exImPIText');
			exImPIIcon.src = safari.extension.baseURI + 'success.png';
			exImPIText.textContent = (state == 'nonefound') ? 'Nothing found.' : 'Finished.';
			exImPIText.style.color = (state == 'nonefound') ? 'black' : 'green';
			setTimeout(function () {
				var ibo = 10;
				var iv = setInterval(function () {
					ibo -= 2;
					exImPIBox.style.opacity = ibo/10 + '';
					if (ibo === 0) {
						clearInterval(iv);
						document.body.removeChild(document.getElementById('exImPIBox'));
					}
				}, 50);
			}, 2000);
		break;
		case 'failure': 
			document.body.removeChild(document.getElementById('exImPIBox'));
		break;
	}
}
function sortPlacesBy(key) {
	safari.self.tab.dispatchMessage("sortPlacesBy", key);
}
function writeStatus(formId, text) {
	var statusSpan = document.querySelector('#' + formId + ' .statusMsg');
	statusSpan.innerHTML = text;
	setTimeout(function () {
		statusSpan.innerHTML = '&nbsp;';
	}, 7000);
}
