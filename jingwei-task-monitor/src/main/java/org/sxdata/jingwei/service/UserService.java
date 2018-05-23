package org.sxdata.jingwei.service;

import org.sxdata.jingwei.entity.UserEntity;
import org.sxdata.jingwei.entity.UserGroupAttributeEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * Created by cRAZY on 2017/3/28.
 */
public interface UserService {
    public void deleteUser(Integer id,String username) throws Exception;

    public void updateUser(UserEntity user,UserGroupAttributeEntity attr) throws Exception;

    public  boolean addUser(UserEntity user,UserGroupAttributeEntity attribute) throws Exception;

    public String getUsersLimit(int start,int limit,HttpServletRequest request) throws Exception;

    public List<UserEntity> getUserByName(String login) throws Exception;

    public String login(String userName,String password,HttpServletRequest request) throws Exception;

    public void allotUserGroup(UserGroupAttributeEntity attr) throws Exception;

    public List<UserEntity> getUsers(String userGroupName) throws Exception;

    public void updatePassword(UserEntity user) throws Exception;
}
