package org.sxdata.jingwei.controller;

import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.sxdata.jingwei.entity.UserGroupAttributeEntity;
import org.sxdata.jingwei.service.HistoryLogService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
 * Created by cRAZY on 2017/4/5.
 * 日志
 */
@Controller
@RequestMapping(value="/log")
public class LogController {
    @Autowired
    HistoryLogService logService;

    //获得所有的任务历史日志
    @RequestMapping(value="/getAllHistoryLog")
    @ResponseBody
    protected void getAllHistoryLog(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            Integer start=Integer.valueOf(request.getParameter("start"));
            Integer limit=Integer.valueOf(request.getParameter("limit"));
            String statu="";
            String type="";
            String startTime="";
            String taskName="";
            //获取当前用户所在的用户组
            UserGroupAttributeEntity attr=(UserGroupAttributeEntity)request.getSession().getAttribute("userInfo");
            String userGroupName="";
            if(null!=attr){
                userGroupName=attr.getUserGroupName();
            }

            //获取查询参数
            String search=request.getParameter("search");
            if(null!=search && !search.equals("")){
                JSONObject json=JSONObject.fromObject(search);
                statu=(String)json.get("statu");
                type=(String)json.get("type");
                startTime=(String)json.get("startDate");
                taskName=(String)json.get("taskName");
                startTime+=" 00:00:00";
            }
            String result=logService.getAllHistoryLog(start,limit,statu,type,startTime,taskName,userGroupName);
            result=result.replaceAll("\n","<br/>");
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(result);
            out.flush();
            out.close();
        }catch (Exception e){
            String errorMessage=e.getMessage();
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //根据Id获取某个日志
    @RequestMapping(value="/getTraceById")
    @ResponseBody
    protected void getTraceById(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            Integer id=Integer.valueOf(request.getParameter("id"));
            String result=logService.getExecutionTraceById(id);
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(result);
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }
}
