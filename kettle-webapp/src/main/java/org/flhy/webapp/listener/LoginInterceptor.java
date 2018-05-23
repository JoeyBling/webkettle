package org.flhy.webapp.listener;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

public class LoginInterceptor implements HandlerInterceptor {

	@Override
	public void afterCompletion(HttpServletRequest request,
			HttpServletResponse response, Object handler, Exception e)
			throws Exception {

	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response,
			Object handler, ModelAndView mv) throws Exception {

	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
			Object handler) throws Exception {
		String uri = request.getRequestURI();
		String cp = request.getContextPath();
		String url = uri.replaceAll(cp, "");
		
		
		if(request.getSession().getAttribute("loginuser") == null) {
			if("/repository/types.do".equals(url))
				return true;
			if("/repository/list.do".equals(url))
				return true;
			
			response.getWriter().write("access forbidden");
			
			return false;
		}
		
		return true;
	}

}
