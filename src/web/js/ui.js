export { DateFormat, ui, Validation };

class ui {
	static emInPX = 0;
	static labels = [];

	static formatTime(date) {
		date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
		return date.getDate() + '.' + (date.getMonth() + 1) + '.' + (date.getFullYear() - 2000) + ' ' + date.getHours() + ':' + date.getMinutes();
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
	static q(path) {
		var e = ui.qa(path);
		return e && e.length ? e[0] : null;
	}
	static qa(path) {
		return e.querySelectorAll(path);
	}
	static attr(e, name, value) {
		var b = value || typeof value == 'string' || value == 0;
		ui.x(e, function (e2) {
			if (b)
				e2.setAttribute(name, value);
			else
				e2.removeAttribute(name);
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
	static scrollTo(e, position, exec) {
		if (typeof e == 'string')
			e = ui.q(e);
		if (!e)
			return;
		var scrollTopOrg = e.scrollTop;
		if (scrollTopOrg == position)
			return;
		const down = position > scrollTopOrg;
		const cosParameter = (down ? position - scrollTopOrg : scrollTopOrg - position) / 2;
		let scrollCount = 0, oldTimestamp = null;

		function step(newTimestamp) {
			if (oldTimestamp !== null) {
				scrollCount += Math.PI * (newTimestamp - oldTimestamp) / 400;
				if (scrollCount >= Math.PI) {
					e.scrollTop = position;
					if (exec)
						exec();
					return;
				}
				e.scrollTop = scrollTopOrg + (down ? 1 : -1) * (cosParameter - cosParameter * Math.cos(scrollCount));
			}
			oldTimestamp = newTimestamp;
			window.requestAnimationFrame(step);
		}
		window.requestAnimationFrame(step);
	}
	static swipe(e, exec, exclude) {
		if (typeof e == 'string')
			e = ui.q(e);
		ui.on(e, 'touchstart', function (event) {
			if (!ui.parentsAny(event.target, exclude)) {
				e.startX = event.changedTouches[0].pageX;
				e.startY = event.changedTouches[0].pageY;
				e.startTime = new Date().getTime();
			}
		});
		ui.on(e, 'touchend', function (event) {
			if (!ui.parentsAny(event.target, exclude)) {
				var distX = event.changedTouches[0].pageX - e.startX;
				var distY = event.changedTouches[0].pageY - e.startY;
				var elapsedTime = new Date().getTime() - e.startTime;
				var swipedir = 'none', threshold = 100, restraint = 2000, allowedTime = 1000;
				if (elapsedTime <= allowedTime) {
					if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint)
						swipedir = distX < 0 ? 'left' : 'right';
					else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint)
						swipedir = distY < 0 ? 'up' : 'down';
				}
				exec(swipedir, event);
			}
		});
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
			e = ui.qa(e);
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
class Validation {
	static badWords = [];
	static badWordsReplacement = [];

	birthday(e) {
		formFunc.resetError(e);
		if (e.getAttribute('value')) {
			try {
				var n = new Date(), d = new DateFormat().getDateFields(e.getAttribute('value'));
				var a = n.getFullYear() - d.year;
				if (n.getMonth() + 1 < d.month || (n.getMonth() + 1 == d.month && n.getDate() < d.day))
					a--;
				var min = 18, max = 100;
				if (a < min || a > max) {
					var ex;
					if (a < 0)
						ex = 'NotBorn';
					else if (a < min)
						ex = 'TooYoung';
					else if (a > 110)
						ex = 'TooOld2';
					else
						ex = 'TooOld';
					formFunc.setError(e, 'settings.bday' + ex, [a < min ? min : max, a]);
				}
			} catch (e) {
				formFunc.setError(e, 'validation.wrong');
			}
		}
	}
	email(s) {
		if (s) {
			s.value = s.value.replace(/[^\p{L}\p{N}^\-_.@]/gu, '');
			var f = s.value.indexOf('@');
			var l = s.value.lastIndexOf('@');
			var ld = s.value.lastIndexOf('.');
			if (f != l || l > ld || l < 1 || ld < 3 || (s.value.length - ld) < 3) {
				formFunc.setError(s, 'settings.noEmail');
				return 1;
			}
			formFunc.resetError(s);
		}
		return -1;
	}
	filterWords(e) {
		var s = e.value;
		if (s) {
			s = ' ' + s + ' ';
			if (formFunc.validation.badWords.length == 0) {
				var words = ' anal | anus | arsch| ass |bdsm|blowjob| boob|bukkake|bumse|busen| cock | cum |cunnilingus|dildo|ejacul|ejakul|erection|erektion|faschis|fascis|fick|fuck|goebbels|göring|hakenkreuz|himmler|hitler|hure| möse |nazi|neger|nsdap|nutte|orgasm|penis|porn|pussy|queer|schwanz| sex |sucker|tits|titten|vagina|vibrator|vögeln|whore|wigger|wixer'.split('|');
				for (var i = 0; i < words.length; i++) {
					var s2 = '', i3 = 0;
					for (var i2 = 0; i2 < words[i].length; i2++)
						s2 += words[i].charAt(i2) == ' ' ? '$' + ++i3 : '*';
					formFunc.validation.badWordsReplacement.push(s2);
					formFunc.validation.badWords.push(new RegExp(words[i].replace(/ /g, '([$£€.,;:_*&%#"\'!? -+)(}{\\][])'), 'ig'));
				}
			}
			for (var i = 0; i < formFunc.validation.badWords.length; i++)
				s = s.replace(formFunc.validation.badWords[i], formFunc.validation.badWordsReplacement[i]);
		}
		if (!s || s == ' ' + e.value + ' ')
			formFunc.resetError(e);
		else {
			e.value = s.substring(1, s.length - 1);
			formFunc.setError(e, 'filter.offensiveWords');
		}
	}
	url(s) {
		if (!s)
			return -1;
		var f = s.value.indexOf('://');
		var l = s.value.lastIndexOf('.');
		if (f < 3 || l < 10 || l < f)
			formFunc.setError(s, 'error.url');
		else
			formFunc.resetError(s);
	}
}