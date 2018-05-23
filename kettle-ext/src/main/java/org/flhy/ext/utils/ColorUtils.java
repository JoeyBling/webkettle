package org.flhy.ext.utils;

public class ColorUtils {

	public static String toHex(int r, int g, int b) {
		String R = Integer.toHexString(r);
		R = R.length() < 2 ? ('0' + R) : R;
		String B = Integer.toHexString(g);
		B = B.length() < 2 ? ('0' + B) : B;
		String G = Integer.toHexString(b);
		G = G.length() < 2 ? ('0' + G) : G;
		return '#' + R + B + G;
	}
}
