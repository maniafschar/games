package com.jq.games.api;

import java.math.BigInteger;
import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jq.games.entity.Client;
import com.jq.games.entity.Contact;
import com.jq.games.entity.Event;
import com.jq.games.entity.EventImage;
import com.jq.games.repository.Repository.Attachment;
import com.jq.games.service.EventService;
import com.jq.games.util.Utilities;

@RestController
@RequestMapping("api/event")
public class EventApi extends ApplicationApi {
	@Autowired
	private EventService eventService;

	@GetMapping("list")
	public List<Event> getList(@RequestHeader final BigInteger clientId) {
		return Utilities.filter(this.eventService.list(this.repository.one(Client.class, clientId)));
	}

	@GetMapping("{id}")
	public Event get(@PathVariable final BigInteger id) {
		return Utilities.filter(this.eventService.one(id));
	}

	@DeleteMapping("{id}")
	public void delete(@PathVariable final BigInteger id) {
		this.eventService.delete(id);
	}

	@GetMapping("contact/{contactId}")
	public List<Event> getContact(@PathVariable final BigInteger contactId) {
		return Utilities.filter(this.eventService.listContact(contactId));
	}

	@PostMapping
	public BigInteger post(@RequestHeader final BigInteger contactId, @RequestHeader final BigInteger clientId,
			@RequestBody final Event event) {
		event.setContact(this.verifyContactClient(contactId, clientId));
		this.eventService.save(event);
		return event.getId();
	}

	@PostMapping("image/{eventId}/{type}")
	public BigInteger postImage(@PathVariable final BigInteger eventId,
			@PathVariable final String type, @RequestBody final EventImage eventImage) {
		eventImage.setEvent(this.repository.one(Event.class, eventId));
		eventImage.setImage(Attachment.createImage(type, Base64.getDecoder().decode(eventImage.getImage())));
		this.eventService.save(eventImage);
		return eventImage.getId();
	}

	@DeleteMapping("image/{eventImageId}")
	public void deleteImage(@PathVariable final BigInteger eventImageId) {
		this.eventService.delete(this.repository.one(EventImage.class, eventImageId));
	}

	@PutMapping
	public BigInteger put(@RequestHeader final BigInteger contactId, @RequestHeader final BigInteger clientId,
			@RequestBody final Event event) {
		if (event.getId() != null) {
			final Contact contact = this.repository.one(Event.class, event.getId()).getContact();
			if (contact.getId().equals(this.verifyContactClient(contactId, clientId).getId())) {
				event.setContact(contact);
				this.eventService.save(event);
			}
		}
		return event.getId();
	}
}