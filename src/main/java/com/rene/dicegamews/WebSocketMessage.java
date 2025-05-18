package com.rene.dicegamews;

public class WebSocketMessage {
    private Type type;
    private String username;

    public WebSocketMessage(Type type, String username) {
        this.type = type;
        this.username = username;
    }

    public Type getType() {
        return type;
    }

    public String getUsername() {
        return username;
    }
}
