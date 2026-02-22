package com.example.tutoring.Other;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    private static final Logger logger = LoggerFactory.getLogger(JacksonConfig.class);

@Bean
public ObjectMapper objectMapper() {
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.findAndRegisterModules();
    objectMapper.registerModule(new JavaTimeModule());
    logger.info("Jackson ObjectMapper configured with JavaTimeModule");
    return objectMapper;
}
@Bean
public JavaTimeModule javaTimeModule() {
    logger.info("Configuring JavaTimeModule for Jackson");
    return new JavaTimeModule();
}
}

