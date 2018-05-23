package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.JobEntity;
import org.sxdata.jingwei.entity.TaskGroupAttributeEntity;
import org.sxdata.jingwei.entity.TaskGroupEntity;
import org.sxdata.jingwei.entity.TransformationEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/3/22.
 */
@Repository
public interface TaskGroupDao {
    public List<TaskGroupEntity> getAllTaskGroup(int start,int limit,String userGroupName,String taskGroupName,String createDate);

    public Integer getTotalCountTaskGroup(String userGroupName);

    public void addTaskGroup(TaskGroupEntity taskGroup);

    public void addTaskGroupAttribute(TaskGroupAttributeEntity taskGroupAttribute);

    public List<JobEntity> getAllJob(String userGroupName);

    public List<TransformationEntity> getAllTrans(String userGroupName);

    public List<TaskGroupEntity> getAllTaskGroupNoLimit();

    public void updateTaskGroup(TaskGroupEntity taskGroup);

    public void updateTaskGroupAttributes(String oldName,String newName);

    public void updateTaskNameforAttr(String oldName,String newName,String type,String dirName);

    public List<TaskGroupAttributeEntity> getTaskGroupAttributesByName(String name);

    public void deleteTaskGroupAttributesByName(String name);

    public void deleteTaskGroupByName(String name);

    public Integer isContainsTask(String taskName,String type,String groupName);

    public void deleteTaskGroupAttributesByTaskName(String taskName,String type);

    public List<TaskGroupAttributeEntity> getTaskGroupByTaskName(String taskName,String type);

    public TaskGroupEntity getTaskGroupById(Integer id);

    //修改用户组-任务组关系表中的任务组名
    public void updateTaskGroupForTaskRelation(String oldName,String newName);

    //删除用户组-任务组关系表中的某个任务组记录
    public void deleteUserTaskRelationByName(String taskGroupName);

    //查询当前用户组下的所有任务组
    public List<TaskGroupEntity> getTaskGroupByThisUser(String userGroupName);
}
