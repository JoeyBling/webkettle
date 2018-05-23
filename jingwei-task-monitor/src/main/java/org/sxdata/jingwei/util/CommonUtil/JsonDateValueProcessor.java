package org.sxdata.jingwei.util.CommonUtil;

import net.sf.json.JsonConfig;
import net.sf.json.processors.JsonValueProcessor;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by cRAZY on 2017/2/22.
 */
//针对json-lib不认识的数据类型提供处理办法
public class JsonDateValueProcessor implements JsonValueProcessor{
    private String format="yyyy-MM-dd HH:mm:ss";

    public JsonDateValueProcessor(String format) {
        this.format=format;
    }

    public JsonDateValueProcessor() {
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    @Override
    public Object processArrayValue(Object o, JsonConfig jsonConfig) {
       String[] obj={};
        if (o instanceof Date[]){
            SimpleDateFormat sf=new SimpleDateFormat(format);
            Date[] dates=(Date[]) o;
            obj=new String[dates.length];
            for (int i=0;i<dates.length;i++){
                obj[i]=sf.format(dates[i]);

            }
        }
        return obj;
    }

    @Override
    public Object processObjectValue(String key, Object value, JsonConfig jsonConfig) {
        if(value instanceof Date){
            String str=new SimpleDateFormat(format).format((Date)value);
            return str;
        }
        return value==null?null:value.toString();
    }
}
