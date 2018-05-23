package org.flhy.webapp.trans.steps.Common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.sxdata.jingwei.entity.SlaveEntity;
import org.sxdata.jingwei.entity.UserGroupAttributeEntity;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Created by cRAZY on 2017/5/25.
 */
@Controller
@RequestMapping(value="/commonStep")
public class CommonStepController {

    //获取所有编码方式
    @RequestMapping(value="/Encodings")
    @ResponseBody
    protected void getSlaveSelect(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            StringBuffer sbf=new StringBuffer("[");
            Collection encodings=Charset.availableCharsets().values();

            int i=0;
            for(Object encoding:encodings){
                String encodingJson="";
                String encodingValue="\""+encoding.toString()+"\"";
                String encodingName="\""+"encodingName"+"\"";
                if(i!=encodings.size()-1){
                    encodingJson="{"+encodingName+":"+encodingValue+"},";
                }else{
                    encodingJson="{"+encodingName+":"+encodingValue+"}";
                }
                sbf.append(encodingJson);
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
}
