import { api } from "./api";
import { dialog } from "./dialog";
import { ui } from "./ui";

export { listener };

class listener {
	static updateCotacts() {
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
	}

	static updateEvents() {
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
			listener.updateCotacts();
	}
	static init() {
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
				var totalId;
				var total = () => {
					clearTimeout(totalId);
					var exec = function () {
						document.querySelector('dialog-popup').content().querySelectorAll('value.participants input').forEach(
							input => {
								var x = input.value;
								var item = document.querySelector('dialog-popup').content().querySelector('value.participants item[i="' + ui.parents(input, 'participant').getAttribute('i') + '"]');
								if (x && !isNaN(x) && parseFloat(item.getAttribute('total')) != parseFloat(x)) {
									api.contactEventPut(item.getAttribute('contactEventId'), parseFloat(x), listener.updateCotacts);
									item.setAttribute('total', parseFloat(x));
								}
							}
						);
					};
					totalId = setTimeout(exec, 100);
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
				listener.updateCotacts();
		});
		document.addEventListener('location', () => {
			var selection = document.querySelector('dialog-popup').content().querySelector('.event input-selection');
			if (selection)
				api.locations(locations => {
					selection.clear();
					for (var i = 0; i < locations.length; i++)
						selection.add(locations[i].id, locations[i].name + (locations[i].address ? ' · ' + locations[i].address.replace(/\n/g, ', ') : ''));
				})
			listener.updateEvents();
		});
		document.addEventListener('contact', listener.updateCotacts);
		document.addEventListener('event', listener.updateEvents);
	}
}