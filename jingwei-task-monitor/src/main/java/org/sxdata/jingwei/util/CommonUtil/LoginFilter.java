package org.sxdata.jingwei.util.CommonUtil;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

/**
 * Created by cRAZY on 2017/4/12.
 */
public class LoginFilter implements Filter{
    private String loginUrl="";
    private String[] excludedArray=null;
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        loginUrl=filterConfig.getInitParameter("login_url");
        String excludedPages=filterConfig.getInitParameter("excludedPages");
        if(excludedPages.indexOf(",")!=-1){
            excludedArray=excludedPages.split(",");
        }else{
            excludedArray=new String[]{excludedPages};
        }
    }

    @Override
    public void doFilter(ServletRequest arg0, ServletResponse arg1, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request=(HttpServletRequest)arg0;
        HttpServletResponse response=(HttpServletResponse)arg1;
        HttpSession session=request.getSession();

        boolean isExclude=false;
        for(String excludePage:excludedArray){
            if(excludePage.equals(request.getServletPath())){
                isExclude=true;
            }
        }
        if (!isExclude) {
            Object user=session.getAttribute("login");
            if (user!=null) {
                chain.doFilter(arg0, arg1);
                return;
            }else {
                PrintWriter out=response.getWriter();
                //如果是异步请求
                if (request.getHeader("x-requested-with") != null && request.getHeader("x-requested-with").equals("XMLHttpRequest")) {
                    response.addHeader("sessionstatus", "timeout");
                    chain.doFilter(request, response);
                }else {
                    response.sendRedirect(request.getContextPath()+loginUrl);
                    return;
                }
            }
        }else{
            chain.doFilter(arg0, arg1);
            return;
        }
    }

    @Override
    public void destroy() {

    }
}
