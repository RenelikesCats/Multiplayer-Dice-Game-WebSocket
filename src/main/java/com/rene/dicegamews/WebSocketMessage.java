package com.rene.dicegamews;

public class WebSocketMessage {
    private Type type;
    private String username;
    private String resultMessage;
    private int roll1;
    private int roll2;

    public WebSocketMessage(Type type) {
        this.type = type;
    }

    public WebSocketMessage(Type type, int roll1, int roll2) {
        this.type = type;
        this.roll1 = roll1;
        this.roll2 = roll2;
    }


    public WebSocketMessage(Type type, String username) {
        this.type = type;
        this.username = username;
    }

    public WebSocketMessage(Type type, String username, String resultMessage) {
        this.type = type;
        this.username = username;
        this.resultMessage = resultMessage;
    }

    public Type getType() {
        return type;
    }

    public String getUsername() {
        return username;
    }

    public String getResultMessage() {
        return resultMessage;
    }

    public int getRoll1() {
        return roll1;
    }

    public int getRoll2() {
        return roll2;
    }
}
