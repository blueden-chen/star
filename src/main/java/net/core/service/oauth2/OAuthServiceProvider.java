package net.core.service.oauth2;

/**
 * Created by chenwj on 3/8/15.
 */

import org.scribe.builder.ServiceBuilder;
import org.scribe.oauth.OAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 服务提供类，通过获取服务配置类中的配置，生成发送给第三方平台的Request
 */
public class OAuthServiceProvider {

    private final static Logger logger = LoggerFactory.getLogger(OAuthServiceProvider.class);
    private OAuthServiceConfig config;

    public OAuthServiceProvider() {
    }

    public OAuthServiceProvider(OAuthServiceConfig config) {
        this.config = config;
    }

    public OAuthService getService() {
        return new ServiceBuilder().provider(config.getApiClass())
                .apiKey(config.getApiKey())
                .apiSecret(config.getApiSecret())
                .callback(config.getCallback())
                .scope(config.getScope())
                .build();
    }
}
