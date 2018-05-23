package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.*;

import java.util.List;

/**
 * Created by cRAZY on 2017/4/13.
 */
@Repository
public interface UserGroupDao {
    //分页形式查询用户组
    public List<UserGroupEntity> selectUserGroupByPage(int start,int limit,String name);

    //查询所有用户组
    public List<UserGroupEntity> allUserGroup();

    //查询用户组的总数量
    public Integer userGroupConut(String name);

    //根据用户组名查询当前用户组下的所有用户
    public List<UserGroupAttributeEntity> getUsersByUserGroupName(String name);

    //根据用名查询当前用户的权限相关信息
    public UserGroupAttributeEntity getInfoByUserName(String name);

    //根据用户组名获取当前用户可见的任务组
    public List<TaskUserRelationEntity> getTaskGroupsByUserGroupName(String name);

    //根据用户组名获取当前用户可见的节点
    public List<SlaveUserRelationEntity> getSlavesByUserGroupName(String name);

    //添加用户组
    public void addUserGroup(UserGroupEntity userGroup);

    //添加用户组成员表(即添加该用户组下有哪些用户)
    public void addUserGroupAttribute(UserGroupAttributeEntity attributes);

    //添加用户组可见的节点记录
    public void addUserSlaveRelation(SlaveUserRelationEntity entry);

    //添加用户组可见的任务组记录
    public void addTaskUserRelation(TaskUserRelationEntity entry);

    //修改用户组
    public void updateUserGroup(UserGroupEntity userGroup);

    //删除用户组
    public void deleteUserGroupByName(String name);

    //删除用户组下的所有用户
    public void deleteUserAttributeByGroupName(String name);

    //删除用户组下可见的节点记录
    public void deleteSlaveRelationByGroupName(String name);

    //删除用户组下可见的任务组记录
    public void deleteTaskRelationByGroupName(String name);

    //根据用户组名或者用户id查找用户组
    public UserGroupEntity selectUserGroupByNameOrId(String name,Integer id);

    //修改用户组在其它关系表中的用户组名
    public void updateUserGroupNameForRelation(String tableName,String oldName,String newName);

    //根据用户名修改用户组与用户的关联表
    public void updateUserGroupAttrByName(UserGroupAttributeEntity attr);

    //根据用户名删除用户用户成员表中的记录
    public void deleteUserAttributeByName(String username);
}
