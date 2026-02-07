package com.jq.games.service;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.jq.games.entity.Client;
import com.jq.games.entity.Contact;
import com.jq.games.entity.ContactEvent;
import com.jq.games.entity.Event;
import com.jq.games.entity.EventImage;
import com.jq.games.entity.Location;
import com.jq.games.entity.Log;
import com.jq.games.entity.Ticket;
import com.jq.games.repository.Repository;
import com.jq.games.repository.Repository.Attachment;
import com.jq.games.util.Encryption;

@Service
public class AdminService {
	@Autowired
	private Repository repository;

	@Value("${app.admin.buildScript}")
	private String buildScript;

	@Value("${spring.datasource.username}")
	private String user;

	@Value("${spring.datasource.password}")
	private String password;

	public static class AdminData {
		private final List<Log> logs;
		private final List<Ticket> tickets;
		private final String search;

		private AdminData(final String search, final List<Log> logs, final List<Ticket> tickets) {
			super();
			this.search = search;
			this.logs = logs;
			this.tickets = tickets;
		}

		public List<Log> getLogs() {
			return this.logs;
		}

		public List<Ticket> getTickets() {
			return this.tickets;
		}

		public String getSearch() {
			return this.search;
		}
	}

	public AdminData init() {
		final String search = "createdAt>cast('" + Instant.now().minus(Duration.ofDays(1)).toString().substring(0, 10)
				+ "' as timestamp) and uri not like '/sc/%'";
		return new AdminData(search,
				this.repository.list("from Log where " + search + " order by id desc", Log.class),
				this.repository.list("from Ticket where deleted=false order by id desc", Ticket.class));
	}

	public List<Log> log(final String search) {
		this.validateSearch(search);
		return this.repository.list("from Log where " + search + " order by id desc", Log.class);
	}

	public String build(final String type) throws IOException {
		final ProcessBuilder pb = new ProcessBuilder(
				"status".equals(type) ? new String[] { "/usr/bin/bash", "-c", "ps -eF|grep java" }
						: this.buildScript.replace("{type}", type).split(" "));
		pb.redirectErrorStream(true);
		return IOUtils.toString(pb.start().getInputStream(), StandardCharsets.UTF_8);
	}

	public void deleteTicket(final BigInteger id) {
		final Ticket ticket = this.repository.one(Ticket.class, id);
		ticket.setDeleted(true);
		this.repository.save(ticket);
	}

	public void createTicket(final Ticket ticket) {
		if (this.repository
				.list("from Ticket where note like '" + ticket.getNote().replaceAll("\n", "_").replaceAll("'", "_")
						+ "'", Ticket.class)
				.size() == 0)
			this.repository.save(ticket);
	}

	private void validateSearch(final String search) {
		final StringBuilder s = new StringBuilder(search.toLowerCase());
		int p, p2;
		while ((p = s.indexOf("'")) > -1) {
			p2 = p;
			do {
				p2 = s.indexOf("'", p2 + 1);
			} while (p2 > 0 && "\\".equals(s.substring(p2 - 1, p2)));
			if (p2 < 0)
				throw new IllegalArgumentException(
						"Invalid quote in search: " + search);
			s.delete(p, p2 + 1);
		}
		if (s.indexOf(";") > -1 || s.indexOf("union") > -1 || s.indexOf("update") > -1
				|| s.indexOf("insert") > -1 || s.indexOf("delete") > -1)
			throw new IllegalArgumentException(
					"Invalid expression in search: " + search);
	}

	@Scheduled(cron = "0 * * * * *")
	private void backup() throws InterruptedException, IOException {
		new ProcessBuilder("./backup.sh", this.user, this.password,
				"client client_contacts contact contact_event contact_token event event_image feedback location log ticket")
				.start().waitFor();
	}

	@Scheduled(cron = "0 * * * * *")
	private void demoData() {
		Client client = this.repository.one(Client.class, BigInteger.ONE);
		final StringBuffer result = new StringBuffer();
		if (client == null) {
			client = new Client();
			client.setId(BigInteger.ONE);
			client.setName("Schfkopfgruppe Solln");
			client.setNote("Wir treffen uns mindestens eimmal die Woche. Es ist zunftig lustig und bierernst! ;)");
			this.repository.save(client);
			result.append("client\n");
		}
		final List<String> contacts = Arrays.asList(
				"Sepp|sepp@schafkopf.studio|true",
				"Toni|toni@schafkopf.studio",
				"Babsi", "Max", "Franzi", "Resi", "Korbi", "Eli", "Lisa");
		final List<String> locations = Arrays.asList(
				"Brauhausstubn Solln|Herterichstr. 46\n81479 München|https://www.brauhaus-stubn-solln.de/|089 / 72 44 75 93|info@brauhaus-stubn-solln.dea",
				"Break|Pullacher Straße 26\n82049 Pullach\n|https://www.restaurantbreak.de|089-80959087|info@restaurantbreak.de",
				"Zum Sollner Hirschen|Sollner Strasse 43, 81479 München|https://zumsollnerhirschen.de|089 / 200 79 474|info@zumsollnerhirschen.de");
		for (final String data : contacts) {
			final String[] s = data.split("\\|");
			if (this.repository.list("from Contact where name='" + s[0] + "' and client.id=1", Contact.class)
					.size() == 0) {
				final Contact contact = new Contact();
				contact.setName(s[0]);
				if (s.length > 1)
					contact.setEmail(s[1]);
				if (s.length > 2) {
					contact.setVerified(true);
					contact.setPassword(Encryption.encryptDB("Test1234"));
				}
				contact.setClient(client);
				this.repository.save(contact);
				result.append(contact.getName() + "\n");
			}
		}
		final Contact sepp = this.repository
				.list("from Contact where email='sepp@schafkopf.studio' and client.id=1", Contact.class).get(0);
		for (final String data : locations) {
			final String[] s = data.split("\\|");
			if (this.repository.list("from Location where name='" + s[0] + "' and contact.client.id=1", Location.class)
					.size() == 0) {
				final Location location = new Location();
				location.setName(s[0]);
				if (s.length > 1)
					location.setAddress(s[1]);
				if (s.length > 2)
					location.setUrl(s[2]);
				if (s.length > 3)
					location.setPhone(s[3]);
				if (s.length > 4)
					location.setEmail(s[4]);
				location.setContact(sepp);
				this.repository.save(location);
				result.append(location.getName() + "\n");
			}
		}
		final Location location = this.repository
				.list("from Location where name='Brauhausstubn Solln' and contact.client.id=1", Location.class).get(0);
		LocalDateTime date = LocalDateTime.of(LocalDate.now().getYear(), LocalDate.now().getMonth(),
				LocalDate.now().getDayOfMonth(), 17, 30);
		while (date.getDayOfWeek() != DayOfWeek.WEDNESDAY)
			date = date.minus(Duration.ofDays(1));
		this.createEvent(date, sepp, location, contacts, result);
		date = date.plus(Duration.ofDays(1));
		this.createEvent(date, sepp, location, contacts, result);
		date = date.plus(Duration.ofDays(6));
		this.createEvent(date, sepp, location, contacts, result);
		date = date.plus(Duration.ofDays(1));
		this.createEvent(date, sepp, location, contacts, result);
		if (result.length() > 0)
			this.repository.save(new Ticket("DemoData\n" + result.toString().trim()));
	}

	private void createEvent(final LocalDateTime date, final Contact contact, final Location location,
			final List<String> contacts, final StringBuffer result) {
		final LocalDate localDate = date.atZone(ZoneId.of("UTC")).toLocalDate();
		if (this.repository
				.list("from Event where year(date)=" + localDate.getYear() + " and month(date)="
						+ localDate.getMonth().getValue()
						+ " and day(date)=" + localDate.getDayOfMonth() + " and contact.id=" + contact.getId()
						+ " and location.id=" + location.getId(), Event.class)
				.size() > 0)
			return;
		final Event event = new Event();
		event.setContact(contact);
		event.setLocation(location);
		event.setDate(new Date(date.toEpochSecond(ZoneOffset.of("Z")) * 1000));
		this.repository.save(event);
		final boolean past = date.isBefore(LocalDateTime.now());
		for (final String data : contacts) {
			if (Math.random() > (past ? 0.5 : 0.8)) {
				final ContactEvent contactEvent = new ContactEvent();
				contactEvent.setEvent(event);
				contactEvent.setContact(this.repository
						.list("from Contact where name='" + data.split("\\|")[0] + "' and client.id=1",
								Contact.class)
						.get(0));
				this.repository.save(contactEvent);
			}
		}
		if (past) {
			final int daysBetween = date.getYear() == LocalDate.now().getYear()
					? LocalDate.now().getDayOfYear() - date.getDayOfYear()
					: 31 - date.getDayOfMonth() + LocalDate.now().getDayOfMonth();
			for (int i = 0; i < 3; i++) {
				final EventImage eventImage = new EventImage();
				eventImage.setEvent(event);
				try {
					eventImage.setImage(
							Attachment.createImage("jpg",
									IOUtils.toByteArray(this.getClass()
											.getResourceAsStream(
													"/image/demo" + (i + 1 + 3 * (6 - daysBetween)) + ".jpg"))));
					this.repository.save(eventImage);
				} catch (final Exception ex) {
					throw new RuntimeException("image demo" + (i + 1 + 3 * (6 - daysBetween)) + ".jpg not found\n"
							+ date + "\n" + daysBetween, ex);
				}
			}
		}
		result.append(event.getDate() + "\n");
	}
}