package com.jq.games.api;

import java.lang.reflect.Field;
import java.math.BigInteger;
import java.util.Base64;
import java.util.List;

import org.apache.commons.mail.EmailException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jq.games.entity.BaseEntity;
import com.jq.games.entity.Client;
import com.jq.games.entity.Contact;
import com.jq.games.entity.ContactEvent;
import com.jq.games.entity.Event;
import com.jq.games.entity.EventImage;
import com.jq.games.entity.Feedback;
import com.jq.games.entity.Location;
import com.jq.games.entity.Ticket;
import com.jq.games.repository.Repository;
import com.jq.games.repository.Repository.Attachment;
import com.jq.games.service.AdminService;
import com.jq.games.service.AuthenticationService;
import com.jq.games.service.ContactService;
import com.jq.games.service.EventService;
import com.jq.games.service.FeedbackService;
import com.jq.games.service.LocationService;
import com.jq.games.util.Encryption;

@RestController
@RequestMapping("api")
public class ApplicationApi {
	public static final int STATUS_PROCESSING_PDF = 566;

	@Autowired
	private ContactService contactService;

	@Autowired
	private EventService eventService;

	@Autowired
	private LocationService locationService;

	@Autowired
	private FeedbackService feedbackService;

	@Autowired
	private AuthenticationService authenticationService;

	@Autowired
	private Repository repository;

	@Autowired
	private AdminService adminService;

	@GetMapping("authentication/login")
	public Contact authentication(final String email, @RequestHeader final String password,
			@RequestHeader final String salt) {
		return this.filter(
				this.authenticationService.login(Encryption.decryptBrowser(email), password, salt));
	}

	@GetMapping("authentication/token")
	public String authenticationToken(final String token, final String publicKey) {
		return this.authenticationService.token2User(publicKey, Encryption.decryptBrowser(token));
	}

	@DeleteMapping("authentication/token")
	public void authenticationTokenDelete(final String token) {
		this.authenticationService.tokenDelete(Encryption.decryptBrowser(token));
	}

	@PutMapping("authentication/token")
	public String authenticationTokenPut(@RequestHeader final BigInteger contactId, final String publicKey) {
		return this.authenticationService.tokenRefresh(this.repository.one(Contact.class, contactId), publicKey);
	}

	@PostMapping("authentication/create")
	public void authenticationCreatePost(@RequestBody final Client client) {
		this.authenticationService.createClient(client);
	}

	@PostMapping("authentication/verify")
	public void authenticationVerifyPost(final String token, final String password) {
		this.authenticationService.recoverVerifyEmail(Encryption.decryptBrowser(token),
				Encryption.decryptBrowser(password));
	}

	@GetMapping("authentication/verify")
	public String authenticationVerify(final String email) throws EmailException {
		return this.authenticationService.recoverSendEmail(Encryption.decryptBrowser(email));
	}

	@GetMapping("contact/{id}")
	public Contact contact(@PathVariable final BigInteger id) {
		return this.filter(this.contactService.one(id));
	}

	@PatchMapping("contact")
	public BigInteger contactPatch(@RequestHeader final BigInteger contactId, @RequestHeader final BigInteger clientId,
			@RequestBody final Contact contact) throws EmailException {
		if (contact.getId() == null) {
			contact.setClient(this.verifyContactClient(contactId, clientId).getClient());
			this.contactService.save(contact);
			return contact.getId();
		}
		final Contact c = this.repository.one(Contact.class, contact.getId());
		if (contact.getEmail() != null)
			c.setEmail(contact.getEmail());
		if (contact.getName() != null)
			c.setName(contact.getName());
		if (contact.getImage() != null)
			c.setImage(contact.getImage());
		if (contact.getNote() != null)
			c.setNote(contact.getNote());
		this.contactService.save(c);
		return c.getId();
	}

	@GetMapping("contact")
	public List<Contact> contacts(@RequestHeader final BigInteger clientId) {
		return this.filter(this.contactService.list(this.repository.one(Client.class, clientId)));
	}

	@GetMapping("contact/client")
	public List<Client> contectClients(@RequestHeader final BigInteger contactId) {
		return this.contactService.listClient(contactId);
	}

	@GetMapping("contact/event/{eventId}")
	public List<ContactEvent> contactEvent(@PathVariable final BigInteger eventId) {
		return this.filter(this.contactService.listEvent(eventId));
	}

	@PostMapping("contact/event/{contactId}/{eventId}")
	public BigInteger contactEventPost(@RequestHeader final BigInteger contactId,
			@PathVariable(name = "contactId") final BigInteger contactIdEvent, @PathVariable final BigInteger eventId) {
		final ContactEvent contactEvent = new ContactEvent();
		contactEvent.setContact(this.repository.one(Contact.class, contactIdEvent));
		contactEvent.setEvent(this.repository.one(Event.class, eventId));
		this.contactService.save(contactEvent);
		return contactEvent.getId();
	}

	@PutMapping("contact/event/{id}/{total}")
	public void contactEventPut(@PathVariable final BigInteger id, @PathVariable final float total) {
		final ContactEvent contactEvent = this.repository.one(ContactEvent.class, id);
		contactEvent.setTotal(total);
		this.contactService.save(contactEvent);
	}

	@DeleteMapping("contact/event/{contactEventId}")
	public void contactEventDelete(@PathVariable final BigInteger contactEventId) {
		this.contactService.delete(this.repository.one(ContactEvent.class, contactEventId));
	}

	@GetMapping("location/{id}")
	public Location location(@PathVariable final BigInteger id) {
		return this.filter(this.locationService.one(id));
	}

	@PostMapping("location")
	public BigInteger locationPost(@RequestHeader final BigInteger contactId, @RequestBody final Location location) {
		location.setContact(this.repository.one(Contact.class, contactId));
		this.locationService.save(location);
		return location.getId();
	}

	@PutMapping("location")
	public BigInteger locationPut(@RequestHeader final BigInteger contactId, @RequestBody final Location location) {
		if (location.getId() != null) {
			final Location l = this.repository.one(Location.class, location.getId());
			l.setAddress(location.getAddress());
			l.setEmail(location.getEmail());
			l.setImage(location.getImage());
			l.setName(location.getName());
			l.setNote(location.getNote());
			l.setPhone(location.getPhone());
			l.setUrl(location.getUrl());
			this.locationService.save(l);
		}
		return location.getId();
	}

	@GetMapping("location")
	public List<Location> locations(@RequestHeader final BigInteger contactId) {
		return this.filter(
				this.locationService.list(this.repository.one(Contact.class, contactId).getClient()));
	}

	@GetMapping("feedback/{id}")
	public Feedback feedback(@PathVariable final BigInteger id) {
		return this.filter(this.feedbackService.one(id));
	}

	@PostMapping("feedback")
	public void feedbackPost(@RequestBody final Feedback feedback) throws EmailException {
		this.feedbackService.save(feedback);
	}

	@GetMapping("feedback")
	public List<Feedback> feedbacks(@RequestHeader final BigInteger contactId) {
		return this.filter(
				this.feedbackService.list(this.repository.one(Contact.class, contactId).getClient()));
	}

	@GetMapping("event")
	public List<Event> events(@RequestHeader final BigInteger clientId) {
		return this.filter(this.eventService.list(this.repository.one(Client.class, clientId)));
	}

	@GetMapping("event/{id}")
	public Event event(@PathVariable final BigInteger id) {
		return this.filter(this.eventService.one(id));
	}

	@PostMapping("event/{locationId}")
	public BigInteger eventPost(@RequestHeader final BigInteger contactId, @RequestHeader final BigInteger clientId,
			@PathVariable final BigInteger locationId, @RequestBody final Event event) {
		event.setContact(this.verifyContactClient(contactId, clientId));
		event.setLocation(this.repository.one(Location.class, locationId));
		this.eventService.save(event);
		return event.getId();
	}

	@PostMapping("event/image/{eventId}/{type}")
	public BigInteger eventImagePost(@PathVariable final BigInteger eventId,
			@PathVariable final String type, @RequestBody final EventImage eventImage) {
		eventImage.setEvent(this.repository.one(Event.class, eventId));
		eventImage.setImage(Attachment.createImage(type, Base64.getDecoder().decode(eventImage.getImage())));
		this.eventService.save(eventImage);
		return eventImage.getId();
	}

	@DeleteMapping("event/image/{eventImageId}")
	public void eventImageDelete(@PathVariable final BigInteger eventImageId) {
		this.eventService.delete(this.repository.one(EventImage.class, eventImageId));
	}

	@PutMapping("event/{locationId}")
	public BigInteger eventPut(@RequestHeader final BigInteger contactId,
			@PathVariable final BigInteger locationId, @RequestBody final Event event) {
		if (event.getId() != null) {
			final Contact contact = this.repository.one(Event.class, event.getId()).getContact();
			if (contact.getId().equals(contactId)) {
				event.setContact(contact);
				event.setLocation(this.repository.one(Location.class, locationId));
				this.eventService.save(event);
			}
		}
		return event.getId();
	}

	@PostMapping("ticket")
	public void ticket(@RequestBody final Ticket ticket) {
		this.adminService.createTicket(ticket);
	}

	private Contact verifyContactClient(final BigInteger contactId, final BigInteger clientId) {
		final Contact contact = this.repository.one(Contact.class, contactId);
		if (contact.getClient().getId().equals(clientId))
			return contact;
		final List<Contact> list = this.repository.list(
				"from Contact where email='" + contact.getEmail() + "' and id<>" + contact.getId(), Contact.class);
		for (final Contact c : list) {
			if (c.getClient().getId().equals(clientId))
				return c;
		}
		throw new IllegalArgumentException(
				"Access to client " + clientId + " for user " + contactId + " " + contact.getName() + " rejected");
	}

	private <T> T filter(final T data) {
		if (data instanceof Contact)
			this.filterContact((Contact) data);
		else if (data instanceof List) {
			for (final Object element : (List<?>) data)
				this.filter(element);
		} else {
			for (final Field field : data.getClass().getDeclaredFields()) {
				if (BaseEntity.class.equals(field.getType().getGenericSuperclass())) {
					field.setAccessible(true);
					try {
						this.filter(field.get(data));
					} catch (final Exception e) {
						throw new RuntimeException(e);
					}
				}
			}
		}
		return data;
	}

	private void filterContact(final Contact contact) {
		contact.setEmail(null);
		contact.setPassword(null);
		contact.setPasswordReset(null);
	}
}