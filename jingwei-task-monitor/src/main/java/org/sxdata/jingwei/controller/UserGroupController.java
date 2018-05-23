package org.sxdata.jingwei.controller;

import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.sxdata.jingwei.entity.SlaveEntity;
import org.sxdata.jingwei.entity.TaskGroupEntity;
import org.sxdata.jingwei.entity.UserGroupAttributeEntity;
import org.sxdata.jingwei.entity.UserGroupEntity;
import org.sxdata.jingwei.service.SlaveService;
import org.sxdata.jingwei.service.TaskGroupService;
import org.sxdata.jingwei.service.UserGroupService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Created by cRAZY on 2017/4/13.
 */
@Controller
@RequestMapping(value="/userGroup")
public class UserGroupController {
    @Autowired
    UserGroupService userGroupService;
    @Autowired
    TaskGroupService taskGroupService;
    @Autowired
    SlaveService slaveService;

    //添加用户组前  判断用户组名是否已存在
    @RequestMapping(value="/decideGroupNameExist")
    @ResponseBody
    protected void decideGroupNameExist(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            String userGroupName=request.getParameter("name");
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(userGroupService.decideGroupNameExist(userGroupName));
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //分页形式获取用户组集合
    @RequestMapping(value="/getUserGroupOfThisPage")
    @ResponseBody
    protected void getUserGroupOfThisPage(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            String userGroupName=request.getParameter("name");
            Integer start=Integer.valueOf(request.getParameter("start"));
            Integer limit=Integer.valueOf(request.getParameter("limit"));
            String result=userGroupService.getUserGroupByPage(start, limit, userGroupName);
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

    //添加用户组前    获取所有的任务组用于分配
    @RequestMapping(value="/getAllTaskGroupBeforeAdd")
    @ResponseBody
    protected void getAllTaskGroupBeforeAdd(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(taskGroupService.getAllTaskGroupNoPage());
            out.flush();
            out.close();
        }catch (Exception e){
            throw new Exception(e.getMessage());
        }
    }

    //添加用户组
    @RequestMapping(value="/addUserGroup")
    @ResponseBody
    protected void addUserGroup(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try {
            String[] taskGroupNameArray=request.getParameterValues("taskGroupNameArray");
            String[] slaveIdArray=request.getParameterValues("slaveIdArray");
            String userGroupName=request.getParameter("userGroupName");
            String userGroupDesc=request.getParameter("userGroupDesc");
            userGroupService.addUserGroup(taskGroupNameArray,slaveIdArray,userGroupName,userGroupDesc);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //分配任务组前
    @RequestMapping(value="/beforeAssignedTaskGroup")
    @ResponseBody
    protected void beforeAssignedTaskGroup(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            String[] taskGroupNameArray=userGroupService.beforeAssignedTaskGroup(request.getParameter("userGroupName"));
            JSONObject json=new JSONObject();
            json.put("taskGroupNameArray",taskGroupNameArray);
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(json.toString());
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    ////分配节点前
    @RequestMapping(value="/beforeAssignedSlave")
    @ResponseBody
    protected void beforeAssignedSlave(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            String[] slaveIdArray=userGroupService.beforeAssignedSlave(request.getParameter("userGroupName"));
            JSONObject json=new JSONObject();
            json.put("slaveIdArray",slaveIdArray);
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(json.toString());
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //为用户组分配可见的节点
    @RequestMapping(value="/assignedSlave")
    @ResponseBody
    protected void assignedSlave(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try {
            String userGroupName=request.getParameter("userGroupName");
            String[] slaveIdArray=request.getParameterValues("slaveIdArray");
            userGroupService.assignedSlave(slaveIdArray,userGroupName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //为用户组分配可见的任务组
    @RequestMapping(value="/assignedTaskGroup")
    @ResponseBody
    protected void assignedTaskGroup(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try {
            String userGroupName=request.getParameter("userGroupName");
            String[] taskGroupNameArray=request.getParameterValues("taskGroupNameArray");
            userGroupService.assignedTaskGroup(taskGroupNameArray, userGroupName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //修改用户组
    @RequestMapping(value="/updateUserGroup")
    @ResponseBody
    protected void updateUserGroup(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            Integer userGroupId=Integer.valueOf(request.getParameter("id"));
            String userGroupName=request.getParameter("name");
            String userGroupDesc=request.getParameter("desc");
            String result=userGroupService.updateUserGroup(userGroupId,userGroupName,userGroupDesc);
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

    //为用户组分配可见的节点
    @RequestMapping(value="/deleteUserGroup")
    @ResponseBody
    protected void deleteUserGroup(@RequestParam String userGroupName) throws Exception{
        try {
            userGroupService.deleteUserGroup(userGroupName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //查看用户详细信息前先获取用组可见的节点、可见的任务组、用户组中的用户等相关数据
    //为用户组分配可见的节点
    @RequestMapping(value="/beforeSelectUserGroupInfo")
    @ResponseBody
    protected void beforeSelectUserGroupInfo(@RequestParam String userGroupName,HttpServletResponse response) throws Exception{
        try{
            String[] slaveIdArray=userGroupService.beforeAssignedSlave(userGroupName);
            String[] taskGroupNameArray=userGroupService.beforeAssignedTaskGroup(userGroupName);
            JSONObject json=new JSONObject();
            json.put("slaveIdArray",slaveIdArray);
            json.put("taskGroupNameArray", taskGroupNameArray);
            response.setContentType("text/html;charset=utf-8");
            PrintWriter out=response.getWriter();
            out.write(json.toString());
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //生成用户组选择下拉框
    @RequestMapping(value="/getUserGroupSelect")
    @ResponseBody
    protected void getSlaveSelect(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            StringBuffer sbf=new StringBuffer("[");
            List<UserGroupEntity> items=userGroupService.getAllUserGroup();
            for(int i=0;i<items.size();i++){
                String thisJson="";
                String userGroup="\""+items.get(i).getUserGroupName()+"\"";
                String userGroupId="\""+"userGroupId"+"\"";
                String userGroupName="\""+"userGroupName"+"\"";
                if(i!=items.size()-1){
                    thisJson="{"+userGroupId+":"+userGroup+","+userGroupName+":"+userGroup+"},";
                }else{
                    thisJson="{"+userGroupId+":"+userGroup+","+userGroupName+":"+userGroup+"}";
                }
                sbf.append(thisJson);
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

    //获取所有用户组的列表
    @RequestMapping(value="/beforeAdd")
    @ResponseBody
    protected  void beforeAddSlave(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            List<UserGroupEntity> items=userGroupService.getAllUserGroup();
            PrintWriter out=response.getWriter();
            out.write(net.sf.json.JSONArray.fromObject(items).toString());
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //获取某个用户组下的任务组
    @RequestMapping(value="/taskGroupByUserGroup")
    @ResponseBody
    protected  void taskGroupByUserGroup(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            String userGroupName=request.getParameter("userGroupName");
            List<TaskGroupEntity> items=taskGroupService.AllTaskGroupBeforeAdd(userGroupName);
            PrintWriter out=response.getWriter();
            out.write(net.sf.json.JSONArray.fromObject(items).toString());
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //获取某用户组下的节点
    @RequestMapping(value="/slaveByUserGroup")
    @ResponseBody
    protected  void slaveByUserGroup(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            String userGroupName=request.getParameter("userGroupName");
            List<SlaveEntity> items=slaveService.getAllSlave(userGroupName);
            PrintWriter out=response.getWriter();
            out.write(net.sf.json.JSONArray.fromObject(items).toString());
            out.flush();
            out.close();
        }catch (Exception e){
            e.printStackTrace();
            throw new Exception(e.getMessage());
        }
    }

    //获取所有用户组 以下拉列表形式展现
    @RequestMapping(value="/getUserGrouupSelect")
    @ResponseBody
    protected void getUserGrouupSelect(HttpServletResponse response,HttpServletRequest request) throws Exception{
        try{
            StringBuffer sbf=new StringBuffer("[");
            UserGroupAttributeEntity attr=(UserGroupAttributeEntity)request.getSession().getAttribute("userInfo");

            List<UserGroupEntity> items=userGroupService.getAllUserGroup();
            for(int i=0;i<items.size();i++){
                String thisJson="";
                String val="\""+items.get(i).getUserGroupName()+"\"";
                String id="\""+"id"+"\"";
                String name="\""+"name"+"\"";
                if(i!=items.size()-1){
                    thisJson="{"+id+":"+val+","+name+":"+val+"},";
                }else{
                    thisJson="{"+id+":"+val+","+name+":"+val+"}";
                }
                sbf.append(thisJson);
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
