export { api };

class api {
	static url = '{placeholderServer}';
	static clientId = 1;
	static contactId = 1;

	static event(id, success) {
		api.ajax({
			url: api.url + '/rest/api/event/' + id,
			success: success
		});
	}

	static events(success) {
		api.ajax({
			url: api.url + '/rest/api/event',
			success: success
		});
	}

	static eventPost(event, locationId, success) {
		api.ajax({
			url: api.url + '/rest/api/event/' + locationId,
			method: event.id ? 'PUT' : 'POST',
			body: event,
			success: success
		});
	}

	static eventImageDelete(eventImageId, success) {
		api.ajax({
			url: api.url + '/rest/api/event/image/' + eventImageId,
			method: 'DELETE',
			success: success
		});
	}

	static eventImagePost(eventId, type, data, success) {
		api.ajax({
			url: api.url + '/rest/api/event/image/' + eventId + '/' + type,
			method: 'POST',
			body: { image: data },
			success: success
		});
	}

	static locations(success) {
		api.ajax({
			url: api.url + '/rest/api/location',
			success: success
		});
	}

	static locationPost(location, success) {
		api.ajax({
			url: api.url + '/rest/api/location',
			method: location.id ? 'PUT' : 'POST',
			body: location,
			success: success
		});
	}

	static contacts(success) {
		api.ajax({
			url: api.url + '/rest/api/contact',
			success: success
		});
	}

	static contactPost(contact, success) {
		api.ajax({
			url: api.url + '/rest/api/contact',
			method: 'POST',
			body: contact,
			success: success
		});
	}

	static contactEventPost(contactId, eventId, success) {
		api.ajax({
			url: api.url + '/rest/api/contact/event/' + contactId + '/' + eventId,
			method: 'POST',
			success: success
		});
	}

	static contactEventPut(id, total) {
		api.ajax({
			url: api.url + '/rest/api/contact/event/' + id + '/' + total,
			method: 'PUT'
		});
	}

	static contactEventDelete(id, success) {
		api.ajax({
			url: api.url + '/rest/api/contact/event/' + id,
			method: 'DELETE',
			success: success
		});
	}

	static ajax(param) {
		if (!this.contactId)
			return;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (!param.noProgressBar)
					api.progressBarHide();
				if (xhr.status >= 200 && xhr.status < 300) {
					if (param.success) {
						var response = xhr.responseText;
						if (response && (response.indexOf('{') === 0 || response.indexOf('[') === 0)) {
							try {
								response = JSON.parse(xhr.responseText)
							} catch (e) {
							}
						}
						param.success(response);
					}
				} else {
					if (xhr.status < 500) {
						var xhrError = new XMLHttpRequest();
						xhrError.open('POST', api.url + '/rest/api/ticket', true);
						xhrError.setRequestHeader('Content-Type', 'application/json');
						xhrError.send(JSON.stringify({ note: xhr.status + ' ' + xhr.responseURL + '\n' + xhr.response }));
					}
					if (param.error) {
						xhr.param = param;
						param.error(xhr);
					} else
						document.getElementsByTagName('error')[0].innerHTML = 'An error occurred while processing your request. Please try again later.';
				}
			}
		};
		xhr.open(param.method ? param.method : 'GET', param.url, true);
		xhr.setRequestHeader('clientId', this.clientId);
		xhr.setRequestHeader('contactId', this.contactId);
		if (typeof param.body == 'string')
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		else if (param.body && !(param.body instanceof FormData)) {
			xhr.setRequestHeader('Content-Type', 'application/json');
			param.body = JSON.stringify(param.body);
		}
		if (!param.noProgressBar)
			api.progressBarShow(xhr);
		xhr.send(param.body);
	}

	static progressBarHide() {
		var e = document.getElementsByTagName('progressbar')[0];
		if (e.style.opacity == 1) {
			setTimeout(function () { e.style.display = null; }, 500);
			e.style.opacity = null;
		} else
			e.style.display = null;
	}

	static progressBarShow(xhr) {
		document.getElementsByTagName('error')[0].innerHTML = '';
		var e = document.getElementsByTagName('progressbar')[0].style;
		e.display = 'block';
		setTimeout(function () { if (!xhr || xhr.readyState != 4) e.opacity = 1; }, 100);
	}
}