package net.core.web;

/**
 * Created by chenwj on 3/9/15.
 */

import net.core.service.oauth2.GithubService;
import net.core.service.oauth2.OAuthServiceProvider;
import net.core.utils.JsonConstructFactory;
import org.scribe.model.Response;
import org.scribe.model.Token;
import org.scribe.oauth.OAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;

import static net.core.common.Constants.USER_URL;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final Token EMPTY_TOKEN = null;

    public static final ThreadLocal<GithubService> githubService = new ThreadLocal<>();

    @Inject
    private OAuthServiceProvider githubServiceProvider;
    private OAuthService service;

    /**
     * 登陆入口方法
     *
     * @return
     */
    @RequestMapping(value = "/login", method = RequestMethod.GET)
    @ResponseBody
    public String login() {
        logger.debug("login is called");

        service = githubServiceProvider.getService();
        Map map = new HashMap<>();
        map.put("authUrl", service.getAuthorizationUrl(EMPTY_TOKEN));
        return JsonConstructFactory.getInstance().toJson(map);
    }

    /**
     * OAuth认证回调方法
     *
     * @param oauthVerifier
     * @return
     */
    @RequestMapping(value = "/callback", method = RequestMethod.GET)
    public String callback(@RequestParam(value = "code", required = true) String oauthVerifier) {
        logger.debug("callback is called");

        //初始化githubService
        githubService.set(new GithubService(service, oauthVerifier));
//        Response oauthResponse = githubService.get().request();
//        JsonArray array = JsonParserFactory.getInstance().parse(oauthResponse.getBody()).getAsJsonArray();
//        for (JsonElement element : array) {
//            System.out.println(element.getAsJsonObject().get("html_url"));
//        }

        return "redirect:/dashboard";
    }

    @RequestMapping(value = "/user")
    @ResponseBody
    public String getUser() {
        Response response = githubService.get().request(USER_URL);
        return JsonConstructFactory.getInstance().toJson(response.getBody());
    }

    //todo
    @RequestMapping(value = "/logout")
    @ResponseBody
    public String logout() {
        return null;
    }

}
