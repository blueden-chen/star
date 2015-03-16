package net.core.web;

/**
 * Created by chenwj on 3/9/15.
 */

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import net.core.db.MysqlUtils;
import net.core.model.StarredRepo;
import net.core.model.User;
import net.core.service.oauth2.GithubService;
import net.core.service.oauth2.OAuthServiceProvider;
import net.core.utils.JsonConstructFactory;
import net.core.utils.JsonParserFactory;
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
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static net.core.common.Constants.STARRED_URL;
import static net.core.common.Constants.USER_URL;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final Token EMPTY_TOKEN = null;

    @Inject
    private OAuthServiceProvider githubServiceProvider;
    public static OAuthService service;

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
    public String callback(@RequestParam(value = "code", required = true) String oauthVerifier, HttpServletRequest request) {
        logger.debug("callback is called");

        service = githubServiceProvider.getService();
        //初始化 githubService
        GithubService githubService = new GithubService(service, oauthVerifier);
        initDB(githubService);
        request.getSession().setAttribute("githubService", githubService);
        return "dashboard";
    }

    private void initDB(GithubService githubService) {
        Response response = githubService.request(USER_URL);
        User user = JsonConstructFactory.getInstance().fromJson(response.getBody(), User.class);

        response = githubService.request(STARRED_URL);
        JsonArray starredRepos = JsonParserFactory.getInstance().parse(response.getBody()).getAsJsonArray();
        List<StarredRepo> list = new ArrayList<>();
        for (JsonElement element : starredRepos) {
            StarredRepo starredRepo = new StarredRepo();
            starredRepo.full_name = element.getAsJsonObject().get("full_name").getAsString();
            list.add(starredRepo);
        }
        //存储

        MysqlUtils.openConnection();

        MysqlUtils.store(user);
        MysqlUtils.store(user.id, list);

        MysqlUtils.close();

//        logger.debug(user.login);
    }

    /**
     * User信息
     *
     * @return
     */
    @RequestMapping(value = "/user")
    @ResponseBody
    public String getUser() {
//        Response response = githubService.request(USER_URL);
//        return JsonConstructFactory.getInstance().toJson(response.getBody());
        return null;
    }

    @RequestMapping(value = "/logout")
    @ResponseBody
    public String logout() {
        return null;
    }


}
