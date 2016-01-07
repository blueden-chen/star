package cwj.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by chenwj on 3/11/15.
 */
@Controller
public class RouteController {
    @RequestMapping("/")
    public String hello(HttpServletRequest request) {
        return "astral";
    }
    @RequestMapping("/auth")
    public String auth(HttpServletRequest request) {
        return "astral";
    }

    @RequestMapping("/dashboard")
    public String dashboard(HttpServletRequest request) {
        return "astral";
    }
}