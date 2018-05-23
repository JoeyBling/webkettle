package org.sxdata.jingwei.entity;

import java.util.Date;

/**
 * Created by cRAZY on 2017/2/17.
 */
public class UserEntity {
    private Integer userId;
    private String login;
    private String password;
    private String name;
    private String description;
    private char enabled;
    private Integer slavePower;
    private Integer taskGroupPower;
    private String belongToUserGroup;
    private Integer userType;
    private Date createDate;

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Integer getUserType() {
        return userType;
    }

    public void setUserType(Integer userType) {
        this.userType = userType;
    }

    public Integer getSlavePower() {
        return slavePower;
    }

    public void setSlavePower(Integer slavePower) {
        this.slavePower = slavePower;
    }

    public Integer getTaskGroupPower() {
        return taskGroupPower;
    }

    public void setTaskGroupPower(Integer taskGroupPower) {
        this.taskGroupPower = taskGroupPower;
    }

    public String getBelongToUserGroup() {
        return belongToUserGroup;
    }

    public void setBelongToUserGroup(String belongToUserGroup) {
        this.belongToUserGroup = belongToUserGroup;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getLogin() {
        return login;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public char getEnabled() {
        return enabled;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setEnabled(char enabled) {
        this.enabled = enabled;
    }
}
