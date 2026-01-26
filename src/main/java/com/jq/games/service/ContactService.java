package com.jq.games.service;

import java.math.BigInteger;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jq.games.entity.Client;
import com.jq.games.entity.Contact;
import com.jq.games.entity.ContactEvent;
import com.jq.games.repository.Repository;

@Service
public class ContactService {
	@Autowired
	private Repository repository;

	public List<Contact> list(final Client client) {
		return this.repository.list("from Contact where client.id=" + client.getId() + " order by name", Contact.class);
	}

	public List<Client> listClient(final BigInteger contactId) {
		final Contact contact = this.repository.one(Contact.class, contactId);
		final List<Contact> list = this.repository.list("from Contact where email='" + contact.getEmail() + "'",
				Contact.class);
		return this.repository.list(
				"from Client where id in ("
						+ list.stream().map(e -> "" + e.getClient().getId()).collect(Collectors.joining(",")) + ")",
				Client.class);
	}

	public List<ContactEvent> listEvent(final BigInteger eventId) {
		return this.repository.list("from ContactEvent where event.id=" + eventId, ContactEvent.class);
	}

	public Contact one(final BigInteger id) {
		return this.repository.one(Contact.class, id);
	}

	public void delete(final ContactEvent contactEvent) {
		this.repository.delete(contactEvent);
	}

	public void save(final ContactEvent contactEvent) {
		this.repository.save(contactEvent);
	}

	public void save(final Contact contact) {
		this.repository.save(contact);
	}
}