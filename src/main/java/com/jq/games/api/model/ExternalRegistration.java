package com.jq.games.api.model;

import java.util.Map;

public class ExternalRegistration extends AbstractRegistration {
	private Map<String, String> user;
	private From from;
	private String publicKey;

	public enum From {
		Facebook,
		Apple
	}

	public Map<String, String> getUser() {
		return this.user;
	}

	public void setUser(final Map<String, String> user) {
		this.user = user;
	}

	public From getFrom() {
		return this.from;
	}

	public void setFrom(final From from) {
		this.from = from;
	}

	public String getPublicKey() {
		return this.publicKey;
	}

	public void setPublicKey(final String publicKey) {
		this.publicKey = publicKey;
	}

	@Override
	public String toString() {
		return super.toString() +
				"\nfrom: " + this.getFrom() +
				"\nuser: " + this.getUser();
	}
}