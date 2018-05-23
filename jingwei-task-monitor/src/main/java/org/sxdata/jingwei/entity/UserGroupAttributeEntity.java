package org.sxdata.jingwei.entity;

import java.util.Date;

/**
 * Created by cRAZY on 2017/4/13.
 */
public class UserGroupAttributeEntity {
    private Integer groupAttributeId;
    private String userGroupName;
    private String userName;
    private Integer slavePremissonType; //1:可增删改可执行 2:只读
    private Integer taskPremissionType; //1:可增删改 2:只读
    private Integer userType;           //1:管理员 2:普通用户
    private Date createDate;

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Integer getGroupAttributeId() {
        return groupAttributeId;
    }

    public void setGroupAttributeId(Integer groupAttributeId) {
        this.groupAttributeId = groupAttributeId;
    }

    public String getUserGroupName() {
        return userGroupName;
    }

    public void setUserGroupName(String userGroupName) {
        this.userGroupName = userGroupName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getSlavePremissonType() {
        return slavePremissonType;
    }

    public void setSlavePremissonType(Integer slavePremissonType) {
        this.slavePremissonType = slavePremissonType;
    }

    public Integer getTaskPremissionType() {
        return taskPremissionType;
    }

    public void setTaskPremissionType(Integer taskPremissionType) {
        this.taskPremissionType = taskPremissionType;
    }

    public Integer getUserType() {
        return userType;
    }

    public void setUserType(Integer userType) {
        this.userType = userType;
    }
}


