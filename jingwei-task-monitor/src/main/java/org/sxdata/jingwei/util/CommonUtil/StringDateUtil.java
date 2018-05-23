package org.sxdata.jingwei.util.CommonUtil;

import net.sf.json.JsonConfig;
import net.sf.json.util.CycleDetectionStrategy;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by cRAZY on 2017/2/22.
 *
 */
public class StringDateUtil {
    public static Map<String,HttpSession> allSession=new HashMap<String,HttpSession>();

    //首字符大写
    public static String firstLetterUpp(String source){
        char[] cs=source.toCharArray();
        cs[0]-=32;
        return String.valueOf(cs);
    }

    //为json-lib日期返回正常的指定格式
    public static JsonConfig configJson(String datePattern) {
        JsonConfig config = new JsonConfig();
        config.setExcludes(new String[]{""});
        config.setIgnoreDefaultExcludes(false);
        config.setCycleDetectionStrategy(CycleDetectionStrategy.LENIENT);
        config.registerJsonValueProcessor(Date.class, new JsonDateValueProcessor(datePattern));
        return config;
    }

    //字符串按照指定格式转换为日期
    public static Date stringToDate(String source, String pattern) throws Exception {
        SimpleDateFormat simple = new SimpleDateFormat(pattern);
        return simple.parse(source);
    }

    public static String dateToString(Date source, String pattern) throws Exception {
        SimpleDateFormat simple = new SimpleDateFormat(pattern);
        return simple.format(source);
    }

    //获取request对象中所有参数，并设置到map中
    public static Map getMapByRequest(HttpServletRequest request) {
        Map<String, Object> map = new HashMap<String, Object>();
        Enumeration enu = request.getParameterNames();
        while (enu.hasMoreElements()) {
            String paraName = (String) enu.nextElement();
            String paraValue = request.getParameter(paraName);
            if (paraValue != null && !"".equals(paraValue)) {
                map.put(paraName, paraValue.trim());
            }
        }
        return map;
    }

    public static Integer getdayInt(String dayByMonth) {
        String result = "";
        dayByMonth = dayByMonth.trim();
        int index = dayByMonth.indexOf("号");
        result = dayByMonth.substring(0, index);
        return Integer.parseInt(result);
    }

    public static Integer getIntWeek(String week) {
        Integer result = 0;
        week = week.trim();
        if (week.endsWith("一")) {
            result = 2;
        } else if (week.endsWith("二")) {
            result = 3;
        } else if (week.endsWith("三")) {
            result = 4;
        } else if (week.endsWith("四")) {
            result = 5;
        } else if (week.endsWith("五")) {
            result = 6;
        } else if (week.endsWith("六")) {
            result = 7;
        } else if (week.endsWith("日")) {
            result = 1;
        }
        return result;
    }

    public static boolean isEmpty(Object obj) {
        boolean result = false;
        if (obj != null) {
            if (obj instanceof String) {
                String target = (String) obj;
                if (target.equals(""))
                    result = true;
            } else if (obj instanceof List) {
                List items = (List) obj;
                if (items.size() < 1)
                    result = true;
            } else if (obj instanceof String[]) {
                String[] args = (String[]) obj;
                if (args.length < 1)
                    result = true;
            } else if (obj instanceof Integer[]) {
                Integer[] args = (Integer[]) obj;
                if (args.length < 1)
                    result = true;
            } else if (obj instanceof Double[]) {
                Double[] args = (Double[]) obj;
                if (args.length < 1)
                    result = true;
            } else if (obj instanceof Map) {
                Map map = (Map) obj;
                if (map.size() < 1)
                    result = true;
            }
        } else
            result = true;
        return result;
    }

    public static String getWeekByValue(Integer weekValue) {
        String week = "";
        switch (weekValue) {
            case 1:
                week = "周日";
                break;
            case 2:
                week = "周一";
                break;
            case 3:
                week = "周二";
                break;
            case 4:
                week = "周三";
                break;
            case 5:
                week = "周四";
                break;
            case 6:
                week = "周五";
                break;
            case 7:
                week = "周六";
                break;
            default:
                break;
        }
        return week;
    }

    public static float getMaxValueByFloatArray(float[] arryas) {
        float max = 0;
        if (arryas.length < 1) {
            return 0;
        } else if (arryas.length == 1) {
            return arryas[0];
        } else {
            max = arryas[0];
            for (int i = 0; i < arryas.length; i++) {
                if (arryas[i] > max) {
                    max = arryas[i];
                }
            }
        }
        return max;
    }

    public static Integer getMaxValueByIntArray(int[] arryas) {
        Integer max = 0;
        if (arryas.length < 1) {
            return 0;
        } else if (arryas.length == 1) {
            return arryas[0];
        } else {
            max = arryas[0];
            for (int i = 0; i < arryas.length; i++) {
                if (arryas[i] > max) {
                    max = arryas[i];
                }
            }
        }
        return max;
    }

    public static double getMaxValueBydoubleArray(double[] arryas) {
        double max = 0;
        if (arryas.length < 1) {
            return 0;
        } else if (arryas.length == 1) {
            return arryas[0];
        } else {
            max = arryas[0];
            for (int i = 0; i < arryas.length; i++) {
                if (arryas[i] > max) {
                    max = arryas[i];
                }
            }
        }
        return max;
    }
}
