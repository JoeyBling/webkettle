package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.UserEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/3/1.
 */
@Repository
public interface UserDao {

    public List<UserEntity> getUserbyName(String name);

    public List<UserEntity> getUsersLimit(int start,int limit,String userGroupName,String username,Integer userType);

    public void updateUser(UserEntity user);

    public void deleteUser(Integer userId);

    public void addUser(UserEntity user);

    public Integer getUserCount(String userGroupName);

    public List<UserEntity> getAllUsers();

    public Integer selectMaxId();

    public List<UserEntity> getUsers(String userGroupName);

}
