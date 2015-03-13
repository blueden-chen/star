package net.core.utils;


import com.google.gson.JsonParser;

/**
 * Created by chenwj on 3/14/15.
 */
public class JsonParserFactory {
    private JsonParserFactory() {
    }

    private static class Holder {
        private final static JsonParser instance = new JsonParser();
    }

    public static JsonParser getInstance() {
        return Holder.instance;
    }
}
