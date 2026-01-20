package com.jq.games;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class GamesApplication {
	public static void main(final String[] args) {
		new SpringApplicationBuilder(GamesApplication.class).run(args);
	}
}