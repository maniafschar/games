package com.jq.games.api.model;

public class InternalRegistration extends AbstractRegistration {
	private boolean agb;
	private int time;
	private String email;
	private String name;

	public boolean isAgb() {
		return this.agb;
	}

	public void setAgb(final boolean agb) {
		this.agb = agb;
	}

	public int getTime() {
		return this.time;
	}

	public void setTime(final int time) {
		this.time = time;
	}

	public String getEmail() {
		return this.email;
	}

	public void setEmail(final String email) {
		this.email = email;
	}

	public String getName() {
		return this.name;
	}

	public void setName(final String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return super.toString() +
				"\nclientId: " + this.getClientId() +
				"\nip: " + this.getIp() +
				"\nlanguage: " + this.getLanguage() +
				"\nagb: " + this.isAgb() +
				"\nemail: " + this.getEmail() +
				"\nname: " + this.getName() +
				"\ntime: " + this.getTime();
	}
}