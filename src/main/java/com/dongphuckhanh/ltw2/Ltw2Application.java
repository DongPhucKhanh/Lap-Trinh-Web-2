package com.dongphuckhanh.ltw2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class Ltw2Application {

	public static void main(String[] args) {
		SpringApplication.run(Ltw2Application.class, args);
	}

}
