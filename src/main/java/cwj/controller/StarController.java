package cwj.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by chenwj on 3/11/15.
 */
@Controller
@RequestMapping("/api/stars")
public class StarController {
    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public List stars() {
        return new ArrayList<>();
    }
}
