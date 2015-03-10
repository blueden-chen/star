package net.core.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by chenwj on 3/11/15.
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @RequestMapping
    public String execute(){
        return "dashboard";
    }
}
