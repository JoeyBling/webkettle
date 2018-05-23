package org.flhy.webapp.trans.steps.Denormali;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.pentaho.di.trans.steps.denormaliser.DenormaliserTargetField;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;


/**
 * Created by cRAZY on 2017/6/6.
 */
@Controller
@RequestMapping(value="/denormaliser")
public class DenormaliserController {

    @RequestMapping(value="/aggre")
    @ResponseBody
    protected void types(HttpServletResponse response,HttpServletRequest request) throws Exception {
        try{
            JSONArray jsonArr=new JSONArray();
            for(String aggre: DenormaliserTargetField.typeAggrLongDesc){
                JSONObject json=new JSONObject();
                json.put("aggre",aggre);
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
