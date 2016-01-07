package cwj.utils;

import com.google.gson.Gson;

/**
 * Created by chenwj on 3/10/15.
 */
public class JsonConstructFactory {

    private JsonConstructFactory() {
    }

    private static class Holder {
        private final static Gson instance = new Gson();
    }

    public static Gson getInstance() {
        return Holder.instance;
    }
}
