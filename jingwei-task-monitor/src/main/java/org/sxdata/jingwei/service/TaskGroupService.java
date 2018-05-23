package org.sxdata.jingwei.service;

import org.sxdata.jingwei.entity.TaskGroupAttributeEntity;
import org.sxdata.jingwei.entity.TaskGroupEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * Created by cRAZY on 2017/3/22.
 */
public interface TaskGroupService {
    //TODO 获取当前登录用户的所有任务组信息 分页形式    用户模块暂无
    public String getAllTaskGroupByLogin(int start,int limit,String userGroupName,String taskGroupName,String createDate) throws Exception;

    public void addTaskGroup(HttpServletRequest request) throws Exception;

    public String getAllTaskBeforeAdd(String userGroupName) throws Exception;

    public boolean decideGroupNameExist(String name) throws Exception;

    public void updateTaskGroup(TaskGroupEntity taskGroup) throws Exception;

    public String selectTaskGroupAttributesByName(String name) throws Exception;

    public void deleteTaskGroupAndAttributes(String name) throws Exception;

    public List<TaskGroupEntity> isContainsTask(String taskName,String type,String userGroupName) throws Exception;

    public void assignedTaskGroup(List<TaskGroupAttributeEntity> items,String taskName,String type) throws Exception;

    public String getAllTaskGroupNoPage() throws Exception;

    public List<TaskGroupEntity> AllTaskGroupBeforeAdd(String userGroupName) throws Exception;
}
