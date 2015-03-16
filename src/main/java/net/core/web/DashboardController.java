package net.core.web;

import net.core.db.MysqlUtils;
import net.core.model.User;
import net.core.service.oauth2.GithubService;
import net.core.utils.JsonConstructFactory;
import org.scribe.model.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import static net.core.common.Constants.USER_URL;

/**
 * Created by chenwj on 3/11/15.
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController {
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private GithubService githubService;

    @RequestMapping
    public String execute() {
        return "dashboard";
    }


    @RequestMapping(value = "/starRepos")
    @ResponseBody
    public String getStarRepos(HttpServletRequest request) {

        githubService = (GithubService) request.getSession().getAttribute("githubService");
        Assert.notNull(githubService);

        Response response = githubService.request(USER_URL);
        User user = JsonConstructFactory.getInstance().fromJson(response.getBody(), User.class);
        logger.debug(String.valueOf(user.id));

        MysqlUtils.openConnection();
        List<Map<String, Object>> list = MysqlUtils.queryStarredRepos(user.id);
        MysqlUtils.close();
        Assert.notNull(list);
        return JsonConstructFactory.getInstance().toJson(list);
    }
}
