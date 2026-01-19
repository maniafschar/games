package com.jq.games.repository.listener;

import org.springframework.stereotype.Component;

import com.jq.games.entity.Contact;

@Component
public class ContactListener extends AbstractRepositoryListener<Contact> {
	@Override
	public void postPersist(final Contact contact) throws IllegalArgumentException {
	}

	@Override
	public void postUpdate(final Contact contact) {
	}
}