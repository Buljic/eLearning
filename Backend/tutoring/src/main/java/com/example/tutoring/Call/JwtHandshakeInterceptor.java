package com.example.tutoring.Call;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.context.support.HttpRequestHandlerServlet;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.WebUtils;

import java.util.Map;

public class JwtHandshakeInterceptor {//implements HandshakeInterceptor {

//    @Override
//    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
//        // Extract JWT from cookie and put it into attributes
//        if (request instanceof HttpServletRequest) {
//            HttpServletRequest servletRequest = (HttpServletRequest) request;
//            jakarta.servlet.http.Cookie cookie = WebUtils.getCookie(servletRequest, "JWT");
//            if (cookie != null) {
//                attributes.put("token", cookie.getValue());
//            }
//        }
//        return true;
//    }
//
//    @Override
//    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {
//        // No implementation needed
//    }
}
