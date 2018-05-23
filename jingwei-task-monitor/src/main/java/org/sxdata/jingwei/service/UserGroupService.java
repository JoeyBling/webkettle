package org.sxdata.jingwei.service;

import org.sxdata.jingwei.entity.UserGroupEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/4/13.
 */
public interface UserGroupService {
    public String getUserGroupByPage(int start,int limit,String userGroupName) throws Exception;

    public String decideGroupNameExist(String name) throws Exception;

    public void addUserGroup(String[] taskGroupNameArray,String[] slaveIdArray,String userGroupName,String userGroupDesc) throws Exception;

    public String[] beforeAssignedTaskGroup(String userGroupName) throws Exception;

    public String[] beforeAssignedSlave(String userGroupName) throws Exception;

    public void assignedSlave(String[] slaveIdArray,String userGroupName) throws Exception;

    public void assignedTaskGroup(String[] taskGroupNameArray,String userGroupName) throws Exception;

    public String updateUserGroup(Integer userGroupId,String userGroupName,String userGroupDesc) throws Exception;

    public void deleteUserGroup(String userGroupName) throws Exception;

    public List<UserGroupEntity> getAllUserGroup() throws Exception;

}
