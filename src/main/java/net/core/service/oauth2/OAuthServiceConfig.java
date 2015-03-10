package net.core.service.oauth2;

/**
 * Created by chenwj on 3/8/15.
 */

import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * 服务配置类，配置向第三方平台请求的服务配置项
 */
@Scope("prototype")
@Lazy(true)
@Component("oAuthServiceConfig")
public class OAuthServiceConfig {

//以下信息在消费平台配置的与第三方平台注册的要保持完全一致
    private String apiKey; //在第三方平台注册后生成的消费平台应用id
    private String apiSecret;//在第三方平台注册后生成的消费平台应用secret
    private String callback;//第三方平台在用户登录及授权操作通过后，消费平台的回调地址。
    private String scope;//申请的权限范围，可选
    private Class apiClass;//记载获取第三方校验信息api地址的类，大平台的api类多在scribe中有封装

	/**
	 *	getters & setters
	 */

    public OAuthServiceConfig() {
    }

    public OAuthServiceConfig(String apiKey, String apiSecret, String callback, String scope,
                              Class apiClass) {
        super();
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.callback = callback;
        this.scope = scope;
        this.apiClass = apiClass;
    }


    public String getApiKey() {
        return apiKey;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public String getCallback() {
        return callback;
    }

    public String getScope() {
        return scope;
    }

    public Class getApiClass() {
        return apiClass;
    }
}
