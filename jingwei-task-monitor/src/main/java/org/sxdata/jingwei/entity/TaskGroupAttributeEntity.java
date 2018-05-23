package org.sxdata.jingwei.entity;

/**
 * Created by cRAZY on 2017/3/22.
 */
public class TaskGroupAttributeEntity {
    private Integer groupAttributeId;
    private String taskGroupName;
    private String type;
    private Integer taskId;
    private String taskName;
    private String taskPath;

    public Integer getGroupAttributeId() {
        return groupAttributeId;
    }

    public void setGroupAttributeId(Integer groupAttributeId) {
        this.groupAttributeId = groupAttributeId;
    }

    public String getTaskGroupName() {
        return taskGroupName;
    }

    public void setTaskGroupName(String taskGroupName) {
        this.taskGroupName = taskGroupName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getTaskId() {
        return taskId;
    }

    public void setTaskId(Integer taskId) {
        this.taskId = taskId;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getTaskPath() {
        return taskPath;
    }

    public void setTaskPath(String taskPath) {
        this.taskPath = taskPath;
    }
}
