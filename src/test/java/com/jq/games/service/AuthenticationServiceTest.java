package com.jq.games.service;

import org.junit.jupiter.api.Test;

import com.jq.games.util.Encryption;

public class AuthenticationServiceTest {
	@Test
	public void decrypt() {
		// given
		final String token = "";

		// when
		final String password = Encryption.decryptDB(token);

		// then
		System.out.println(password);
	}
}
