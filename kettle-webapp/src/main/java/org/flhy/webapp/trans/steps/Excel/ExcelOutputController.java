package org.flhy.webapp.trans.steps.Excel;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.row.value.ValueMetaFactory;
import org.pentaho.di.trans.steps.exceloutput.ExcelOutputMeta;
import org.pentaho.di.ui.trans.steps.exceloutput.ExcelOutputDialog;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;


/**
 * Created by cRAZY on 2017/5/25.
 */
@Controller
@RequestMapping(value="/ExcelOutput")
public class ExcelOutputController {

    //获取时间格式
    @RequestMapping(value="/formats")
    @ResponseBody
    protected void getFormats(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{

            StringBuffer sbf=new StringBuffer("[");
            String[] formats= Const.getDateFormats();

            int i=0;
            for(Object format:formats){
                String formatJson="";
                String formatValue="\""+format+"\"";
                String formatName="\""+"formatName"+"\"";
                if(i!=formats.length-1){
                    formatJson="{"+formatName+":"+formatValue+"},";
                }else{
                    formatJson="{"+formatName+":"+formatValue+"}";
                }
                sbf.append(formatJson);
                i++;
            }
            sbf.append("]");
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(sbf.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //字体
    @RequestMapping(value="/fontnameDesc")
    @ResponseBody
    protected void fontnameDesc(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            JSONArray jsonArr=new JSONArray();
            for(String fontName:ExcelOutputMeta.font_name_code){
                JSONObject json=new JSONObject();
                json.put("fontName", fontName);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //字体位置
    @RequestMapping(value="/fontOrientationCode")
    @ResponseBody
    protected void fontOrientationCode(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            JSONArray jsonArr=new JSONArray();
            for(String fontOr:ExcelOutputMeta.font_orientation_code){
                JSONObject json=new JSONObject();
                json.put("fontOr",fontOr);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }


    @RequestMapping(value="/fontUnderlineDesc")
    @ResponseBody
    protected void fontUnderlineDesc(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            JSONArray jsonArr=new JSONArray();
            for(String fontUnderline:ExcelOutputMeta.font_underline_code){
                JSONObject json=new JSONObject();
                json.put("fontUnderline",fontUnderline);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    @RequestMapping(value="/fontColorCode")
    @ResponseBody
    protected void fontColorCode(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            JSONArray jsonArr=new JSONArray();
            for(String fontColor:ExcelOutputMeta.font_color_code){
                JSONObject json=new JSONObject();
                json.put("fontColor",fontColor);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //对齐方式
    @RequestMapping(value="/headerAlignmentCode")
    @ResponseBody
    protected void headerAlignmentCode(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            JSONArray jsonArr=new JSONArray();
            for(String headerAlignment:ExcelOutputMeta.font_alignment_code){
                JSONObject json=new JSONObject();
                json.put("headerAlignment",headerAlignment);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //字段格式
    @RequestMapping(value="/columnFormats")
    @ResponseBody
    protected void columnFormats(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            String[] formats = new String[]{"#", "0", "0.00", "#,##0", "#,##0.00", "$#,##0;($#,##0)", "$#,##0;($#,##0)", "$#,##0;($#,##0)", "$#,##0;($#,##0)", "0%", "0.00%", "0.00E00", "#,##0;(#,##0)", "#,##0;(#,##0)", "#,##0.00;(#,##0.00)", "#,##0.00;(#,##0.00)", "#,##0;(#,##0)", "#,##0;(#,##0)", "#,##0.00;(#,##0.00)", "#,##0.00;(#,##0.00)", "#,##0.00;(#,##0.00)", "##0.0E0", "@", "M/d/yy", "d-MMM-yy", "d-MMM", "MMM-yy", "h:mm a", "h:mm:ss a", "H:mm", "H:mm:ss", "M/d/yy H:mm", "mm:ss", "H:mm:ss", "H:mm:ss"};
            JSONArray jsonArr=new JSONArray();
            for(String format:formats){
                JSONObject json=new JSONObject();
                json.put("format",format);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //字段类型
    //字段格式
    @RequestMapping(value="/columnType")
    @ResponseBody
    protected void columnType(HttpServletResponse response,HttpServletRequest request) throws Exception{

        try{
            JSONArray jsonArr=new JSONArray();
            for(String  type: ValueMetaFactory.getValueMetaNames()){
                JSONObject json=new JSONObject();
                json.put("type",type);
                jsonArr.add(json);
            }
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(jsonArr.toString());
            out.flush();
            out.close();
        }catch(Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }
}
