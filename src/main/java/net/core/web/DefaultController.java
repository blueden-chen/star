package net.core.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by chenwj on 3/11/15.
 */
@Controller
public class DefaultController {
    @RequestMapping("*")
    public String hello(HttpServletRequest request) {
        System.out.println(request.getServletPath());
        return "index";
    }
}
