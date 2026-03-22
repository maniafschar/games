package com.jq.games.api;

import java.math.BigInteger;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jq.games.entity.Contact;
import com.jq.games.entity.Ticket;
import com.jq.games.repository.Repository;
import com.jq.games.service.AdminService;

@RestController
@RequestMapping("api")
public class ApplicationApi {
	@Autowired
	protected Repository repository;

	@Autowired
	private AdminService adminService;

	@PostMapping("ticket")
	public void ticket(@RequestBody final Ticket ticket) {
		this.adminService.createTicket(ticket);
	}

	protected Contact verifyContactClient(final BigInteger contactId, final BigInteger clientId) {
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
}