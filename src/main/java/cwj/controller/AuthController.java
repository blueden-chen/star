package cwj.controller;

/**
 * Created by chenwj on 3/9/15.
 */

import cwj.service.oauth2.GithubService;
import cwj.service.oauth2.OAuthServiceProvider;
import cwj.utils.JsonConstructFactory;
import org.scribe.model.Token;
import org.scribe.oauth.OAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;
import static cwj.common.Constants.USER_URL;

@Controller
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final Token EMPTY_TOKEN = null;
    public static OAuthService service;
    @Autowired
    private OAuthServiceProvider githubServiceProvider;

    /**
     * 登陆入口方法
     *
     * @return
     */
    @RequestMapping(value = "/login", method = RequestMethod.GET)
    @ResponseBody
    public String login(@RequestParam(value = "code", required = false) String oauthVerifier, HttpServletRequest request) {
        service = githubServiceProvider.getService();
        if (oauthVerifier == null) {
            Map map = new HashMap<>();
            map.put("authUrl", service.getAuthorizationUrl(EMPTY_TOKEN));
            return JsonConstructFactory.getInstance().toJson(map);
        } else {
            GithubService githubService = new GithubService(service, oauthVerifier);
            HttpSession session = request.getSession();
            session.setAttribute("githubService", githubService);
            session.setMaxInactiveInterval(2 * 60 * 60);        //session 两个小时
            return githubService.request(USER_URL).getBody();
        }
    }
    /**
     * User信息
     *
     * @return
     */
    @RequestMapping(value = "/user")
    @ResponseBody
    public String getUser(HttpServletRequest request) {
        HttpSession session = request.getSession();
        GithubService githubService = ((GithubService) session.getAttribute("githubService"));
        checkNotNull(githubService);
        return githubService.request(USER_URL).getBody();
    }
    /**
     * OAuth认证回调方法
     *
     * @param oauthVerifier
     * @return
     */
    @RequestMapping(value = "/callback", method = RequestMethod.GET)
    public String callback(@RequestParam(value = "code", required = true) String oauthVerifier, HttpServletRequest request, HttpServletResponse response) {
        return "redirect:/auth/?code=" + oauthVerifier;
    }

    @RequestMapping(value = "/logout")
    @ResponseBody
    public String logout() {
        return null;//todo
    }
}
