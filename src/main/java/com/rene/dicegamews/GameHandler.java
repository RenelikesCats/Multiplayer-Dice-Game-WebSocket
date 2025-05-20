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
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

import static com.rene.dicegamews.Type.*;

@Component
public class GameHandler extends TextWebSocketHandler {
    private final Integer MAX_PLAYER = 2;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, Integer> playerRolls = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Timer timer = new Timer();


    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (sessions.size() == MAX_PLAYER) {
            sendMessage(session, new WebSocketMessage(LOBBYFULL));
            session.close();
            return;
        }
        String username = getUsername(session);
        sessions.put(username, session);
        sendMessageToAll(new WebSocketMessage(JOIN, username));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = getUsername(session);
        sessions.remove(username);
        playerRolls.clear();

        if (sessions.size() < MAX_PLAYER) {
            sendMessageToAll(new WebSocketMessage(LEAVE, username));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            Type type = valueOf(jsonNode.get("type").asText());
            String username = getUsername(session);

            switch (type) {
                case ROLL -> {
                    if (sessions.size() == 1) {
                        sendMessage(session, new WebSocketMessage(NOTENOUGHPLAYERS));
                        return;
                    }
                    Random random = new Random();
                    int roll1 = random.nextInt(6) + 1;
                    int roll2 = random.nextInt(6) + 1;
                    int rolledTotal = roll1 + roll2;

                    playerRolls.put(username, rolledTotal);
                    sendMessage(session, new WebSocketMessage(ROLL));

                    timer.schedule(new TimerTask() { // delay simulation (550ms)
                        @Override
                        public void run() {
                            sendMessage(session, new WebSocketMessage(WAIT, roll1, roll2));
                            sendMessageToSession(session, new WebSocketMessage(ROLLOTHERPLAYER, roll1, roll2));
                            if (playerRolls.size() == 2) {
                                determineWinnerAndSendResult();
                                playerRolls.clear();
                            }
                        }
                    }, 550);
                }
            }
        } catch (IOException ex) {
            System.out.println(ex.getMessage());
        }
    }

    private void determineWinnerAndSendResult() {
        if (playerRolls.size() == 2) {
            Map.Entry<String, Integer> player1Entry = playerRolls.entrySet().iterator().next();
            Map.Entry<String, Integer> player2Entry = null;
            for (Map.Entry<String, Integer> entry : playerRolls.entrySet()) {
                if (!entry.getKey().equals(player1Entry.getKey())) {
                    player2Entry = entry;
                    break;
                }
            }
            if (player2Entry != null) {
                String player1 = player1Entry.getKey();
                int roll1 = player1Entry.getValue();
                String player2 = player2Entry.getKey();
                int roll2 = player2Entry.getValue();

                String resultMessageText;
                String winner = null;
                if (roll1 > roll2) {
                    winner = player1;
                    resultMessageText = player1 + " rolled a " + roll1 + " and wins against " + player2 + "'s " + roll2 + ".";
                } else if (roll2 > roll1) {
                    winner = player2;
                    resultMessageText = player2 + " rolled a " + roll2 + " and wins against " + player1 + "'s " + roll1 + ".";
                } else {
                    resultMessageText = player1 + " and " + player2 + " both rolled a " + roll1 + ". It's a tie!";
                }

                sendMessageToAll(new WebSocketMessage(RESULT, winner, resultMessageText));
            }
        }
    }

    private void sendMessageToSession(WebSocketSession senderSession, WebSocketMessage message) {
        String jsonMessage = convertToJson(message);
        for (WebSocketSession session : sessions.values()) {
            if (!session.getId().equals(senderSession.getId())) {
                sendMessageInternal(session, jsonMessage);
            }
        }
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

    private void sendMessage(WebSocketSession session, WebSocketMessage message) {
        String jsonMessage = convertToJson(message);
        sendMessageInternal(session, jsonMessage);
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