package org.sxdata.jingwei.entity;

import java.util.Date;

/**
 * Created by cRAZY on 2017/3/22.
 */
public class TaskGroupEntity {
    private Integer taskGroupId;
    private String taskGroupName;
    private String taskGroupDesc;
    private Date createDate;
    private String isContainsTask;  //标识是否包含某个任务  不参与数据的持久化

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getIsContainsTask() {
        return isContainsTask;
    }

    public void setIsContainsTask(String isContainsTask) {
        this.isContainsTask = isContainsTask;
    }

    public Integer getTaskGroupId() {
        return taskGroupId;
    }

    public String getTaskGroupName() {
        return taskGroupName;
    }

    public void setTaskGroupDesc(String taskGroupDesc) {
        this.taskGroupDesc = taskGroupDesc;
    }

    public String getTaskGroupDesc() {
        return taskGroupDesc;
    }

    public void setTaskGroupId(Integer taskGroupId) {
        this.taskGroupId = taskGroupId;
    }

    public void setTaskGroupName(String taskGroupName) {
        this.taskGroupName = taskGroupName;
    }

}
