package cwj.controller;

import cwj.dto.Tag;
import cwj.service.oauth2.GithubService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

/**
 * @author blueden
 */
@Controller
@RequestMapping("/api/tags")
public class TagController  {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public List<Tag> tags() {
        ArrayList list = new ArrayList<Tag>();
        list.add(Tag.builder().name("量子力学").build());
        list.add(Tag.builder().name("合成生命").build());
        list.add(Tag.builder().name("宇宙伦理").build());
        return list;
    }
}
