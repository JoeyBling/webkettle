package org.sxdata.jingwei.service.Impl;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sxdata.jingwei.bean.PageforBean;
import org.sxdata.jingwei.dao.TaskGroupDao;
import org.sxdata.jingwei.dao.UserGroupDao;
import org.sxdata.jingwei.entity.*;
import org.sxdata.jingwei.service.JobService;
import org.sxdata.jingwei.service.TaskGroupService;
import org.sxdata.jingwei.service.TransService;
import org.sxdata.jingwei.util.CommonUtil.StringDateUtil;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by cRAZY on 2017/3/22.
 */
@Service
public class TaskGroupServiceImpl implements TaskGroupService{
    @Autowired
    protected TaskGroupDao taskGroupDao;
    @Autowired
    protected JobService jobService;
    @Autowired
    protected TransService transService;
    @Autowired
    protected UserGroupDao userGroupDao;

    @Override
    public String getAllTaskGroupByLogin(int start, int limit,String userGroupName,String taskGroupName,String createDate) throws Exception {
        List<TaskGroupEntity> taskGroups=taskGroupDao.getAllTaskGroup(start, limit,userGroupName,taskGroupName,createDate);
        Integer totalCount=taskGroupDao.getTotalCountTaskGroup(userGroupName);
        PageforBean pageBean=new PageforBean();
        pageBean.setTotalProperty(totalCount);
        pageBean.setRoot(taskGroups);
        return JSONObject.fromObject(pageBean,StringDateUtil.configJson("yyyy-MM-dd HH:mm:ss")).toString();
    }

    @Override
    //添加任务组以及任务组下的明细
    public void addTaskGroup(HttpServletRequest request) throws Exception{
        //任务组对象
        String taskGroupDesc=request.getParameter("taskGroupDesc");
        String taskGroupName=request.getParameter("taskGroupName").trim();
        TaskGroupEntity taskGroup=new TaskGroupEntity();
        taskGroup.setTaskGroupName(taskGroupName);
        taskGroup.setTaskGroupDesc(taskGroupDesc);
        taskGroup.setCreateDate(new Date());
        taskGroupDao.addTaskGroup(taskGroup);
        //任务组成员对象 任务组下的任务
        String taskArray=request.getParameter("taskArray");
        //获取前台传递的json数组 每一个json存放 任务ID 任务类型
        if (!StringDateUtil.isEmpty(taskArray)) {
            JSONArray jsons=JSONArray.fromObject(taskArray);
            for(int i=0;i<jsons.size();i++){
                JSONObject json=jsons.getJSONObject(i);
                TaskGroupAttributeEntity item=new TaskGroupAttributeEntity();
                item.setType((String) json.get("type"));
                item.setTaskId(Integer.valueOf((String) json.get("taskId")));
                item.setTaskPath((String) json.get("taskPath"));
                item.setTaskName((String) json.get("taskName"));
                item.setTaskGroupName(taskGroupName);
                taskGroupDao.addTaskGroupAttribute(item);
            }
        }

        //获取当前用户所在的用户组
        UserGroupAttributeEntity attr=(UserGroupAttributeEntity)request.getSession().getAttribute("userInfo");
        String userGroupName=attr.getUserGroupName();
        //添加用户组-任务组关系表记录 如果用户组名不为空则代表不是admin用户 默认该用户组可见
        if(!StringDateUtil.isEmpty(userGroupName)){
            TaskUserRelationEntity ur=new TaskUserRelationEntity();
            ur.setUserGroupName(userGroupName);
            ur.setTaskGroupName(taskGroupName);
            userGroupDao.addTaskUserRelation(ur);
        }else{
            String[] userGroupNameArray=request.getParameterValues("userGroupNameArray");
            if(!StringDateUtil.isEmpty(userGroupNameArray)){
                for(String th:userGroupNameArray){
                    if(StringDateUtil.isEmpty(th))
                        continue;
                    TaskUserRelationEntity ur=new TaskUserRelationEntity();
                    ur.setUserGroupName(th);
                    ur.setTaskGroupName(taskGroupName);
                    userGroupDao.addTaskUserRelation(ur);
                }
            }
        }

    }

    @Override
    //在添加任务组前获取该用户下所有的作业和转换供选择
    public String getAllTaskBeforeAdd(String userGroupName) throws Exception {
        List<TaskGroupAttributeEntity> tasks=new ArrayList<TaskGroupAttributeEntity>();
        //获取所有的作业以及转换
        List<JobEntity> jobList=taskGroupDao.getAllJob(userGroupName);
        List<TransformationEntity> transList=taskGroupDao.getAllTrans(userGroupName);
        //获得这些转换和作业的全目录名
        jobList=jobService.getJobPath(jobList);
        transList=transService.getTransPath(transList);
        for(JobEntity job:jobList){
            TaskGroupAttributeEntity item=new TaskGroupAttributeEntity();
            item.setTaskId(job.getJobId());
            item.setTaskName(job.getName());
            item.setType("job");
            item.setTaskPath(job.getDirectoryName());
            tasks.add(item);
        }
        for(TransformationEntity trans:transList){
            TaskGroupAttributeEntity item=new TaskGroupAttributeEntity();
            item.setTaskId(trans.getTransformationId());
            item.setTaskName(trans.getName());
            item.setType("trans");
            item.setTaskPath(trans.getDirectoryName());
            tasks.add(item);
        }
        return  JSONArray.fromObject(tasks).toString();
    }

    @Override
    //判断用户组名是否已存在
    public boolean decideGroupNameExist(String name) throws Exception {
        List<TaskGroupEntity> items=taskGroupDao.getAllTaskGroupNoLimit();
        for(TaskGroupEntity item:items){
            if(item.getTaskGroupName().equals(name.trim())){
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public void updateTaskGroup(TaskGroupEntity taskGroup) throws Exception{
        TaskGroupEntity item=taskGroupDao.getTaskGroupById(taskGroup.getTaskGroupId());
        taskGroupDao.updateTaskGroup(taskGroup);
        if(!taskGroup.getTaskGroupName().equals(item.getTaskGroupName())){
            taskGroupDao.updateTaskGroupAttributes(item.getTaskGroupName(),taskGroup.getTaskGroupName());
            taskGroupDao.updateTaskGroupForTaskRelation(item.getTaskGroupName(),taskGroup.getTaskGroupName());
        }

    }

    @Override
    //根据用户组名查询用户组下的所有任务信息
    public String selectTaskGroupAttributesByName(String name) throws Exception {
        List<TaskGroupAttributeEntity> items= taskGroupDao.getTaskGroupAttributesByName(name);
        return JSONArray.fromObject(items).toString();
    }

    @Override
    @Transactional
    public void deleteTaskGroupAndAttributes(String name){
        taskGroupDao.deleteTaskGroupAttributesByName(name.trim());
        taskGroupDao.deleteTaskGroupByName(name.trim());
        taskGroupDao.deleteUserTaskRelationByName(name);
    }

    @Override
    //判断任务组是否包含某个任务 判断结果会存放在任务组的属性中
    public List<TaskGroupEntity> isContainsTask(String taskName, String type,String userGroupName) throws Exception{
        //获取当前用户下的所有任务组
        List<TaskGroupEntity> items=taskGroupDao.getTaskGroupByThisUser(userGroupName);
        for(TaskGroupEntity item:items){
            Integer result=taskGroupDao.isContainsTask(taskName,type,item.getTaskGroupName());
            if(result==0){
                item.setIsContainsTask("NO");
            }else{
                item.setIsContainsTask("YES");
            }
        }
        return items;
    }

    @Override
    //分配任务组
    public void assignedTaskGroup(List<TaskGroupAttributeEntity> items,String taskName,String type) throws Exception{
        taskGroupDao.deleteTaskGroupAttributesByTaskName(taskName,type);
        if(items.size()>0){
            for(TaskGroupAttributeEntity item:items){
                taskGroupDao.addTaskGroupAttribute(item);
            }
        }
    }

    @Override
    public String getAllTaskGroupNoPage() throws Exception{
        String result=JSONArray.fromObject(taskGroupDao.getAllTaskGroupNoLimit()).toString();
        return result;
    }

    @Override
    public List<TaskGroupEntity> AllTaskGroupBeforeAdd(String userGroupName) throws Exception{
        return taskGroupDao.getTaskGroupByThisUser(userGroupName);
    }
}
