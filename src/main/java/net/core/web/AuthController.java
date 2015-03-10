package net.core.web;

/**
 * Created by chenwj on 3/9/15.
 */
/**
 * Created by chenwj on 3/8/15.
 */

import net.core.service.oauth2.OAuthServiceProvider;
import net.core.utils.JsonFactory;
import org.scribe.model.*;
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


@Controller
@RequestMapping("/api/auth")
public class AuthController {
    private static final String PROTECTED_RESOURCE_URL = "https://api.github.com/user/starred";
    Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Inject
    private OAuthServiceProvider githubServiceProvider;
    private static final Token EMPTY_TOKEN = null;

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    @ResponseBody
    public String login() {
        OAuthService service = githubServiceProvider.getService();
        Map map = new HashMap<>();
        map.put("authUrl", service.getAuthorizationUrl(EMPTY_TOKEN));
        return JsonFactory.getInstance().toJson(map);
    }

    @RequestMapping(value = "/callback", method = RequestMethod.GET)
    public String callback(@RequestParam(value = "code") String oauthVerifier) {
        OAuthService service = githubServiceProvider.getService();
        Verifier verifier = new Verifier(oauthVerifier);
        Token accessToken = service.getAccessToken(EMPTY_TOKEN, verifier);
        OAuthRequest oauthRequest = new OAuthRequest(Verb.POST, PROTECTED_RESOURCE_URL);
        service.signRequest(accessToken, oauthRequest);
        Response oauthResponse = oauthRequest.send();
        return "redirect:/dashboard";
    }

}
