package com.jq.games.api.model;

import java.math.BigInteger;

public abstract class AbstractRegistration {
	private String language;
	private String ip;
	private BigInteger clientId;

	public String getIp() {
		return this.ip;
	}

	public void setIp(final String ip) {
		this.ip = ip;
	}

	public String getLanguage() {
		return this.language;
	}

	public void setLanguage(final String language) {
		this.language = language;
	}

	public BigInteger getClientId() {
		return this.clientId;
	}

	public void setClientId(final BigInteger clientId) {
		this.clientId = clientId;
	}
}