import { InputDate } from "./element/InputDate";

export { ui };

class ui {
	static emInPX = 0;
	static labels = [];
	static day = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

	static pseudonyms(contacts) {
		var firstnames = {};
		for (var i = 0; i < contacts.length; i++) {
			var name = contacts[i].name;
			if (!firstnames[name.split(' ')[0]])
				firstnames[name.split(' ')[0]] = [];
			firstnames[name.split(' ')[0]].push(name.substring(name.indexOf(' ') + 1).trim());
		}
		var pseudonyms = {};
		for (var i = 0; i < contacts.length; i++) {
			contacts[i].pseudonym = contacts[i].name.split(' ')[0];
			var lastnames = firstnames[contacts[i].pseudonym];
			if (lastnames.length > 1) {
				var lastname = contacts[i].name.substring(contacts[i].name.indexOf(' ') + 1);
				lastnames = [...lastnames];
				lastnames.splice(lastnames.indexOf(lastname), 1);
				var suffix = '';
				var found = true;
				var pos = 0;
				while (found && pos < lastname.length - 1) {
					found = false;
					suffix += lastname.substring(pos, pos++ + 1);
					for (var i2 = 0; i2 < lastnames.length; i2++) {
						if (lastnames[i2].indexOf(suffix) == 0) {
							found = true;
							break;
						}
					}
				}
				contacts[i].pseudonym += ' ' + suffix;
			}
			pseudonyms['' + contacts[i].id] = contacts[i].pseudonym;
		}
		return pseudonyms;
	}

	static formatTime(date, hint) {
		date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
		var suffix = '';
		if (hint) {
			var holiday = InputDate.bankholidays(date.getFullYear())[date.getDate() + '.' + (date.getMonth() + 1)];
			if (holiday)
				suffix = ' · ' + holiday;
		}
		return ui.day[date.getDay()] + ' ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + (date.getFullYear() - 2000) + ' ' + date.getHours() + ':' + date.getMinutes() + suffix;
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