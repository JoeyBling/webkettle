package org.flhy.webapp.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.utils.JsonUtils;

public class GlobalFilter implements Filter {

	@Override
	public void destroy() {

	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse res, FilterChain fc) throws IOException, ServletException {
		if(res instanceof HttpServletResponse) {
			HttpServletResponse response = (HttpServletResponse) res;
			JsonUtils.putResponse(response);
		}
		
		fc.doFilter(req, res);
	}

	@Override
	public void init(FilterConfig fc) throws ServletException {

	}

}
