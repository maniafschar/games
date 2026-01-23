export { DateFormat, ui };

class ui {
	static emInPX = 0;
	static labels = [];
	static day = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

	static formatTime(date) {
		date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
		return ui.day[date.getDay()] + ' ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + (date.getFullYear() - 2000) + ' ' + date.getHours() + ':' + date.getMinutes();
	}

	static showTab(event) {
		var tabHeader = ui.parents(event.target, 'tabHeader');
		var i = [...tabHeader.children].indexOf(ui.parents(event.target, 'tab'));
		tabHeader.nextElementSibling.querySelector('container').style.marginLeft = -(i * 100) + '%';
		tabHeader.querySelector('tab.selected')?.classList.remove('selected');
		tabHeader.querySelectorAll('tab')[i].classList.add('selected');
		tabHeader.scrollBy({
			top: 0,
			left: i > 1 ? 500 : -500,
			behavior: 'smooth',
		});
	}
	static l(id) {
		return id ? ui.labels[id] : '';
	}
	static off(e, type, f) {
		ui.x(e, function (e2) {
			e2.removeEventListener(type, f);
		});
	}
	static on(e, type, f, once) {
		ui.x(e, function (e2) {
			e2.addEventListener(type, f, { capture: type == 'touchstart' ? true : false, passive: true, once: once == true ? true : false });
		});
	}
	static class(e, value) {
		ui.x(e, function (e2) {
			e2.classList = value;
		});
	}
	static classAdd(e, value) {
		var valueSplit = value.split(' ');
		ui.x(e, function (e2) {
			var s = e2.classList ? ' ' + e2.classList.value + ' ' : '';
			for (var i = 0; i < valueSplit.length; i++) {
				if (s.indexOf(' ' + valueSplit[i] + ' ') < 0)
					e2.classList = ((e2.classList ? e2.classList.value + ' ' : '') + valueSplit[i]).trim();
			}
		});
	}
	static classContains(e, value) {
		var b = false;
		value = ' ' + value + ' ';
		ui.x(e, function (e2) {
			if (e2.classList && (' ' + e2.classList.value + ' ').indexOf(value) > -1)
				b = true;
		});
		return b;
	}
	static classRemove(e, value) {
		value = ' ' + value + ' ';
		ui.x(e, function (e2) {
			if (e2.classList) {
				var newList = '';
				for (var i = 0; i < e2.classList.length; i++) {
					if (value.indexOf(' ' + e2.classList[i] + ' ') < 0)
						newList += ' ' + e2.classList[i];
				}
				e2.classList = newList.trim();
			}
		});
	}
	static css(e, css, value) {
		ui.x(e, function (e2) {
			e2.style[css] = value;
		});
	}
	static cssValue(e, css) {
		var value;
		ui.x(e, function (e2) {
			if (document.defaultView && document.defaultView.getComputedStyle)
				value = document.defaultView.getComputedStyle(e2, '').getPropertyValue(css);
			else if (e2.currentStyle) {
				css = css.replace(/\-(\w)/g, function (m, p) {
					return p.toUpperCase();
				});
				value = e2.currentStyle[css];
			}
		});
		return value ? value : '';
	}
	static html(e, value) {
		ui.x(e, function (e2) {
			e2.innerHTML = value;
		});
	}
	static parents(e, nodeName) {
		if (e) {
			nodeName = nodeName.toUpperCase();
			while (e && e.nodeName != nodeName)
				e = e.parentNode;
		}
		return e;
	}
	static parentsAny(e, nodeNames) {
		if (e && nodeNames) {
			nodeNames = nodeNames.toUpperCase().split(',');
			for (var i = 0; i < nodeNames.length; i++) {
				var e2 = e;
				while (e2 && e2.nodeName != nodeNames[i])
					e2 = e2.parentNode;
				if (e2)
					return e2;
			}
		}
	}
	static toggleHeight(e, exec) {
		ui.x(e, function (e2) {
			if (!e2 || e2.getAttribute('toggle') && new Date().getTime() - e2.getAttribute('toggle') < 450)
				return;
			e2.setAttribute('toggle', new Date().getTime());
			if (!e2.getAttribute('h')) {
				var p = e2.style.position;
				var d = e2.style.display;
				e2.style.visibility = 'hidden';
				e2.style.display = 'block';
				e2.style.height = '';
				e2.style.position = 'absolute';
				e2.setAttribute('h', e2.offsetHeight);
				e2.style.position = p;
				e2.style.display = d;
				e2.style.visibility = '';
			}
			var o = e2.style.overflow;
			var t = e2.style.transition;
			e2.style.overflow = 'hidden';
			var expand = ui.cssValue(e2, 'display') == 'none';
			e2.style.height = (expand ? 0 : e2.offsetHeight) + 'px';
			if (expand)
				e2.style.display = 'block';
			setTimeout(function () {
				var h = parseInt(e2.style.height);
				e2.style.transition = 'height .4s ease-' + (expand ? 'in' : 'out');
				ui.on(e2, 'transitionend', function () {
					e2.style.overflow = o;
					e2.style.transition = t;
					e2.style.height = '';
					if (!expand) {
						e2.style.setProperty('display', 'none', 'important');
						e2.setAttribute('h', h);
					}
					e2.removeAttribute('toggle');
					if (exec)
						exec();
				}, true);
				e2.style.height = expand ? e2.getAttribute('h') + 'px' : 0;
			}, 10);
		});
	}
	static val(e) {
		var value = '';
		ui.x(e, function (e2) {
			var s = e2.nodeName == 'INPUT' || e2.nodeName == 'TEXTAREA' ? e2.value : e2.getAttribute('value');
			if (s)
				value += ' · ' + s;
		});
		return value ? value.substring(1) : value;
	}
	static x(e, f) {
		if (typeof e == 'string')
			e = document.querySelectorAll(e);
		if (!e)
			return;
		if (e.length) {
			for (var i = 0; i < e.length; i++)
				f(e[i]);
		} else if (e && typeof e.addEventListener == 'function')
			f(e);
	}
}
class DateFormat {
	formatDate(d, type) {
		if (!d)
			return '';
		var d2 = this.server2local(d);
		if (d2 instanceof Date)
			return (type == 'noWeekday' ? '' : ui.l('date.weekday' + (type ? 'Long' : '') + d2.getDay()) + ' ') + d2.getDate() + '.' + (d2.getMonth() + 1) + '.' + ('' + d2.getFullYear()).slice(-2)
				+ (typeof d != 'string' || d.length > 10 ? ' ' + d2.getHours() + ':' + ('0' + d2.getMinutes()).slice(-2) : '');
		return d2;
	}
	getDateFields(d) {
		if (typeof d == 'number')
			d = new Date(d);
		if (d instanceof Date)
			return {
				year: d.getFullYear(),
				month: ('0' + (d.getMonth() + 1)).slice(-2),
				day: ('0' + d.getDate()).slice(-2),
				hour: ('0' + d.getHours()).slice(-2),
				minute: ('0' + d.getMinutes()).slice(-2),
				second: ('0' + d.getSeconds()).slice(-2),
				time: true
			};
		if (d.year && d.day)
			return d;
		if (d.indexOf('-') < 0 && d.length == 8)
			d = d.substring(0, 4) + '-' + d.substring(4, 6) + '-' + d.substring(6);
		var p1 = d.indexOf('-'), p2 = d.indexOf('-', p1 + 1), p3 = d.replace('T', ' ').indexOf(' '), p4 = d.indexOf(':'), p5 = d.indexOf(':', p4 + 1), p6 = d.indexOf('.');
		return {
			year: d.substring(0, p1),
			month: d.substring(p1 + 1, p2),
			day: d.substring(p2 + 1, p3 < 0 ? d.length : p3),
			hour: p4 < 0 ? 0 : d.substring(p3 + 1, p4),
			minute: p4 < 0 ? 0 : d.substring(p4 + 1, p5 > 0 ? p5 : d.length),
			second: p5 < 0 ? 0 : d.substring(p5 + 1, p6 < 0 ? d.length : p6),
			time: p4 > 0
		};
	}
	getDateHint(d) {
		var today = new Date(), l;
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		var diff = (d.getTime() - today.getTime()) / 86400000;
		if (d.getDate() == today.getDate() && d.getMonth() == today.getMonth())
			l = 'today';
		else if (diff > 0) {
			if (diff < 2)
				l = 'tomorrow';
			else if (diff < 3)
				l = 'tomorrowPlusOne';
			else if (this.getWeekNumber(d)[1] == this.getWeekNumber(today)[1])
				l = 'this';
			else if (diff < 7)
				l = 'next';
		} else if (diff > -1)
			l = 'yesterday';
		return l ? ui.l('events.' + l) : '{0}';
	}
	getToday() {
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		return today;
	}
	getWeekNumber(date) {
		var d = new Date(+date);
		d.setHours(0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		var yearStart = new Date(d.getFullYear(), 0, 1);
		var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
		return [d.getFullYear(), weekNo];
	}
	local2server(d) {
		if (!d)
			return d;
		if (!(d instanceof Date)) {
			d = this.getDateFields(d);
			d = new Date(d.year, parseInt(d.month) - 1, d.day, d.hour, d.minute, d.second);
			if (d.hour == 0 && d.minute == 0 && d.second == 0)
				return d.year + '-' + d.month + '-' + d.day;
		}
		d = d.toISOString();
		return d.substring(0, d.indexOf('.'));
	}
	nextWorkday(d) {
		d.setDate(d.getDate() + 1);
		if (d.getDay() == 0)
			d.setDate(d.getDate() + 1);
		return d;
	}
	server2local(d) {
		if (!d)
			return d;
		if (d instanceof Date)
			return d;
		d = this.getDateFields(d);
		if (d.hour == 0 && d.minute == 0 && d.second == 0)
			return new Date(Date.UTC(d.year, parseInt(d.month) - 1, d.day));
		return new Date(Date.UTC(d.year, parseInt(d.month) - 1, d.day, d.hour, d.minute, d.second));
	}
}