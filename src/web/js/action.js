import { api } from "./api";
import { dialog } from "./dialog";
import { DialogPopup } from "./element/DialogPopup";
import { InputCheckbox } from "./element/InputCheckbox";
import { InputDate } from "./element/InputDate";
import { InputImage } from "./element/InputImage";
import { InputRating } from "./element/InputRating";
import { InputSelection } from "./element/InputSelection";
import { ProgressBar } from "./element/ProgressBar";
import { SortableTable } from "./element/SortableTable";
import { ui } from "./ui";

export { action };

class action {
	static init() {
		window.onresize();
		var updateCotacts = () => {
			api.contacts(contacts => {
				var table = document.querySelector('user sortable-table');
				table.list = contacts;
				if (!table.columns.length) {
					table.setOpenDetail(dialog.openContact);
					table.columns.push({ label: 'Name', sort: true, width: 30, detail: true });
					table.columns.push({ label: 'Punkte', sort: true, width: 20, style: 'text-align: right;', detail: true });
					table.columns.push({ label: 'Teilnahmen', sort: true, width: 20, style: 'text-align: right;', detail: true });
					table.columns.push({ label: 'Durchschnitt', sort: true, width: 20, style: 'text-align: right;', detail: true });
					table.columns.push({ label: 'Verifiziert', sort: true, width: 10, style: 'text-align: center;', detail: true });
					table.setConvert(list => {
						var d = [];
						for (var i = 0; i < list.length; i++) {
							var row = [];
							row.push(list[i].name);
							row.push({ text: list[i].total ? Number.parseFloat(list[i].total).toFixed(2) : '', attributes: { value: list[i].total } });
							row.push({ text: list[i].participations ? list[i].participations : '', attributes: { value: list[i].participations } });
							row.push({ text: list[i].participations && list[i].total ? Number.parseFloat(list[i].total / list[i].participations).toFixed(2) : '', attributes: { value: list[i].participations ? list[i].total / list[i].participations : null } });
							row.push(list[i].verified ? '✓' : {
								text: '+',
								attributes: {
									onopen: 'dialog.openVerifyEmail',
									contact: JSON.stringify({
										id: list[i].id,
										name: list[i].name
									})
								}
							});
							d.push(row);
						}
						return d;
					});
				}
				table.renderTable();
			});
		};
		var updateEvents = () => {
			api.events(events => {
				document.querySelectorAll('login [i="login"]').forEach(e => e.value = '');
				document.querySelector('login input-checkbox[name="login"]').setAttribute('checked', 'false');
				document.querySelector('button.add').style.display = 'block';
				document.querySelector('body>button[name="logoff"]').style.display = '';
				var groupname = document.querySelector('body>[name="groupname"]');
				groupname.innerText = api.clients[api.clientId].name;
				groupname.style.display = '';
				if (Object.keys(api.clients).length > 1) {
					groupname.style.cursor = 'pointer';
					groupname.onclick = () => {
						var popup = document.createElement('div');
						var selection = popup.appendChild(document.createElement('input-selection'));
						selection.setAttribute('value', api.clientId);
						var keys = Object.keys(api.clients);
						for (var i = 0; i < keys.length; i++)
							selection.add(keys[i], api.clients[keys[i]].name);
						document.dispatchEvent(new CustomEvent('popup', { detail: { body: popup } }));
						document.querySelector('dialog-popup').content().querySelector('input-selection').addEventListener('changed', () => {
							api.clientId = document.querySelector('dialog-popup').content().querySelector('input-selection').getAttribute('value');
							document.dispatchEvent(new CustomEvent('event'));
							document.dispatchEvent(new CustomEvent('contact'));
							document.dispatchEvent(new CustomEvent('popup'));
						});
					}
				}

				var table = document.querySelector('event sortable-table');
				table.list = events;
				table.style('tr.past{opacity:0.4;}');
				if (!table.columns.length) {
					table.setOpenDetail(dialog.openEvent);
					table.columns.push({ label: 'Datum', width: 30, detail: true });
					table.columns.push({ label: 'Ort', sort: true, width: 30, detail: true });
					table.columns.push({ label: 'Bemerkung', width: 40, detail: true });
					table.setConvert(list => {
						var d = [];
						for (var i = 0; i < list.length; i++) {
							var row = [];
							row.push(ui.formatTime(new Date(list[i].date.replace('+00:00', ''))));
							row.push(list[i].location.name);
							row.push({ attributes: { i: 'note_' + list[i].id }, text: list[i].note ? list[i].note.split('\n')[0] : '' });
							d.push(row);
						}
						return d;
					});
				}
				table.renderTable();
				var now = new Date();
				var trs = table.table().querySelectorAll('tbody tr');
				for (var i = 0; i < trs.length; i++) {
					var date = new Date(events[i].date.replace('+00:00', ''));
					if (date < now)
						trs[i].setAttribute('class', 'past');
					document.dispatchEvent(new CustomEvent('eventParticipation', { detail: { eventId: events[i].id, participants: events[i].contactEvents, type: 'read' } }));
				}

				var history = document.querySelector('history');
				history.textContent = '';
				var margin = 0;
				for (var i = 0; i < events.length; i++) {
					if (events[i].eventImages) {
						document.querySelector('element.history').style.display = '';
						for (var i2 = 0; i2 < events[i].eventImages.length; i2++) {
							var item = history.appendChild(document.createElement('item'));
							item.style.marginLeft = margin + '%';
							margin += 100;
							var click = event => {
								var container = document.createElement('div');
								container.style.overflow = 'auto';
								container.onclick = event => {
									var img = document.querySelector('dialog-popup').content().querySelector('img');
									var item = ui.parents(document.querySelector('img[src="' + img.getAttribute('src') + '"]'), 'item');
									if (event.offsetX - event.target.parentElement.scrollLeft >= img.parentElement.offsetWidth / 2 && item.nextElementSibling)
										img.setAttribute('src', item.nextElementSibling.querySelector('img').getAttribute('src'));
									else if (event.offsetX - event.target.parentElement.scrollLeft < img.parentElement.offsetWidth / 2 && item.previousElementSibling)
										img.setAttribute('src', item.previousElementSibling.querySelector('img').getAttribute('src'));
								};
								var img = container.appendChild(document.createElement('img'));
								img.src = event.target.parentElement.querySelector('img').getAttribute('src');
								document.dispatchEvent(new CustomEvent('popup', { detail: { body: container } }));
							};
							var img = item.appendChild(document.createElement('img'));
							img.setAttribute('src', 'med/' + events[i].eventImages[i2].image);
							img.onclick = click;
							var text = item.appendChild(document.createElement('text'));
							text.appendChild(document.createTextNode(ui.formatTime(new Date(events[i].date.replace('+00:00', '')))));
							text.appendChild(document.createElement('br'));
							text.appendChild(document.createTextNode(events[i].location.name));
							if (events[i].note) {
								text.appendChild(document.createElement('br'));
								text.appendChild(document.createTextNode(events[i].note));
							}
							text.onclick = click;
						}
					}
				}
				document.querySelector('event').style.display = '';
				document.querySelector('event').previousElementSibling.style.display = 'block';
				document.querySelector('login').style.display = 'none';
				document.querySelector('element.user').style.display = '';
			});
			if (!document.querySelector('user sortable-table').table().querySelector('tbody')?.childElementCount)
				updateCotacts();
		};
		document.addEventListener('eventParticipation', e => {
			var td = document.querySelector('event sortable-table').table().querySelector('td[i="note_' + e.detail.eventId + '"]');
			if (td) {
				var note = '';
				if (e.detail.participants.length)
					note += e.detail.participants.length + ' Teilnehmer';
				if (td.innerText?.trim()) {
					var s = td.innerText.replace(/^\d{1,4} Teilnehmer/, '').trim();
					if (s.indexOf(',') == 0)
						s = s.substring(1).trim();
					if (s)
						note += (note ? ', ' : '') + s;
				}
				td.innerText = note;
			}
			var participants = document.querySelector('dialog-popup').content().querySelector('value.participants');
			if (participants) {
				participants.querySelectorAll('participant').forEach(e => e.remove());
				var total = function (event) {
					if (event) {
						clearTimeout(event.target.getAttribute('contactEventPutId'));
						var exec = function () {
							document.querySelector('dialog-popup').content().querySelectorAll('value.participants input').forEach(
								input => {
									var x = input.value;
									var item = document.querySelector('dialog-popup').content().querySelector('value.participants item[i="' + ui.parents(input, 'participant').getAttribute('i') + '"]');
									if (x && !isNaN(x) && parseFloat(item.getAttribute('total')) != parseFloat(x)) {
										api.contactEventPut(item.getAttribute('contactEventId'), parseFloat(x), updateCotacts);
										item.setAttribute('total', parseFloat(x));
									}
								}
							);
						};
						input.setAttribute('contactEventPutId', setTimeout(exec, 100));
					}
					var sum = 0;
					var popup = document.querySelector('dialog-popup').content();
					popup.querySelectorAll('value.participants input').forEach(input => {
						const x = input.value?.replace(',', '.');
						if (x && !isNaN(x))
							sum += parseFloat(x);
					});
					popup.querySelector('total').innerText = Number.parseFloat('' + sum).toFixed(2).replace('.', ',');
				};
				for (var i = 0; i < e.detail.participants.length; i++) {
					var participant = participants.insertBefore(document.createElement('participant'), participants.querySelector('total'));
					participant.innerText = e.detail.participants[i].pseudonym;
					var input = participant.appendChild(document.createElement('input'));
					input.setAttribute('value', e.detail.participants[i].total ? Number.parseFloat(e.detail.participants[i].total).toFixed(2).replace('.', ',') : '');
					input.onkeyup = total;
					var remove = participant.appendChild(document.createElement('remove'));
					remove.innerText = '-';
					remove.setAttribute('onclick', 'action.participate(' + e.detail.participants[i].id + ',' + e.detail.eventId + ')');
					participant.setAttribute('i', e.detail.participants[i].id);
				}
				total();
			}
			if (e.detail.type != 'read')
				updateCotacts();
		});
		document.addEventListener('location', () => {
			var selection = document.querySelector('dialog-popup').content().querySelector('.event input-selection');
			if (selection)
				api.locations(locations => {
					selection.clear();
					for (var i = 0; i < locations.length; i++)
						selection.add(locations[i].id, locations[i].name + (locations[i].address ? ' · ' + locations[i].address.replace(/\n/g, ', ') : ''));
				})
			updateEvents();
		});
		document.addEventListener('contact', updateCotacts);
		document.addEventListener('event', updateEvents);
		if (document.location.search) {
			var popup = document.createElement('div');
			popup.appendChild(document.createElement('label')).innerText = 'Neues Passwort';
			var field = popup.appendChild(document.createElement('field'));
			var input = field.appendChild(document.createElement('input'));
			input.setAttribute('type', 'password');
			popup.appendChild(document.createElement('error'));
			input = field.appendChild(document.createElement('input'));
			input.setAttribute('type', 'hidden');
			input.setAttribute('value', document.location.search.substring(1));
			var div = popup.appendChild(document.createElement('div'));
			div.style.textAlign = 'center';
			var button = div.appendChild(document.createElement('button'));
			button.innerText = 'Passwort setzen!';
			button.onclick = action.loginResetPasswordPost;
			document.dispatchEvent(new CustomEvent('popup', { detail: { body: popup } }));
			history.pushState(null, null, window.location.origin);
		} else
			api.loginWithToken(success => {
				if (success)
					document.dispatchEvent(new CustomEvent('event'));
			});
		setTimeout(function () { document.querySelector('body>container').style.opacity = 1; }, 400);
	}

	static login() {
		var input = document.querySelectorAll('login input');
		if (input[0].value?.indexOf('@') < 1)
			document.querySelector('login error').innerText = 'Gib bitte Deine Email ein.';
		else if (!input[1].value)
			document.querySelector('login error').innerText = 'Ein Passwort wird benötigt.';
		else
			api.login(input[0].value, input[1].value, document.querySelector('login input-checkbox[name="login"]').getAttribute('checked') == 'true', e => document.dispatchEvent(new CustomEvent('event')));
	}

	static loginResetPassword() {
		var email = document.querySelector('login input[name="email"]').value;
		if (email.indexOf('@') < 1)
			document.querySelector('login error').innerText = 'Gib bitte Deine Email ein.';
		else
			api.loginVerify(email, e => {
				if (e == 'ok') {
					document.querySelectorAll('login [i="login"]').forEach(e => e.value = '');
					document.dispatchEvent(new CustomEvent('popup', { detail: { body: 'Eine Email wurde Dir zugesendet. Klicke auf den Link in der Email, um Dein Passwort neu zu setzen.' } }));
				} else
					document.querySelector('login error').innerText = e;
			});
	}

	static loginResetPasswordPost() {
		var popup = document.querySelector('dialog-popup').content();
		if (popup.querySelector('input[type="password"]').value.length > 5)
			api.loginVerifyPost(popup.querySelector('input[type="hidden"]').value,
				popup.querySelector('input[type="password"]').value, () => document.dispatchEvent(new CustomEvent('popup')));
		else
			popup.querySelector('error').innerText = 'Gib Bitte ein Passwort ein.';
	}

	static loginVerify(contact) {
		api.contactPatch(contact, () => {
			api.loginVerify(contact.email, e => {
				if (e == 'ok') {
					document.querySelector('user sortable-table').table().querySelector('td[contact*="\\"id\\":' + contact.id + ',"]').innerText = '...';
					document.dispatchEvent(new CustomEvent('popup', { detail: { body: 'Eine Email wurde gesendet. Nach dem Klick auf den Link in der Email ist der Benutzer verifiziert.' } }));
				} else
					document.querySelector('login error').innerText = e;
			});
		});

	}

	static loginDemo() {
		var input = document.querySelectorAll('login input');
		input[0].value = 'sepp@schafkopf.studio';
		input[1].value = 'Test1234';
		document.querySelector('login input-checkbox').setAttribute('checked', 'false');
		setTimeout(action.login, 500);
	}

	static createClient() {
		var legalCheck = document.querySelector('login input-checkbox[name="legal"]');
		legalCheck.style.color = '';
		var client = {
			note: document.querySelector('login textarea[name="clientNote"]')?.value,
			name: document.querySelector('login input[name="clientName"]').value,
			contacts: [
				{
					name: document.querySelector('login input[name="contactName"]').value,
					email: document.querySelector('login input[name="contactEmail"]').value
				}
			]
		};
		if (client.contacts[0].email?.indexOf('@') < 1)
			document.querySelector('login error.createClient').innerText = 'Gib bitte Deine Email ein.';
		else if (!client.name || !client.contacts[0].name)
			document.querySelector('login error.createClient').innerText = 'Vervollständige bitte die Daten.';
		else if (legalCheck.getAttribute('checked') != 'true') {
			document.querySelector('login error.createClient').innerText = 'Akzeptiere unsere ABGs.';
			legalCheck.style.color = 'red';
		} else
			api.createClient(client, () => {
				document.querySelectorAll('login [i="create"]').forEach(e => e.value = '');
				document.querySelector('login input-checkbox[name="legal"]').setAttribute('checked', 'false');
				document.dispatchEvent(new CustomEvent('popup', { detail: { body: 'Lieben Dank für Deine Registrierung, eine Email wurde Dir zugesendet. Bestätige diese, um in Deine neue Gruppe zu gelangen.' } }));
			});
	}

	static logoff() {
		api.loginDeleteToken();
		api.logoff();
		document.querySelectorAll('event sortable-table, user sortable-table').forEach(e => e.table().querySelector('tbody').textContent = '');
		document.querySelector('event').style.display = 'none';
		document.querySelector('event').previousElementSibling.style.display = '';
		document.querySelector('login').style.display = '';
		document.querySelector('history').scrollLeft = 0;
		document.querySelector('element.history').style.display = 'none';
		document.querySelector('history').textContent = '';
		document.querySelector('element.user').style.display = 'none';
		document.querySelector('body>[name="logoff"]').style.display = 'none';
		var groupname = document.querySelector('body>[name="groupname"]');
		groupname.innerText = '';
		groupname.style.display = 'none';
		groupname.style.cursor = 'default';
		groupname.onclick = null;

	}

	static imageNavigate(next) {
		var history = document.querySelector('history');
		var x = history.scrollLeft, width = document.querySelector('history').offsetWidth;
		history.scrollTo({ left: (parseInt(x / width) + (next ? 1 : -1)) * width, behavior: 'smooth' });
	}

	static eventImageDelete(id) {
		var e = document.querySelector('dialog-popup').content().querySelector('value.pictures [i="' + id + '"]');
		if (e.querySelector('delete'))
			api.eventImageDelete(id, () => {
				e.remove();
				document.dispatchEvent(new CustomEvent('event'));
			});
		else
			e.appendChild(document.createElement('delete')).innerText = 'Löschen?';
	}

	static eventPost() {
		var popup = document.querySelector('dialog-popup').content();
		var date = popup.querySelector('element.event input-date').getAttribute('value');
		var locationId = popup.querySelector('element.event input-selection').getAttribute('value');
		if (date && locationId)
			api.eventPost(
				{
					id: popup.querySelector('element.event input[name="id"]')?.value,
					date: date,
					note: popup.querySelector('element.event input').value
				}, locationId,
				() => {
					document.dispatchEvent(new CustomEvent('popup'));
					document.dispatchEvent(new CustomEvent('event'));
				}
			);
	}

	static contactPatch() {
		var popup = document.querySelector('dialog-popup').content();
		api.contactPatch(
			{
				name: popup.querySelector('element.contact input[name="name"]').value,
				email: popup.querySelector('element.contact input[name="email"]').value
			},
			id => {
				popup.querySelectorAll('element.contact input').forEach(e => e.value = '');
				document.dispatchEvent(new CustomEvent('contact', { detail: { id: id } }));
			}
		);
	}

	static locationPost() {
		var popup = document.querySelector('dialog-popup').content();
		var location = {
			address: popup.querySelector('element.location textarea[name="address"]').value,
			id: popup.querySelector('element.location input[name="id"]')?.value,
			name: popup.querySelector('element.location input[name="name"]').value,
			url: popup.querySelector('element.location input[name="url"]').value,
			phone: popup.querySelector('element.location input[name="phone"]').value,
			email: popup.querySelector('element.location input[name="email"]').value
		};
		api.locationPost(location,
			id => {
				popup.querySelectorAll('element.location input,element.location textarea').forEach(e => e.value = '');
				location.id = id;
				document.dispatchEvent(new CustomEvent('location', { detail: location }));
			}
		);
	}

	static participate(contactId, eventId) {
		var popup = document.querySelector('dialog-popup').content();
		var fireEvent = type => {
			var participants = [];
			var selected = popup.querySelectorAll('value[i="' + eventId + '"] item.selected');
			for (var i = 0; i < selected.length; i++)
				participants.push({ id: selected[i].getAttribute('i'), pseudonym: selected[i].innerText, total: selected[i].getAttribute('total') });
			document.dispatchEvent(new CustomEvent('eventParticipation', { detail: { eventId: eventId, participants: participants, type: type } }));
		};
		var e = popup.querySelector('value[i="' + eventId + '"] item[i="' + contactId + '"]');
		if (e.getAttribute('contactEventId')) {
			api.contactEventDelete(e.getAttribute('contactEventId'), () => {
				e.classList.remove('selected');
				e.removeAttribute('contactEventId');
				fireEvent('remove');
			});
		} else {
			api.contactEventPost(contactId, eventId, id => {
				e.classList.add('selected');
				e.setAttribute('contactEventId', id);
				fireEvent('add');
			});
		}
	}
}

window.onresize = function () {
	var mobile = parseFloat(getComputedStyle(document.body).fontSize) * 50 < window.innerWidth ? 0 : 5;
	var diagonal = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2));
	var fontSize = (Math.min(10 + diagonal / 160, 26) + mobile);
	if (mobile && fontSize > 18)
		fontSize = 18;
	document.body.style.fontSize = fontSize + 'px';
	var imageWidth = 1536, imageHeight = 1024;
	var imageStyle = document.querySelector('body element.intro>img').style;
	if (window.innerHeight / imageHeight * imageWidth > window.innerWidth) {
		imageStyle.height = window.innerHeight;
		imageStyle.width = 'fit-content';
		imageStyle.marginTop = 0;
	} else {
		imageStyle.width = window.innerWidth;
		imageStyle.height = 'fit-content';
		imageStyle.marginTop = window.innerHeight - window.innerWidth / imageWidth * imageHeight;
	}
}

customElements.define('dialog-popup', DialogPopup);
customElements.define('input-date', InputDate);
customElements.define('input-checkbox', InputCheckbox);
customElements.define('input-image', InputImage);
customElements.define('input-rating', InputRating);
customElements.define('input-selection', InputSelection);
customElements.define('progress-bar', ProgressBar);
customElements.define('sortable-table', SortableTable);

window.api = api;
window.action = action;
window.dialog = dialog;
window.ui = ui;