package com.example.tutoring.Call;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
//@EnableWebSocket
public class SocketIOConfig {//implements WebSocketConfigurer {

//    @Override
//    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//        registry.addHandler(new VideoCallHandler(), "/video-call")
//                .addInterceptors(new JwtHandshakeInterceptor())
//                .setAllowedOrigins("*");
//    }
}

