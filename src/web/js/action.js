import { api } from "./api";
import { DialogPopup } from "./element/DialogPopup";
import { InputCheckbox } from "./element/InputCheckbox";
import { InputDate } from "./element/InputDate";
import { InputImage } from "./element/InputImage";
import { InputRating } from "./element/InputRating";
import { InputSelection } from "./element/InputSelection";
import { ProgressBar } from "./element/ProgressBar";
import { ui } from "./ui";

export { action };

class action {
	static init() {
		window.onresize();
		var updateCotacts = () => {
			api.contacts(contacts => {
				var tbody = document.querySelector('user tbody');
				tbody.textContent = '';
				for (var i = 0; i < contacts.length; i++) {
					var tr = tbody.appendChild(document.createElement('tr'));
					tr.onclick = event => {
						document.querySelector('user tr.selected')?.classList.remove('selected');
						ui.parents(event.target, 'tr').classList.add('selected');
					};
					tr.setAttribute('i', contacts[i].id);
					tr.appendChild(document.createElement('td')).innerText = contacts[i].name;
					tr.appendChild(document.createElement('td')).innerText =
						contacts[i].total ? Number.parseFloat(contacts[i].total).toFixed(2) : '';
					var td = tr.appendChild(document.createElement('td'));
					if (contacts[i].verified)
						td.innerText = '✓';
					else {
						td.innerText = '+';
						td.setAttribute('contact', JSON.stringify({
							id: contacts[i].id,
							name: contacts[i].name
						}));
						td.onclick = event => {
							var popup = document.createElement('div');
							popup.appendChild(document.createElement('label')).innerText = 'Email';
							var field = popup.appendChild(document.createElement('field'));
							var input = field.appendChild(document.createElement('input'));
							input.setAttribute('type', 'email');
							input = field.appendChild(document.createElement('input'));
							input.setAttribute('type', 'hidden');
							input.value = event.target.getAttribute('contact');
							var div = popup.appendChild(document.createElement('div'));
							div.style.textAlign = 'center';
							var button = div.appendChild(document.createElement('button'));
							button.innerText = 'Benutzer verifizieren';
							button.style.zIndex = 2;
							button.onclick = event => {
								event.preventDefault();
								event.stopPropagation();
								var popup = document.querySelector('dialog-popup').content();
								var contact = JSON.parse(popup.querySelector('input[type="hidden"]').value);
								contact.email = popup.querySelector('input[type="email"]').value;
								if (contact.email.indexOf('@') > 0)
									action.loginVerify(contact);
								else
									document.getElementsByTagName('error')[0].innerText = 'Gib bitte Deine Email ein.';
							};
							document.dispatchEvent(new CustomEvent('popup', { detail: { body: popup } }));
						};
					}
					tr.appendChild(document.createElement('td')).innerText = contacts[i].note || '';
					for (var i2 = 0; i2 < tr.childElementCount; i2++) {
						tr.children[i2].style.width = tbody.previousElementSibling.children[0].children[i2].style.width;
						tr.children[i2].style.textAlign = tbody.previousElementSibling.children[0].children[i2].style.textAlign;
						if (!tr.children[i2].onclick)
							tr.children[i2].setAttribute('onclick', 'action.openContact(' + contacts[i].id + ')');

					}
				}
			});
		};
		var updateEvents = () => {
			api.events(e => {
				document.querySelectorAll('login [i="login"]').forEach(e => e.value = '');
				document.querySelector('body container tabHeader tab').innerText = 'Events';
				document.querySelector('login input-checkbox[name="login"]').setAttribute('checked', 'false');
				document.querySelector('button[name="logout"]').style.display = 'block';
				document.querySelector('button.add').style.display = 'block';
				document.querySelector('body>container>element>header>h2').innerText = api.clients[api.clientId].name;
				var tbody = document.querySelector('event tbody');
				tbody.textContent = '';
				var now = new Date();
				for (var i = 0; i < e.length; i++) {
					var tr = tbody.appendChild(document.createElement('tr'));
					var date = new Date(e[i].date.replace('+00:00', ''));
					if (date < now)
						tr.setAttribute('class', 'past');
					tr.setAttribute('i', e[i].id);
					tr.setAttribute('onclick', 'action.openEvent(' + e[i].id + ')');
					tr.appendChild(document.createElement('td')).innerText = ui.formatTime(date);
					tr.appendChild(document.createElement('td')).innerText = e[i].contact.name;
					tr.appendChild(document.createElement('td')).innerText = e[i].location.name;
					tr.appendChild(document.createElement('td')).setAttribute('type', 'note');
					if (e[i].note)
						tr.setAttribute('note', encodeURIComponent(e[i].note.split('\n')[0]));
					document.dispatchEvent(new CustomEvent('eventParticipation', { detail: { eventId: e[i].id, participants: e[i].contactEvents, type: 'read' } }));
					for (var i2 = 0; i2 < tr.childElementCount; i2++)
						tr.children[i2].style.width = tbody.previousElementSibling.children[0].children[i2].style.width;
				}
				document.querySelector('event').style.display = '';
				document.querySelector('login').style.display = 'none';
			});
			if (!document.querySelector('user tbody').childElementCount)
				updateCotacts();
		};
		document.addEventListener('eventParticipation', e => {
			var row = document.querySelector('event tr[i="' + e.detail.eventId + '"]');
			if (row) {
				var note = '';
				if (e.detail.participants.length)
					note += e.detail.participants.length + ' Teilnehmer';
				if (row.getAttribute('note'))
					note += (note ? ', ' : '') + decodeURIComponent(row.getAttribute('note'));
				row.querySelector('td[type="note"]').innerText = note;
			}
			var participants = document.querySelector('dialog-popup').content().querySelector('value.participants');
			if (participants) {
				participants.querySelectorAll('participant').forEach(e => e.remove());
				var total = function () {
					var sum = 0;
					var popup = document.querySelector('dialog-popup').content();
					popup.querySelectorAll('value.participants input').forEach(input => {
						var item = popup.querySelector('item[i="' + input.parentElement.getAttribute('i') + '"]');
						var x = input.value?.replace(',', '.');
						if (x && !isNaN(x)) {
							if (item.getAttribute('total') != x) {
								item.setAttribute('total', x);
								api.contactEventPut(item.getAttribute('contactEventId'), x, updateCotacts);
							}
							sum += parseFloat(x);
						}
					});
					popup.querySelector('total').innerText = Number.parseFloat('' + sum).toFixed(2).replace('.', ',');
				};
				for (var i = 0; i < e.detail.participants.length; i++) {
					var participant = participants.insertBefore(document.createElement('participant'), participants.querySelector('total'));
					participant.innerText = e.detail.participants[i].name;
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
				api.locations(e => {
					selection.clear();
					for (var i = 0; i < e.length; i++)
						selection.add(e[i].id, e[i].name + (e[i].address ? ' · ' + e[i].address.replace(/\n/g, ', ') : ''));
				})
			updateEvents();
		});
		document.addEventListener('event', updateEvents);
		if (document.location.search) {
			var popup = document.createElement('div');
			popup.appendChild(document.createElement('label')).innerText = 'Neues Passwort';
			var field = popup.appendChild(document.createElement('field'));
			var input = field.appendChild(document.createElement('input'));
			input.setAttribute('type', 'password');
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
			document.getElementsByTagName('error')[0].innerText = 'Gib bitte Deine Email ein.';
		else if (!input[1].value)
			document.getElementsByTagName('error')[0].innerText = 'Ein Passwort wird benötigt.';
		else
			api.login(input[0].value, input[1].value, document.querySelector('login input-checkbox[name="login"]').getAttribute('checked') == 'true', e => document.dispatchEvent(new CustomEvent('event')));
	}

	static loginResetPassword() {
		var email = document.querySelector('login input[name="email"]').value;
		if (email.indexOf('@') < 1)
			document.getElementsByTagName('error')[0].innerText = 'Gib bitte Deine Email ein.';
		else
			api.loginVerify(email, e => {
				if (e == 'ok') {
					document.querySelectorAll('login [i="login"]').forEach(e => e.value = '');
					document.dispatchEvent(new CustomEvent('popup', { detail: { body: 'Eine Email wurde Dir zugesendet. Klicke auf den Link in der Email, um Dein Passwort neu zu setzen.' } }));
				} else
					document.getElementsByTagName('error')[0].innerText = e;
			});
	}

	static loginResetPasswordPost() {
		var popup = document.querySelector('dialog-popup').content();
		api.loginVerifyPost(popup.querySelector('input[type="hidden"]').value,
			popup.querySelector('input[type="password"]').value, () => document.dispatchEvent(new CustomEvent('popup')));
	}
	static loginVerify(contact) {
		api.contactPatch(contact, () => {
			api.loginVerify(contact.email, e => {
				if (e == 'ok') {
					document.querySelector('user tbody [i="' + contact.id + '"]').value = '...';
					document.dispatchEvent(new CustomEvent('popup', { detail: { body: 'Eine Email wurde gesendet. Nach dem Klick auf den Link in der Email ist der Benutzer verifiziert.' } }));
				} else
					document.getElementsByTagName('error')[0].innerText = e;
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
			document.getElementsByTagName('error')[0].innerText = 'Gib bitte Deine Email ein,';
		else if (!client.name || !client.contacts[0].name)
			document.getElementsByTagName('error')[0].innerText = 'Vervollständige bitte die Daten.';
		else if (legalCheck.getAttribute('checked') != 'true')
			legalCheck.style.color = 'red';
		else
			api.createClient(client, () => {
				document.querySelectorAll('login [i="create"]').forEach(e => e.value = '');
				document.querySelector('login input-checkbox[name="legal"]').setAttribute('checked', 'false');
				document.dispatchEvent(new CustomEvent('popup', { detail: { body: 'Lieben Dank für Deine Registrierung, eine Email wurde Dir zugesendet. Bestätige diese, um in Deine neue Gruppe zu gelangen.' } }));
			});
	}

	static logoff() {
		api.loginDeleteToken();
		api.logoff();
		document.querySelectorAll('event tbody, user tbody').forEach(e => e.textContent = '');
		document.querySelector('event').style.display = 'none';
		document.querySelector('login').style.display = '';
		document.querySelector('button[name="logout"]').style.display = '';
		document.querySelector('button.add').style.display = '';
		document.querySelector('body>container>element>header h2').innerText = '';
		document.querySelector('body container tabHeader tab').innerText = 'Login';
	}

	static add(event) {
		var e = document.querySelector('popup');
		if (e.style.transform && e.style.transform.indexOf('1') > 0) {
			if (event) {
				ui.on(e, 'transitionend', () => {
					e.style.transform = '';
					action.add(event);
				}, true);
				e.style.transform = 'scale(0)';
				return;
			} else
				return;
		}
		api.locations(e => {
			var popup = document.createElement('div');
			popup.textContent = '';
			var tabHeader = popup.appendChild(document.createElement('tabHeader'));
			var tab = tabHeader.appendChild(document.createElement('tab'));
			tab.setAttribute('onclick', 'ui.showTab(event)');
			tab.setAttribute('class', 'selected');
			tab.innerText = 'Event';
			tab = tabHeader.appendChild(document.createElement('tab'));
			tab.setAttribute('onclick', 'ui.showTab(event)');
			tab.innerText = 'Location';
			tab = tabHeader.appendChild(document.createElement('tab'));
			tab.setAttribute('onclick', 'ui.showTab(event)');
			tab.innerText = 'User';
			var container = popup.appendChild(document.createElement('tabBody'))
				.appendChild(document.createElement('container'));

			var createField = function (element, label, name, type, value) {
				element.appendChild(document.createElement('label')).innerText = label;
				var field = element.appendChild(document.createElement('field'));
				var input = field.appendChild(document.createElement(type ? type : 'input'));
				input.setAttribute('name', name);
				if (value)
					type == 'textarea' ? input.innerText = value : input.setAttribute('value', value);
				return input;
			};
			var createButton = function (element, action) {
				var div = element.appendChild(document.createElement('div'));
				div.style.textAlign = 'center';
				var button = div.appendChild(document.createElement('button'));
				button.innerText = 'Speichern';
				button.setAttribute('onclick', action);
			};

			var element = container.appendChild(document.createElement('element'));
			element.setAttribute('class', 'event');
			var inputDate = createField(element, 'Datum', 'date', 'input-date', event?.date);
			inputDate.setAttribute('minuteStep', 15);
			inputDate.setAttribute('min', new Date().toISOString());
			createField(element, 'Ort', 'location', 'input-selection', event?.location.id);
			createField(element, 'Bemerkung', 'note', 'input', event?.note);
			if (event?.id) {
				var inputId = element.appendChild(document.createElement('input'));
				inputId.setAttribute('type', 'hidden');
				inputId.setAttribute('name', 'id');
				inputId.setAttribute('value', event.id);
			}
			createButton(element, 'action.eventPost()');
			document.dispatchEvent(new CustomEvent('location'));

			element = container.appendChild(document.createElement('element'));
			element.setAttribute('class', 'location');
			createField(element, 'Name', 'name', 'input', event?.location.name);
			createField(element, 'Adresse', 'address', 'textarea', event?.location.address);
			createField(element, 'URL', 'url', 'input', event?.location.url).setAttribute('type', 'url');
			createField(element, 'Telefon', 'phone', 'input', event?.location.phone).setAttribute('type', 'tel');
			createField(element, 'Email', 'email', 'input', event?.location.email).setAttribute('type', 'email');
			if (event?.id) {
				var inputId = element.appendChild(document.createElement('input'));
				inputId.setAttribute('type', 'hidden');
				inputId.setAttribute('name', 'id');
				inputId.setAttribute('value', event.location.id);
			}
			createButton(element, 'action.locationPost()');

			element = container.appendChild(document.createElement('element'));
			element.setAttribute('class', 'contact');
			createField(element, 'Name', 'name');
			createField(element, 'Email', 'email');
			createButton(element, 'action.contactPatch()');

			document.dispatchEvent(new CustomEvent('popup', { detail: { body: popup } }));
		});
	}

	static openContact(id) {
	}

	static openEvent(id) {
		document.querySelector('event tr.selected')?.classList.remove('selected');
		document.querySelector('event tr[i="' + id + '"]').classList.add('selected');
		api.event(id, event => {
			var futureEvent = new Date(event.date.replace('+00:00', '')) > new Date();
			var popup = document.createElement('div');
			popup.appendChild(document.createElement('label')).innerText = 'Datum';
			popup.appendChild(document.createElement('value')).innerText = ui.formatTime(new Date(event.date.replace('+00:00', '')));
			popup.appendChild(document.createElement('label')).innerText = 'Ort';
			if (futureEvent)
				popup.appendChild(document.createElement('value')).innerHTML = event.location.name
					+ (event.location.address ? '<br/>' + event.location.address : '')
					+ (event.location.phone ? '<br/><a href="tel:' + event.location.phone.replace(/\D/g, '') + '">' + event.location.phone + '</a>' : '')
					+ (event.location.url ? '<br/><a href="' + event.location.url + '" target="_blank">' + event.location.url + '</a>' : '')
					+ (event.location.email ? '<br/><a href="mailto:' + event.location.email + '">' + event.location.email + '</a>' : '');
			else
				popup.appendChild(document.createElement('value')).innerText = event.location.name;
			if (event.note) {
				popup.appendChild(document.createElement('label')).innerText = 'Bemerkung';
				popup.appendChild(document.createElement('value')).innerHTML = event.note.replace(/\n/g, '<br/>');
			}
			popup.appendChild(document.createElement('label')).innerText = 'Teilnehmer';
			var participants = popup.appendChild(document.createElement('value'));
			participants.style.width = '100%';
			if (!futureEvent) {
				participants.setAttribute('class', 'participants');
				participants.appendChild(document.createElement('total'));
				participants = participants.appendChild(document.createElement('div'));
				participants.style.opacity = 0.5;
				popup.appendChild(document.createElement('label')).innerText = 'Bilder';
				var pictures = popup.appendChild(document.createElement('value'));
				pictures.classList.add('pictures');
				var buttonImage = pictures.appendChild(document.createElement('input-image'));
				buttonImage.style.right = '0.2em';
				buttonImage.style.top = '0.2em';
				buttonImage.setAttribute('max', 1000);
				var addImage = (id, data) => {
					var image = pictures.appendChild(document.createElement('div')).appendChild(document.createElement('img'));
					image.src = data;
					image.parentElement.setAttribute('i', id);
					image.parentElement.setAttribute('onclick', 'action.eventImageDelete(' + id + ')');
				}
				buttonImage.setSuccess(e => api.eventImagePost(id, e.type, e.data.substring(e.data.indexOf(',') + 1), eventImageId => addImage(eventImageId, e.data)));
				for (var i = 0; i < event.eventImages?.length; i++)
					addImage(event.eventImages[i].id, 'med/' + event.eventImages[i].image);
			}
			if (api.contactId == event.contact.id) {
				var div = popup.appendChild(document.createElement('div'));
				div.style.textAlign = 'center';
				var button = div.appendChild(document.createElement('button'));
				button.innerText = 'Bearbeiten';
				button.setAttribute('onclick', 'action.add(' + JSON.stringify({ id: event.id, date: event.date, note: event.note, location: event.location }) + ')');
				button.style.float = 'right';
			}
			api.contacts(contacts => {
				var p = {}, participantList = [];
				for (var i = 0; i < event.contactEvents.length; i++) {
					p[event.contactEvents[i].contact.id] = event.contactEvents[i];
					participantList.push({ id: event.contactEvents[i].contact.id, name: event.contactEvents[i].contact.name, total: event.contactEvents[i].total });
				}
				for (var i = 0; i < contacts.length; i++) {
					var item = participants.appendChild(document.createElement('item'));
					item.innerText = contacts[i].name;
					item.setAttribute('i', contacts[i].id);
					item.setAttribute('onclick', 'action.participate(' + contacts[i].id + ',' + id + ')');
					if (p[contacts[i].id]) {
						item.setAttribute('contactEventId', p[contacts[i].id].id);
						item.setAttribute('total', p[contacts[i].id].total);
						item.setAttribute('class', 'selected');
					}
				}
				document.dispatchEvent(new CustomEvent('eventParticipation', { detail: { eventId: id, participants: participantList, type: 'read' } }));
				document.dispatchEvent(new CustomEvent('popup', { detail: { body: popup } }));
			});
		});
	}

	static eventImageDelete(id) {
		var e = document.querySelector('dialog-popup').content().querySelector('value.pictures [i="' + id + '"]');
		if (e.querySelector('delete'))
			api.eventImageDelete(id, () => e.remove());
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
			() => {
				popup.querySelectorAll('element.contact input').forEach(e => e.value = '');
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
			var selected = popup.querySelectorAll('value item.selected');
			for (var i = 0; i < selected.length; i++)
				participants.push({ id: selected[i].getAttribute('i'), name: selected[i].innerText, total: selected[i].getAttribute('total') });
			document.dispatchEvent(new CustomEvent('eventParticipation', { detail: { eventId: eventId, participants: participants, type: type } }));
		};
		var e = popup.querySelector('item[i="' + contactId + '"]');
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
	var imageStyle = document.querySelector('body>container>element>img').style;
	if (window.innerHeight / imageHeight * imageWidth > window.innerWidth) {
		imageStyle.height = window.innerHeight;
		imageStyle.width = null;
		imageStyle.marginTop = null;
	} else {
		imageStyle.width = window.innerWidth;
		imageStyle.height = null;
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

window.api = api;
window.action = action;
window.ui = ui;