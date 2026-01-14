package com.jq.games.service;

import java.math.BigInteger;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jq.games.entity.Client;
import com.jq.games.entity.Event;
import com.jq.games.entity.EventImage;
import com.jq.games.repository.Repository;

@Service
public class EventService {
	@Autowired
	private Repository repository;

	public List<Event> list(final Client client) {
		return this.repository.list(
				"from Event event where event.contact.client.id=" + client.getId() + " order by date desc",
				Event.class);
	}

	public Event one(final BigInteger id) {
		return this.repository.one(Event.class, id);
	}

	public void save(final Event event) {
		this.repository.save(event);
	}

	public void save(final EventImage eventImage) {
		this.repository.save(eventImage);
	}

	public void delete(final EventImage eventImage) {
		this.repository.delete(eventImage);
	}
}