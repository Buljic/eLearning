package com.example.tutoring.WebSocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer
{
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry)
    {
        //ovdje idu URLovi na koje ce se klijenti povezivati da bi uspostavili kao vezu ...tj klijenti na frontend pa fr
        //ontend na ovaj endpoint
        registry.addEndpoint("/api/chatTo").setAllowedOriginPatterns("*").withSockJS();//TODO implementuj specificni endpoint
        registry.addEndpoint("/api/chatGroup").setAllowedOriginPatterns("*").withSockJS(); //na ovom endpointu se povezujemo z a uspostavljanje ws veze

        registry.addEndpoint("/api/videoCall").setAllowedOriginPatterns("*").withSockJS();

        registry.addEndpoint("/api/ws/videoCall").setAllowedOriginPatterns("*").withSockJS();

    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry)
    {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
        registry.enableSimpleBroker("/queue");
    }
}
