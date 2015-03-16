package net.core.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Created by chenwj on 3/16/15.
 */
public class LoginFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;//;//如果处理HTTP请求，并且需要访问诸如getHeader或getCookies等在ServletRequest中无法得到的方法，就要把此request对象构造成HttpServletRequest
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String url = request.getServletPath();
        HttpSession session = request.getSession(false);

        if (url.startsWith("/dashboard") && session.getAttribute("githubService") == null) {//*用户登录以后需手动添加session
            response.sendRedirect("/dashboard");//如果session为空表示用户没有登录就重定向到login.jsp页面
        }
        //加入filter链继续向下执行
        chain.doFilter(request, response);//.调用FilterChain对象的doFilter方法。Filter接口的doFilter方法取一个FilterChain对象作为它的一个参数。在调用此对象的doFilter方法时，激活下一个相关的过滤器。如果没有另一个过滤器与servlet或JSP页面关联，则servlet或JSP页面被激活。
    }

    @Override
    public void destroy() {

    }
}
