package org.flhy.ext.utils;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;

public class StringEscapeHelper {

	public static String charset = "utf-8";
	
	public static String encode(String string) {
		if(string == null || string.length() == 0)
			return string;
		try {
			String tmp = URLEncoder.encode(string, charset);
			return tmp.replaceAll("\\+", "%20");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return string;
		}
	}
	
	public static String decode(String string) {
		if(string == null || string.length() == 0)
			return string;
		try {
			return URLDecoder.decode(string, charset);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return string;
		}
	}
}
