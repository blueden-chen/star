package cwj.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;
import cwj.utils.JsonConstructFactory;
import lombok.extern.java.Log;
import cwj.service.oauth2.GithubService;
import cwj.utils.JsonParserFactory;
import org.pegdown.Extensions;
import org.pegdown.PegDownProcessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static cwj.common.Constants.README_URL;
import static cwj.common.Constants.STARRED_URL;

/**
 * @author blueden
 */
@Controller
@Log
@RequestMapping("/api/github")
public class GithubController {
  private final int per_page = 50;
  private final OkHttpClient client = new OkHttpClient();

  @RequestMapping(value = "stars", method = RequestMethod.GET)
  @ResponseBody
  public String stars(int page, HttpServletRequest request) {
    checkArgument(page > 0);
    GithubService githubService = (GithubService) request.getSession().getAttribute("githubService");
    checkNotNull(githubService);

    Integer page_count = 1;
    if (page == 1) {
      //用于计算 page_count ,似乎没什么别的方法
      while (!githubService.request((STARRED_URL + "?page=" + per_page + "&per_page=" + page_count)).getBody().equals("[]")) {
        page_count++;
      }
    }
    JsonParser jsonParser = JsonParserFactory.getInstance();
    JsonArray starredRepos = jsonParser.parse(githubService.request(STARRED_URL + "?page=" + page + "&per_page=" + per_page).getBody()).getAsJsonArray();
    if (page == 1) {
      JsonObject jsonObject = new JsonObject();
      for (int i = 0; i < starredRepos.size(); i++) {
        jsonObject.add("" + i, starredRepos.get(i).getAsJsonObject());
      }
      JsonElement element = jsonParser.parse(page_count.toString());
      jsonObject.add("page_count", element);
      return jsonObject.toString();
    } else {
      return starredRepos.toString();
    }
  }

  @RequestMapping(value = "repo/{owner}/{repo}/readme", method = RequestMethod.GET)
  @ResponseBody
  public String readme(@PathVariable("owner") String owner, @PathVariable("repo") String repo, HttpServletRequest request) {
    GithubService githubService = (GithubService) request.getSession().getAttribute("githubService");
    checkNotNull(githubService);
    JsonParser jsonParser = JsonParserFactory.getInstance();
    String readmeUrl = README_URL.replace(":owner", owner).replace(":repo", repo);
    String download_url = jsonParser.parse(githubService.request(readmeUrl).getBody()).getAsJsonObject().get("download_url").getAsString();
    PegDownProcessor pegDown = new PegDownProcessor(Extensions.ALL);
    String readme = "";
    Request readmeRequest = new Request.Builder()
        .url(download_url)
        .build();
    Response response = null;
    try {
      response = client.newCall(readmeRequest).execute();
      readme = response.body().string();
    } catch (IOException e) {
      log.warning(e.getMessage());
    }
    if (readme != null) {
      readme = pegDown.markdownToHtml(readme.toCharArray());
    }
    Map map = new HashMap<>();
    map.put("readme", readme);
    return JsonConstructFactory.getInstance().toJson(map);
  }

}