import { DateFormat, ui } from '../ui';

export { InputDate };

class InputDate extends HTMLElement {
	ignoreCallback = false;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'open' });
	}
	connectedCallback() {
		this._root.appendChild(document.createElement('style')).textContent = `
:host(*) {
	white-space: nowrap;
	overflow-x: auto;
	display: inline-block;
	width: 100%;
}
hint {
	text-align: center;
	background: rgba(0, 0, 255, 0.05);
    border-radius: 0.5em;
	padding: 0.5em 0;
}
cell {
	margin-bottom: 0;
	padding: 0.34em 0.75em;
	width: 2em;
	text-align: center;
	padding: 0.34em 0;
	display: inline-block;
	cursor: pointer;
	z-index: 2;
	position: relative;
	border-radius: 0.5em;
}
cell.title {
	font-weight: bold;
}
cell.filled {
	opacity: 1;
}
div {
	padding: 0 3em;
}
cell.weekday {
	background: transparent;
	padding: 0;
	cursor: default;
}
cell.weekend {
	color: rgb(0,0,100);
}
cell.outdated {
	opacity: 0.4;
	cursor: default;
}
cell.selected {
	background-color: rgba(255, 255, 255, 0.6);
}
prev,
next {
	position: absolute;
	width: 1.5em;
	font-size: 2em;
	z-index: 2;
	top: 1.2em;
	padding: 0 0.1em;
	color: rgba(0, 110, 255, 0.1);
	cursor: pointer;
	line-height: 1;
}
prev {
	left: 0.25em;
	text-align: left;
}
prev::after {
	content: '<';
	}
next {
	right: 0.25em;
	text-align: right;
}
next::after {
	content: '>';
}`;
		var element = document.createElement('cell');
		element.setAttribute('onclick', 'this.getRootNode().host.openDay()');
		element.setAttribute('name', 'day');
		this._root.appendChild(element);
		element = document.createElement('cell')
		element.setAttribute('onclick', 'this.getRootNode().host.openMonth()');
		element.setAttribute('name', 'month');
		this._root.appendChild(element);
		element = document.createElement('cell')
		element.setAttribute('onclick', 'this.getRootNode().host.openYear()');
		element.setAttribute('name', 'year');
		this._root.appendChild(element);
		if (this.getAttribute('type') != 'date') {
			element = document.createElement('cell')
			element.setAttribute('onclick', 'this.getRootNode().host.openHour()');
			element.setAttribute('name', 'hour');
			element.setAttribute('style', 'margin-left:1em;');
			this._root.appendChild(element);
			element = document.createElement('cell')
			element.setAttribute('onclick', 'this.getRootNode().host.openMinute()');
			element.setAttribute('name', 'minute');
			this._root.appendChild(element);
		}
		this._root.appendChild(document.createElement('hint')).style.display = 'none';
		this.select(this.getAttribute('value') ? new DateFormat().server2local(this.getAttribute('value')) : new Date());
	}
	static get observedAttributes() { return ['min', 'max', 'value']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.ignoreCallback && oldValue != newValue)
			this.select(this.getAttribute('value') ? new DateFormat().server2local(this.getAttribute('value'))
				: this.getAttribute('min') ? new Date(this.getAttribute('min')) : new Date());
	}
	get(name) {
		return this._root.querySelector('cell[name="' + name + '"]');
	}
	getCalendar() {
		var month = this.get('month').getAttribute('value');
		var year = this.get('year').getAttribute('value');
		var day = this.get('day').getAttribute('value');
		var maxDays = 31;
		var min = this.min();
		var max = this.max();
		if (!year) {
			if (max < new Date())
				this.selectYear(max.getFullYear() - 1);
			else
				this.selectYear(min.getFullYear());
			year = this.get('year').getAttribute('value');
		}
		if (!month) {
			this.selectMonth((max < new Date() ? max : min).getMonth() + 1);
			month = this.get('month').getAttribute('value');
		}
		if (month == '02')
			maxDays = year && new Date(parseInt(year), 1, 29).getDate() == 29 ? 29 : 28;
		else if (month == '04' || month == '06' || month == '09' || month == '11')
			maxDays = 30;
		var s = '', weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
		for (var i = 0; i < 7; i++)
			s += `<cell class="title weekday${i < 5 ? '' : ' weekend'}">${weekdays[i]}</cell>`;
		s += `<br/>`;
		var offset = (new Date(parseInt(year), parseInt(month) - 1, 1).getDay() + 6) % 7;
		for (var i = 0; i < offset; i++)
			s += `<cell class="weekday">&nbsp;</cell>`;
		var outdated, selectable = this.getAttribute('selectable');
		var maxMonth = parseInt(year) == max.getFullYear() && parseInt(month) == max.getMonth() + 1;
		var minMonth = parseInt(year) == min.getFullYear() && parseInt(month) == min.getMonth() + 1;
		for (var i = 1; i <= maxDays; i++) {
			outdated = maxMonth ? i > max.getDate() : minMonth ? i < min.getDate() : false;
			if (!outdated && selectable)
				outdated = selectable.indexOf(year + '-' + month + '-' + ('0' + i).slice(-2)) < 0;
			var c = outdated ? 'outdated' : '';
			if ((i + offset) % 7 == 0 || (i + offset) % 7 == 6)
				c += ' weekend';
			if (i == day)
				c += ' selected';
			s += `<cell ${outdated ? '' : `onclick="this.getRootNode().host.selectDay(${i},true)"`}${c ? ' class="' + c.trim() + '"' : ''}>${i}</cell>`;
			if ((i + offset) % 7 == 0)
				s += '<br/>';
		}
		for (var i = (new Date(parseInt(year), parseInt(month) - 1, maxDays).getDay() + 6) % 7; i < 6; i++)
			s += `<cell class="weekday">&nbsp;</cell>`;
		s += `<prev onclick="this.getRootNode().host.prevMonth(event)"></prev>`;
		s += `<next onclick="this.getRootNode().host.nextMonth(event)"></next>`;
		return s;
	}
	nextMonth(event) {
		event.stopPropagation();
		var m = parseInt(this.get('month').getAttribute('value')) + 1;
		var y = parseInt(this.get('year').getAttribute('value'));
		if (m > 12) {
			++y;
			m = 1;
		}
		var max = this.max();
		if (y <= max.getFullYear() && (y != max.getFullYear() || m <= max.getMonth() + 1)) {
			this.selectYear(y);
			this.selectMonth(m);
			this._root.querySelector('hint').innerHTML = this.getCalendar();
		}
	}
	prevMonth(event) {
		event.stopPropagation();
		var m = parseInt(this.get('month').getAttribute('value')) - 1;
		var y = parseInt(this.get('year').getAttribute('value'));
		if (m < 1) {
			--y;
			m = 12;
		}
		var min = this.min();
		if (y >= min.getFullYear() && (y != min.getFullYear() || m >= min.getMonth() + 1)) {
			this.selectYear(y);
			this.selectMonth(m);
			this._root.querySelector('hint').innerHTML = this.getCalendar();
		}
	}
	resetDay() {
		if (this.get('year')) {
			var min = this.min(), max = this.max();
			var d = new Date(this.get('year').getAttribute('value') + '-' + this.get('month').getAttribute('value') + '-' + this.get('day').getAttribute('value'));
			this.selectDay(min > d ? min.getDate() : d > max ? max.getDate() : d.getDate() != parseInt(this.get('day').getAttribute('value')) ?
				new Date(parseInt(this.get('year').getAttribute('value')), parseInt(this.get('month').getAttribute('value')), 0).getDate() : d.getDate());
		}
	}
	resetMonth() {
		if (this.get('year')) {
			var min = this.min(), max = this.max();
			var d = new Date(this.get('year').getAttribute('value') + '-' + (this.get('month').getAttribute('value') ? this.get('month').getAttribute('value') : '01') + '-' + this.get('day').getAttribute('value'));
			this.selectMonth((min > d ? min.getMonth() : d > max ? max.getMonth() : d.getMonth()) + 1);
		}
	}
	resetYear() {
		if (this.get('year')) {
			var min = this.min(), max = this.max();
			var d = new Date(this.get('year').getAttribute('value') + '-' + this.get('month').getAttribute('value') + '-' + this.get('day').getAttribute('value'));
			this.selectYear(min > d ? min.getFullYear() : d > max ? max.getFullYear() : d.getFullYear());
		}
	}
	select(date) {
		var d = new DateFormat().dateFields(date);
		this.selectYear(d.year);
		this.selectMonth(d.month);
		this.selectDay(d.day);
		this.selectHour(d.hour);
		this.selectMinute(d.minute);
	}
	selectDay(i, next) {
		this.setValue('Day', i ? ('0' + i).slice(-2) : null, parseInt(i));
		if (next)
			this.openHour();
	}
	selectHour(i, next) {
		this.setValue('Hour', i >= 0 ? ('0' + i).slice(-2) : null, parseInt(i));
		if (next)
			this.openMinute();
	}
	selectMinute(i, close) {
		i = parseInt(i);
		if (i > 0) {
			var step = this.getAttribute('minuteStep');
			step = step ? parseInt(step) : 5;
			i += step - 1;
			i = parseInt(i / step) * step;
			if (i == 60) {
				var hour = parseInt(this.get('hour')?.getAttribute('value') || new Date().getHours()) + 1;
				if (hour > 24) {
					var date = new Date();
					date.setHours(date.getHours() + 1);
					this.select(date.toISOString());
				} else {
					this.selectHour(hour);
					i = 0;
				}
			}
		}
		this.setValue('Minute', i >= 0 ? ('0' + i).slice(-2) : null);
		if (close)
			this.closeHint();
	}
	selectMonth(i, next) {
		if (i)
			this.setValue('Month', ('0' + i).slice(-2), '' + parseInt(i));
		else
			this.setValue('Month', null);
		this.resetDay();
		if (next)
			this.openYear();
	}
	selectYear(i, next) {
		this.setValue('Year', i);
		this.resetMonth();
		this.resetDay();
		if (next && this.get('hour'))
			this.openHour();
	}
	setValue(field, value, cell) {
		var e = this.get(field.toLowerCase());
		if (!e)
			return;
		if (value) {
			e.innerText = cell || cell == 0 ? cell : value;
			e.setAttribute('value', value);
			e.classList.add('filled');
		} else {
			e.innerText = field;
			e.setAttribute('value', '');
			e.classList.remove('filled');
		}
		var s = this.get('year').getAttribute('value');
		s += '-' + this.get('month').getAttribute('value');
		s += '-' + this.get('day').getAttribute('value');
		if (this.get('hour')) {
			s += 'T' + this.get('hour').getAttribute('value');
			s += ':' + this.get('minute').getAttribute('value');
			s += ':00';
		}
		if (s.indexOf('null') < 0) {
			var date = new Date(s);
			this.ignoreCallback = true;
			this.setAttribute('value', date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2) + 'T'
				+ ('0' + date.getUTCHours()).slice(-2) + ':' + ('0' + date.getUTCMinutes()).slice(-2) + ':00');
			this.ignoreCallback = false;
		}
	}
	openHint(html) {
		var e = this._root.querySelector('hint');
		e.innerHTML = html;
		if (e.style.display != 'block')
			ui.toggleHeight(e);
	}
	closeHint() {
		var e = this._root.querySelector('hint');
		if (e.style.display == 'block')
			ui.toggleHeight(e);
	}
	openDay() {
		this.openHint(this.getCalendar());
	}
	openHour() {
		var s = '', hour = this.get('hour').getAttribute('value');
		for (var i = 0; i < 24; i++) {
			s += `<cell onclick="this.getRootNode().host.selectHour(${i},true)" class="time${hour == i ? ' selected' : ''}">${i}</cell>`;
			if ((i + 1) % 4 == 0)
				s += '<br/>';
		}
		this.openHint(s);
	}
	openMinute() {
		var s = '', step = this.getAttribute('minuteStep'), minute = this.get('minute').getAttribute('value');
		step = step ? parseInt(step) : 5;
		for (var i = 0; i < 60; i += step) {
			s += `<cell onclick="this.getRootNode().host.selectMinute(${i},true)" class="time${minute == i ? ' selected' : ''}">${i}</cell>`;
			if ((i / 5 + 1) % 4 == 0)
				s += '<br/>';
		}
		this.openHint(s);
	}
	openMonth() {
		var min = this.min(), max = this.max(), month = this.get('month').getAttribute('value');
		var y = this.get('year').getAttribute('value');
		if (!y) {
			this.selectYear((max < new Date() ? max : min).getFullYear());
			y = this.get('year').getAttribute('value');
		}
		var s = '';
		for (var i = parseInt(y) == min.getFullYear() ? min.getMonth() + 1 : 1;
			i < (parseInt(y) == max.getFullYear() ? max.getMonth() + 1 : 13); i++) {
			s += `<cell onclick="this.getRootNode().host.selectMonth(${i},true)"${month == i ? 'class="selected"' : ''}>${i}</cell>`;
			if (i % 3 == 0)
				s += '<br/>';
		}
		this.openHint(s);
	}
	openYear() {
		var s = '<style>cell:not(.title){padding:0.34em 0;width:3.5em;text-align:center;}cell.filler{opacity:0;cursor:default;}</style>';
		var min = this.min().getFullYear(), max = this.max().getFullYear();
		var desc = min < new Date().getFullYear(), year = this.get('year').getAttribute('value');
		var maxPerRow = document.body.clientWidth / ui.emInPX > 45 ? 10 : 5;
		if (max - min > maxPerRow) {
			for (var i = maxPerRow - (desc ? max : min) % maxPerRow; i > 0; i--)
				s += `<cell class="filler"></cell>`;
		}
		for (var i = 0; i <= max - min; i++) {
			var i2 = desc ? max - i : min + i;
			if (i2 % maxPerRow == 0)
				s += '<br/>';
			s += `<cell onclick="this.getRootNode().host.selectYear(${i2},true)"${year == i2 ? 'class="selected"' : ''}>${i2}</cell>`;
		}
		if (max - min > maxPerRow) {
			for (var i = 0; i < (desc ? min - 1 : max + 1) % maxPerRow; i++)
				s += `<cell class="filler"></cell>`;
		}
		this.openHint(s);
	}
	max() {
		var max = this.getAttribute('max');
		if (max)
			return new Date(max);
		var date = new Date();
		date.setFullYear(date.getFullYear() + 1);
		return date;
	}
	min() {
		var min = this.getAttribute('min');
		return min ? new Date(min) : new Date();
	}
}
