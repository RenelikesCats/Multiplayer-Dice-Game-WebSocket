package com.rene.dicegamews;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import static com.rene.dicegamews.Type.*;

@Component
public class GameHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();


    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = getUsername(session);
        System.out.println(username);
        sessions.put(username, session);
        sendMessageToAll(new WebSocketMessage(JOIN, username));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = getUsername(session);
        sessions.remove(username);
        sendMessageToAll(new WebSocketMessage(LEAVE, username));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            Type type = Type.valueOf(jsonNode.get("type").asText());
            switch (type) {
                case ROLL -> {
                    var random = new Random();
                    int roll = random.nextInt(6) + 1;
                    //TODO
                    // Dice roll game logic and send result to other player
                }
            }
        } catch (IOException ex) {
            System.out.println(ex.getMessage());
        }
    }

    private void sendMessage(WebSocketSession session, WebSocketMessage message) {
        String jsonMessage = convertToJson(message);
        sendMessageInternal(session, jsonMessage);
    }

    private void sendMessageToAll(WebSocketMessage message) {
        String jsonMessage = convertToJson(message);
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(jsonMessage));
                } catch (IOException e) {
                    System.out.println(e.getMessage());
                }
            }
        }
    }

    private void sendMessageInternal(WebSocketSession session, String jsonMessage) {
        if (session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(jsonMessage));
            } catch (IOException e) {

            }
        }
    }

    private String convertToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (IOException e) {
            return "";
        }
    }

    private String getUsername(WebSocketSession session) {
        return UriComponentsBuilder.fromUri(session.getUri())
                .build()
                .getQueryParams()
                .getFirst("username");
    }
}