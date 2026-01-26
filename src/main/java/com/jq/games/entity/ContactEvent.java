package com.jq.games.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class ContactEvent extends BaseEntity {
	@ManyToOne
	private Contact contact;
	@ManyToOne
	@JsonBackReference
	private Event event;
	private Float total;

	public Float getTotal() {
		return this.total;
	}

	public void setTotal(final Float total) {
		this.total = total;
	}

	public Contact getContact() {
		return this.contact;
	}

	public void setContact(final Contact contact) {
		this.contact = contact;
	}

	public Event getEvent() {
		return this.event;
	}

	public void setEvent(final Event event) {
		this.event = event;
	}
}