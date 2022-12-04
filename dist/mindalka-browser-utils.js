function SaveFile(file) {
	var link = document.createElement('a');
	link.setAttribute('href', URL.createObjectURL(file));
	link.setAttribute('download', file.name);

	link.click();
}

const I18N_DELAY_BEFORE_REFRESH = 100;

const I18n = new (function () {
	class I18n extends EventTarget {
		#path = './json/i18n/';
		#lang = 'english';
		#translations = new Map();
		#executing = false;
		#refreshTimeout;

		constructor() {
			super();
		}

		start() {
			this.#initObserver();
			this.i18n();//Scan everything to get html elements created before I18n
		}

		setOptions(options) {
			if (options.path) {
				this.#path = options.path;
			}

			if (options.translations) {
				for (let file of options.translations) {
					this.#loaded(file);
				}
			}
		}

		#initObserver() {
			//const config = {attributes: true, childList: true, subtree: true, attributeFilter:['class', 'data-i18n', 'data-i18n-title', 'data-i18n-placeholder']};
			const config = {childList: true, subtree: true};
			const callback = async (mutationsList, observer) => {
				for(let mutation of mutationsList) {
					if (mutation.type === 'childList') {
						for (let node of mutation.addedNodes) {
							if (node instanceof HTMLElement) {
								this.updateElement(node);
							}
						}
					}
				}
			};
			new MutationObserver(callback).observe(document.body, config);
		}

		#processList(parentNode, className, attribute, subElement) {
			const elements = parentNode.querySelectorAll('.' + className);

			if (parentNode.classList?.contains(className)) {
				this.#processElement(parentNode, attribute, subElement);
			}

			for (let element of elements) {
				this.#processElement(element, attribute, subElement);
			}
		}

		#processElement(htmlElement, attribute, subElement) {
			let dataLabel = htmlElement.getAttribute(attribute);
			if (dataLabel) {
				htmlElement[subElement] = this.getString(dataLabel);
			}
		}

		i18n() {
			if (!this.#refreshTimeout) {
				this.#refreshTimeout = setTimeout((event) => this.#i18n(), I18N_DELAY_BEFORE_REFRESH);
			}
		}

		#i18n() {
			this.#refreshTimeout = null;
			if (this.#lang == '') {return;}
			if (this.#executing) {return;}
			this.#executing = true;
			this.#processList(document, 'i18n', 'data-i18n', 'innerHTML');
			this.#processList(document, 'i18n-title', 'data-i18n-title', 'title');
			this.#processList(document, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
			this.#processList(document, 'i18n-label', 'data-i18n-label', 'label');
			this.#executing = false;
			return;
		}

		updateElement(htmlElement) {
			if (this.#lang == '') {return;}

			this.#processList(htmlElement, 'i18n', 'data-i18n', 'innerHTML');
			this.#processList(htmlElement, 'i18n-title', 'data-i18n-title', 'title');
			this.#processList(htmlElement, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
			this.#processList(htmlElement, 'i18n-label', 'data-i18n-label', 'label');
		}

		set lang(lang) {
			if (this.#lang != lang) {
				this.dispatchEvent(new CustomEvent('langchanged', {detail: {oldLang: this.#lang, newLang: lang}}));
				this.#lang = lang;
				this.checkLang();
				this.i18n();
			}
		}

		getString(s) {
			if (this.checkLang()) {
				if (this.#translations.get(this.#lang).strings) {
					let s2 = this.#translations.get(this.#lang).strings[s];
					if (typeof s2 == 'string') {
						return s2;
					} else {
						console.warn('Missing translation for key ' + s);
						return s;
					}
				}
			}
			return s;
		}

		get authors() {
			if (this.checkLang()) {
				if (this.#translations.get(this.#lang).authors) {
					return this.#translations.get(this.#lang).authors;
				}
			}
			return [];
		}

		checkLang() {
			if (this.#translations.has(this.#lang)) {
				return true;
			} else {
				let url = this.#path + this.#lang + '.json';
				fetch(new Request(url)).then((response) => {
					response.json().then((json) => {
						this.#loaded(json);
					});
				});
				this.#translations.set(this.#lang, {});
				return false;
			}
		}

		#loaded(file) {
			if (file) {
				let lang = file.lang;
				this.#translations.set(lang, file);
				this.i18n();
				this.dispatchEvent(new CustomEvent('translationsloaded'));
			}
		}
	}
	return I18n;
}());

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$1 = ".notification-manager{\r\n\tposition: absolute;\r\n\tz-index: 100;\r\n\tbottom: 0px;\r\n\twidth: 100%;\r\n\tdisplay: flex;\r\n\tflex-direction: column-reverse;\r\n\tmax-height: 50%;\r\n\toverflow-y: auto;\r\n}\r\n.notification-manager-notification{\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--theme-text-color);\r\n\tfont-size: 1.5em;\r\n\tpadding: 4px;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n}\r\n.notification-manager-notification-content{\r\n\toverflow: auto;\r\n\tflex: 1;\r\n\tmax-width: calc(100% - 20px);\r\n}\r\n.notification-manager-notification-close{\r\n\tfill: currentColor;\r\n\tcursor: pointer;\r\n}\r\n.notification-manager-notification-close > svg{\r\n\twidth: 20px;\r\n\tmargin: 5px;\r\n}\r\n.notification-manager-notification-success{\r\n\tbackground-color: #5aa822ff;\r\n}\r\n.notification-manager-notification-warning{\r\n\tbackground-color: #c78a17ff;\r\n}\r\n.notification-manager-notification-error{\r\n\tbackground-color: #c71717ff;\r\n}\r\n.notification-manager-notification-info{\r\n\tbackground-color: #2e88e8ff;\r\n}\r\n";
styleInject(css_248z$1);

const NOTIFICATION_CLASSNAME = 'notification-manager-notification';
const CLOSE_SVG = '<svg viewBox="0 0 357 357"><polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3 214.2,178.5"/></svg>';

class Notification {
	constructor(content, type, ttl) {
		this.content = content;
		this.type = type;
		this.ttl = ttl;
	}

	set ttl(ttl) {
		if (ttl) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => NotificationManager.closeNofication(this), ttl * 1000);
		}
	}

	get view() {
		if (!this.htmlElement) {
			this.htmlElement = document.createElement('div');
			let htmlElementContent = document.createElement('div');
			htmlElementContent.className = NOTIFICATION_CLASSNAME + '-content';
			let htmlElementClose = document.createElement('div');
			htmlElementClose.className = NOTIFICATION_CLASSNAME + '-close';

			this.htmlElement.append(htmlElementContent, htmlElementClose);
			this.htmlElement.className = NOTIFICATION_CLASSNAME;
			if (this.type) {
				this.htmlElement.classList.add(NOTIFICATION_CLASSNAME + '-' + this.type);

			}
			if (this.content instanceof HTMLElement) {
			htmlElementContent.append(this.content);
			} else {
				htmlElementContent.innerHTML = this.content;
			}
			htmlElementClose.innerHTML = CLOSE_SVG;
			htmlElementClose.addEventListener('click', () => NotificationManager.closeNofication(this));
		}
		return this.htmlElement;
	}
}

const NotificationManager = new (function () {
	class NotificationManager extends EventTarget {//TODOv3 are we going to send events ?
		constructor() {
			super();
			this.htmlParent = document.body;
			this.nofifications = new Set();
			this.createHtml();
		}

		set parent(htmlParent) {
			this.htmlParent = htmlParent;
			this.htmlParent.append(this.htmlElement);
		}

		createHtml() {
			this.htmlElement = document.createElement('div');
			this.htmlElement.className = 'notification-manager';
			this.htmlParent.append(this.htmlElement);
		}

		_getNotification(content, type, ttl) {
			for (let notification of this.nofifications) {
				if ((notification.content ==content) && (notification.type == type)) {
					notification.ttl = ttl;
					return notification;
				}
			}
			return new Notification(content, type, ttl);
		}

		addNotification(content, type, ttl) {
			let notification = this._getNotification(content, type, ttl);
			this.nofifications.add(notification);
			this.htmlElement.append(notification.view);
		}

		closeNofication(notification) {
			this.nofifications.delete(notification);
			notification.view.remove();
		}
	}
	return NotificationManager;
}());

function createElement(tagName, options) {
	let element = document.createElement(tagName);
	if (options) {
		for (let optionName in options) {
			let optionValue = options[optionName];
			switch (optionName) {
				case 'class':
					element.classList.add(...optionValue.split(' '));
					break;
				case 'i18n':
					element.setAttribute('data-i18n', optionValue);
					element.innerHTML = optionValue;
					element.classList.add('i18n');
					break;
				case 'i18n-title':
					element.setAttribute('data-i18n-title', optionValue);
					element.classList.add('i18n-title');
					break;
				case 'i18n-placeholder':
					element.setAttribute('data-i18n-placeholder', optionValue);
					element.classList.add('i18n-placeholder');
					break;
				case 'i18n-label':
					element.setAttribute('data-i18n-label', optionValue);
					element.classList.add('i18n-label');
					break;
				case 'parent':
					optionValue.append(element);
					break;
				case 'child':
					element.append(optionValue);
					break;
				case 'childs':
					element.append(...optionValue);
					break;
				case 'events':
					for (let eventType in optionValue) {
						let eventParams = optionValue[eventType];
						if (typeof eventParams === 'function') {
							element.addEventListener(eventType, eventParams);
						} else {
							element.addEventListener(eventType, eventParams.listener, eventParams.options);
						}
					}
					break;
				case 'hidden':
					if (optionValue) {
						hide(element);
					}
					break;
				case 'attributes':
					for (let attributeName in optionValue) {
						element.setAttribute(attributeName, optionValue[attributeName]);
					}
					break;
				case 'list':
					element.setAttribute(optionName, optionValue);
					break;
				default:
					if (optionName.startsWith('data-')) {
						element.setAttribute(optionName, optionValue);
					} else {
						element[optionName] = optionValue;
					}
					break;
			}
		}
	}
	return element;
}

function display(htmlElement, visible) {
	if (htmlElement == undefined) return;

	if (visible) {
		htmlElement.style.display = '';
	} else {
		htmlElement.style.display = 'none';
	}
}

function show(htmlElement) {
	display(htmlElement, true);
}

function hide(htmlElement) {
	display(htmlElement, false);
}

var css_248z = "#options-manager-outer{\r\n\tposition: absolute;\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\toverflow: auto;\r\n\tz-index: 10000;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n\tjustify-content: center;\r\n\ttop:0px;\r\n\tleft: 0px;\r\n}\r\n\r\n#options-manager-intermediate{\r\n\toverflow: visible;\r\n\twidth: 0px;\r\n\theight: 0px;\r\n\tposition: absolute;\r\n\tleft: 50%;\r\n\ttop: 50%;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n\tjustify-content: center;\r\n}\r\n\r\n#options-manager-inner{\r\n\tposition: relative;\r\n\t/*background-color: rgba(255, 255, 255, 1.0);*/\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--main-text-color-dark2);\r\n\tpadding:10px;\r\n\toverflow: hidden;\r\n\tmax-height: 70%;\r\n\tmax-width: 75%;\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\topacity: 0.9;\r\n}\r\n\r\n#options-manager-inner h1{\r\n\ttext-transform: capitalize;\r\n\ttext-align: center;\r\n}\r\n\r\n#options-manager-inner-filter{\r\n\twidth:100%;\r\n}\r\n\r\n.options-manager-button{\r\n\tcursor:pointer;\r\n\twhite-space: nowrap;\r\n\ttext-transform: capitalize;\r\n}\r\n\r\n#options-manager-inner table{\r\n\ttext-align: left;\r\n\toverflow: hidden auto;\r\n\tdisplay: block;\r\n\theight: 100%;\r\n}\r\n\r\n#options-manager-inner thead{\r\n\tposition: sticky;\r\n\t/*display: block;*/\r\n\ttop: 0px;\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n}\r\n\r\n#options-manager-inner thead th{\r\n\tposition: sticky;\r\n\ttop: 0px;\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n}\r\n\r\n#options-manager-inner th{\r\n\ttext-transform: capitalize;\r\n}\r\n\r\n#options-manager-inner th button, #options-manager-inner td button{\r\n\twidth: 100%;\r\n}\r\n\r\n#options-manager-title{\r\n\tcursor:move;\r\n}\r\n\r\n[draggable=true] {\r\n\tcursor: move;\r\n}\r\n\r\n[draggable=true] *{\r\n\tcursor: initial;\r\n}\r\n\r\n#options-manager-outer kbd{\r\n\tbackground-color: #eee;\r\n\tborder-radius: 0.25rem;\r\n\tborder: 0.1rem solid #b4b4b4;\r\n\tbox-shadow: 0 0.06rem 0.06rem rgba(0, 0, 0, .2), 0 0.1rem 0 0 rgba(255, 255, 255, .7) inset;\r\n\tcolor: #333;\r\n\tdisplay: inline-block;\r\n\tline-height: 1;\r\n\tpadding: 0.15rem;\r\n\twhite-space: nowrap;\r\n\tfont-weight: 1000;\r\n\tfont-size: 1.3rem;\r\n}\r\n";
styleInject(css_248z);

const OptionsManager = new (function () {
	class OptionsManager extends EventTarget {
		#defaultValues = new Map();
		#currentValues = new Map();
		#categories = new Map();
		#dirtyCategories = true;
		#initPromiseResolve;
		#initPromise = new Promise((resolve) => this.#initPromiseResolve = resolve);
		#currentFilter = '';
		#optionsManagerRows = new Set();
		#htmlOptionsManagerContainer;
		#htmlOptionsTable;
		#htmlOptionsManagerContentThead;
		static #uniqueId = 0;

		constructor() {
			super();

			this.#defaultValues[Symbol.iterator] = function* () {
				yield* [...this.entries()].sort(
					(a, b) => {return a[0] < b[0] ? -1 : 1;}
				);
			};
		}

		async init(parameters) {
			if (parameters.url) {
				await this.#initFromURL(parameters.url);
			} else if (parameters.json) {
				this.#initFromJSON(parameters.json);
			}
		}

		async #initFromURL(url) {
			let response = await fetch(url);
			this.#initFromJSON(await response.json());
		}

		#initFromJSON(json) {
			if (json) {
			 	if (json.categories) {
					json.categories.forEach((category) => this.#addCategory(category));
				}
				this.#addCategory('');
			 	if (json.options) {
					json.options.forEach((option) => this.addOption(option));
				}
				this.#initPromiseResolve();
			}
		}

		#addCategory(name) {
			this.#categories.set(name.toLowerCase(), []);
			this.#dirtyCategories = true;
		}

		#refreshCategories(name) {
			if (this.#dirtyCategories) {
				for (let [categoryName, category] of this.#categories) {
					category.length = 0;
				}

				for (let [optionName, option] of this.#defaultValues) {
					let maxLength = -1;
					let cat = null;
					for (let [categoryName, category] of this.#categories) {
						if (categoryName.length > maxLength) {
							if (optionName.startsWith(categoryName) || categoryName === '') {
								maxLength = categoryName.length;
								cat = category;
							}
						}
					}
					if (cat !== null) {
						cat.push(option);
					}
				}
			}
			this.#dirtyCategories = false;
		}

		addOption(option) {
			if (!option) {return;}
			let name = option.name.toLowerCase();

			let type = option.type;
			let defaultValue = option.default;
			let datalist = option.datalist;
			let editable = option.editable;
			let dv = this.#defaultValues.get(name) || {};
			this.#defaultValues.set(name, dv);
			dv.name = name;
			if (type !== undefined) {
				dv.type = type;
			}
			if (defaultValue !== undefined) {
				dv.dv = defaultValue;
			}
			if (datalist !== undefined) {
				dv.datalist = datalist;
			}
			if (editable !== undefined) {
				dv.editable = editable;
			}

			try {
				if (typeof localStorage != 'undefined') {
					let value = this.getItem(name);
					if (value === undefined) {
						this.setItem(name, defaultValue);
					} else {
						this.setItem(name, value);
					}
				}
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		setItem(name, value) {
			try {
				if (typeof localStorage != 'undefined') {
					localStorage.setItem(name, JSON.stringify(value));
					if (this.#currentValues.has(name)) {
						if (value == this.#currentValues.get(name)) {
							return;
						}
					}
					this.#currentValues.set(name, value);
					this.#valueChanged(name, value);
				}
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		getSubItem(name, subName) {
			try {
				let map = this.#currentValues.get(name) ?? {};
				if (map && (typeof map == 'object')) {
					return map[subName];
				}
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		async setSubItem(name, subName, value) {
			try {
				let option = await this.getOption(name);
				if (option && option.type == 'map') {
					let map = this.#currentValues.get(name) ?? {};

					if (map[subName] == value) {
						return;
					}
					map[subName] = value;
					this.#valueChanged(name, map);

					localStorage.setItem(name, JSON.stringify(map));
				}
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		removeSubItem(name, subName) {
			try {
				let map = this.#currentValues.get(name) ?? {};
				if (map && (typeof map == 'object')) {
					delete map[subName];
					this.#valueChanged(name, map);
					localStorage.setItem(name, JSON.stringify(map));
				}
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		#valueChanged(name, value) {
			this.dispatchEvent(new CustomEvent(name, {detail:{name:name, value:value}}));
			let lastIndex = name.lastIndexOf('.');
			while (lastIndex != -1) {
				let wildCardName = name.slice(0, lastIndex);
				this.dispatchEvent(new CustomEvent(wildCardName + '.*', {detail:{name:name, value:value}}));
				lastIndex = name.lastIndexOf('.', lastIndex - 1);
			}

			this.dispatchEvent(new CustomEvent('*', {detail:{name:name, value:value}}));
		}

		getItem(name) {
			try {
				if (typeof localStorage != 'undefined') {
					let value = localStorage.getItem(name);
					if (value) {
						let parsedValue = JSON.parse(value);
						return parsedValue;
					}
				}
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
			if (this.#defaultValues.get(name)) {
				return this.#defaultValues.get(name).dv;
			}
		}

		removeItem(name) {
			this.#defaultValues.delete(name);
			try {
				if (typeof localStorage != 'undefined') {
					localStorage.removeItem(name);
				}
				this.#currentValues.delete(name);
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		resetItem(name) {
			let item = this.#defaultValues.get(name);
			if (item) {
				let defaultValue = item.dv;
				if (defaultValue !== undefined) {
					this.#currentValues.delete(name);
					this.setItem(name, defaultValue);
				}
			}
		}

		resetItems(names) {
			for (name of names) {
				this.resetItem(name);
			}
		}

		resetAllItems(name) {
			for (let item of this.#defaultValues.keys()) {
				this.resetItem(item);
			}
		}

		clear() {
			this.#defaultValues.clear();
			try {
				if (typeof localStorage != 'undefined') {
					localStorage.clear();
				}
				this.#currentValues.clear();
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		#filter(filter) {
			this.#currentFilter = String(filter).toLowerCase();
			this.#applyFilter();
		}

		#applyFilter() {
			for (let row of this.#optionsManagerRows) {
				//let row = i[0];
				let optionName = row.getAttribute('user-data-option-name').toLowerCase();

				if (!this.#currentFilter || optionName.indexOf(this.#currentFilter) != -1) {
					row.style.display = '';
				} else {
					row.style.display = 'none';
				}
			}
		}

		#initPanel() {
			this.#htmlOptionsManagerContainer = createElement('div', {
				id: 'options-manager-outer',
				parent: document.body,
				events: {
					click: event => hide(this.#htmlOptionsManagerContainer)
				}
			});

			let options_manager_inner = createElement('div', {
				id: 'options-manager-inner',
				draggable: true,
				'data-left': 0,
				'data-top': 0,
				parent: this.#htmlOptionsManagerContainer,
				events: {
					click: event => event.stopPropagation(),
					dragstart: event => handleDragStart(event),
					dragend: event => handleDragEnd(event),
				}
			});

			let handleDragStart = function(event) {
				let target = event.target;

				target.setAttribute('data-drag-start-layerx', event.layerX);
				target.setAttribute('data-drag-start-layery', event.layerY);
			};

			let handleDragEnd = function(event) {
				let target = event.target;

				let startEventX = target.getAttribute('data-drag-start-layerx');
				let startEventY = target.getAttribute('data-drag-start-layery');

				target.style.left = (event.layerX - startEventX) + 'px';
				target.style.top = (event.layerY - startEventY) + 'px';

				let dataTop = target.getAttribute('data-top') * 1 + (event.layerY - startEventY);
				let dataLeft = target.getAttribute('data-left') * 1 + (event.layerX - startEventX);

				target.style.left = dataLeft + 'px';
				target.style.top = dataTop + 'px';

				options_manager_inner.setAttribute('data-left', dataLeft);
				options_manager_inner.setAttribute('data-top', dataTop);
			};

			createElement('h1', {id: 'options-manager-title', i18n: '#manage_options', parent: options_manager_inner});

			createElement('input', {
				id: 'options-manager-inner-filter',
				'i18n-placeholder': '#filter',
				parent: options_manager_inner,
				events: {
					input: event => this.#filter(event.target.value)
				}
			});

			this.#htmlOptionsTable = createElement('table', {parent: options_manager_inner});
			this.#htmlOptionsManagerContentThead = createElement('thead', {parent: this.#htmlOptionsTable});
		}

		#populateOptionRow(option) {
			let htmlRow = createElement('tr');
			let htmlResetButtonCell = createElement('td');
			let htmlOptionNameCell = createElement('td', {innerHTML: option.name});
			let htmlDefaultValueCell = createElement('td');
			let htmlUserValueCell = createElement('td');

			JSON.stringify(option.dv);
			let myValue = this.getItem(option.name);

			this.#fillCell(htmlDefaultValueCell, option.type, option.dv);

			createElement('button', {
				class: 'options-manager-button',
				i18n: '#reset',
				parent: htmlResetButtonCell,
				events: {
					click: (event) => {this.resetItem(option.name);this.#refreshPanel();}
				}
			});

			let valueEdit = this.#createInput(option.name, this.#defaultValues.get(option.name), myValue, htmlResetButtonCell);
			htmlUserValueCell.appendChild(valueEdit);
			htmlRow.append(htmlResetButtonCell, htmlOptionNameCell, htmlDefaultValueCell, htmlUserValueCell);
			return htmlRow;
		}

		#populateMapOptionRow(option) {
			let htmlRow = createElement('tbody', {innerHTML: `<td></td><td colspan="3">${option.name}</td>`});

			let userValue = this.getItem(option.name);
			if (userValue && typeof userValue === 'object') {
				for (let key in userValue) {
					let htmlSubRow = createElement('tr', {parent: htmlRow});
					let value = userValue[key];

					let htmlRemoveButtonCell = createElement('td');
					let htmlSubNameCell = createElement('td', {innerHTML: key});
					let htmlSubValueCell = createElement('td');
					htmlSubRow.append(htmlRemoveButtonCell, htmlSubNameCell, htmlSubValueCell);

					createElement('input', {value: value, parent: htmlSubValueCell});
				}
			}
			return htmlRow;
		}

		#addOptionRow(option) {
			if (option.editable === false) {
				return;
			}

			let htmlRow;
			if (option.type == 'map') {
				htmlRow = this.#populateMapOptionRow(option);
			} else {
				htmlRow = this.#populateOptionRow(option);
			}

			htmlRow.setAttribute('user-data-option-name', option.name);

			return htmlRow;
		}

		#refreshPanel() {
			this.#refreshCategories();
			this.#htmlOptionsManagerContentThead.innerHTML = '';

			this.#htmlOptionsManagerContentThead.append(
				createElement('th', {child: createElement('button', {
					class: 'options-manager-button',
					i18n: '#reset_all',
					events: {
						click: (event) => {this.resetAllItems();this.#refreshPanel();}
					}
				})}),
				createElement('th', {i18n: '#option_name'}),
				createElement('th', {i18n: '#option_default_value'}),
				createElement('th', {i18n: '#option_user_value'}),
			);

			for (let row of this.#optionsManagerRows) {
				row.remove();
			}
			this.#optionsManagerRows.clear();

			for (let [categoryName, category] of this.#categories) {
				for (let option of category) {
					let htmlRow = this.#addOptionRow(option);
					if (htmlRow) {
						this.#optionsManagerRows.add(htmlRow);
						this.#htmlOptionsTable.append(htmlRow);
					}
				}
			}
			I18n.i18n();
			this.#applyFilter();
		}

		#fillCell(cell, type, value) {
			switch (type) {
				case 'string':
					cell.innerHTML = value;
					break;
				case 'shortcut':
					let arr = value.split('+');
					for (let key of arr) {
						createElement('kbd', {
							innerHTML: key,
							parent: cell,
						});
					}
					//cell.innerHTML = value;
					break;
				default:
					cell.innerHTML = value;
			}
		}

		static #getUniqueId() {
			return 'options-manager-' + (this.#uniqueId++);
		}

		#createInput(optionName, option, value, resetButton) {
			let showHideResetButton = () => {
				let defaultValue = this.#defaultValues.get(optionName).dv;
				defaultValue = defaultValue === null ? null : JSON.stringify(defaultValue);
				let optionValue = this.getItem(optionName);
				optionValue = optionValue === null ? null : JSON.stringify(optionValue);
				if ((optionValue) != defaultValue) {
					resetButton.style.opacity = '';
				} else {
					resetButton.style.opacity = '0';
				}
			};

			let htmlElement;
			switch (option.type) {
				case 'number':
				case 'integer':
					htmlElement = createElement('input', {
						value: value,
						events: {
							change: event => {
								let value = event.target.value.trim();
								this.setItem(optionName, value === '' ? null : Number(value));
								showHideResetButton();
							}
						}
					});
					break;
				case 'object':
					htmlElement = createElement('input',  {
						value: JSON.stringify(value),
						events: {
							change: event => {this.setItem(optionName, JSON.parse(event.target.value));showHideResetButton();}
						}
					});
					break;
				case 'boolean':
					htmlElement = createElement('input', {
						type: 'checkbox',
						checked: value,
						events: {
							change: event => {this.setItem(optionName, event.target.checked);showHideResetButton();}
						}
					});
					break;
				case 'list':
					OptionsManager.#getUniqueId();
					htmlElement = createElement('select', {
						value: value,
						events: {
							change: event => {this.setItem(optionName, event.target.value);showHideResetButton();}
						}
					});
					if (option.datalist) {
						for(let o of option.datalist) {
							createElement('option', {innerHTML: o, parent: htmlElement});
						}
					}
					break;
				case 'vec2':
					htmlElement = createElement('input', {
						value: value,
						events: {
							change: event => {this.setItem(optionName, (readVec2Value(event.target.value)));showHideResetButton();}
						}
					});
					break;
				/*case 'editablelist':
					let dataListId = OptionsManager.#getUniqueId();
					htmlElement = createElement('input');
					let datalist = createElement('datalist');
					datalist.id = dataListId;
					htmlElement.setAttribute('list', dataListId);
					document.body.appendChild(datalist);
					if (option.datalist) {
						for(let o of option.datalist) {
							let htmlOption = createElement('option');
							datalist.appendChild(htmlOption);
							htmlOption.innerHTML = o;
						}
					}
					htmlElement.addEventListener('change', event => {this.setItem(optionName, event.target.value);showHideResetButton();});
					break;*/
	/*			case 'vec4':
					htmlElement = createElement('input');
					htmlElement.value = value;//value.join(',');
					function readValue(value) {
						let v = value.split(',');
						if (v.length == 4) {
							return quat.fromValues(v[0] * 1, v[1] * 1, v[2] * 1, v[3] * 1);
						}
						return null;
					}
					htmlElement.addEventListener('change', event => {this.setItem(optionName, (readValue(event.target.value)));showHideResetButton();});
					break;*/
				case 'string':
				case 'color':
				default:
					htmlElement = createElement('input', {
						value: value,
						events: {
							change: event => {this.setItem(optionName, (event.target.value));showHideResetButton();}
						}
					});
					break;
			}
			showHideResetButton();
			return htmlElement;
		}

		showOptionsManager() {
			if (!this.#htmlOptionsManagerContainer) {
				this.#initPanel();
			}
			this.#refreshPanel();
			show(this.#htmlOptionsManagerContainer);
		}

		async getOptionsPerType(type) {
			await this.#initPromise;
			let ret = new Set();

			for (let option of this.#defaultValues.values()) {
				if (option.type == type) {
					let optionName = option.name;
					ret.add([optionName, this.#currentValues.get(optionName)]);
				}
			}
			return ret;
		}

		async getOption(name) {
			await this.#initPromise;
			return this.#defaultValues.get(name);
		}

		async getOptionType(name) {
			await this.#initPromise;
			return this.#defaultValues.get(name)?.type;
		}

		async getList(name) {
			await this.#initPromise;
			 let option = this.#defaultValues.get(name);
			 if (option && option.type == 'list') {
				 return option.datalist;
			 }
		}
	}
	return OptionsManager;
}());


function readVec2Value(value) {
	let v = value.split(',');
	if (v.length == 2) {
		return [v[0] * 1, v[1] * 1];
	}
	return null;
}

class Shortcut {
	constructor(shortcut) {
		this.alt = false;
		this.ctrl = false;
		this.meta = false;
		this.shift = false;
		let keys = shortcut.toUpperCase().split('+');
		for (let key of keys)  {
			switch (key) {
				case 'ALT':
					this.alt = true;
					break;
				case 'CTRL':
					this.ctrl = true;
					break;
				case 'META':
					this.meta = true;
					break;
				case 'SHIFT':
					this.shift = true;
					break;
				case 'PLUS':
					this.key = '+';
					break;
				default:
					this.key = key;
			}
		}
	}

	match(keyBoardEvent) {
		return	(keyBoardEvent.altKey == this.alt) &&
				(keyBoardEvent.ctrlKey == this.ctrl) &&
				(keyBoardEvent.metaKey == this.meta) &&
				(keyBoardEvent.shiftKey == this.shift) &&
				(keyBoardEvent.key.toUpperCase() == this.key);
	}
}

const ShortcutHandler = new (function () {
	class ShortcutHandler extends EventTarget {
		constructor() {
			super();
			this.shortcuts = new Map();
			window.addEventListener('keydown', (event) => this.handleKeyDown(event));
		}

		handleKeyDown(event) {
			if (event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
				) {
				return;
			}
			for (let [name, shortcuts] of this.shortcuts) {
				for (let shortcut of shortcuts) {
					if (shortcut.match(event)) {
						this.dispatchEvent(new CustomEvent(name, {detail:event}));
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		}

		setShortcuts(shortcutMap) {
			if (!shortcutMap) {
				return;
			}
			this.shortcuts.clear();
			for (let [name, shortcut] of shortcutMap) {
				this.addShortcut(name, shortcut);
			}
		}

		setShortcut(name, shortcut) {
			this.shortcuts.delete(name);
			this.addShortcut(name, shortcut);
		}

		addShortcut(name, shortcut) {
			let shortcuts = shortcut.split(';');
			let shortcutSet = this.shortcuts.get(name);
			if (!shortcutSet) {
				shortcutSet = new Set();
				this.shortcuts.set(name, shortcutSet);
			}
			for (let shortcut of shortcuts)  {
				shortcutSet.add(new Shortcut(shortcut));
			}
		}
	}
	return ShortcutHandler;
}());

export { I18n, NotificationManager, OptionsManager, SaveFile, ShortcutHandler };
