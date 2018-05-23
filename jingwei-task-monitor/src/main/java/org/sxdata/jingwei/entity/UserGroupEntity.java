package org.sxdata.jingwei.entity;

/**
 * Created by cRAZY on 2017/4/13.
 */
public class UserGroupEntity {
    private Integer userGroupId;
    private String userGroupName;
    private String userGroupDesc;

    public Integer getUserGroupId() {
        return userGroupId;
    }

    public void setUserGroupId(Integer userGroupId) {
        this.userGroupId = userGroupId;
    }

    public String getUserGroupName() {
        return userGroupName;
    }

    public void setUserGroupName(String userGroupName) {
        this.userGroupName = userGroupName;
    }

    public String getUserGroupDesc() {
        return userGroupDesc;
    }

    public void setUserGroupDesc(String userGroupDesc) {
        this.userGroupDesc = userGroupDesc;
    }
}
