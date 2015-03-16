package net.core.filter;

import javax.servlet.*;
import java.io.IOException;

/**
 * Created by chenwj on 3/16/15.
 */
public class LoginFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    chain.doFilter(request,response);

    }

    @Override
    public void destroy() {

    }
}
