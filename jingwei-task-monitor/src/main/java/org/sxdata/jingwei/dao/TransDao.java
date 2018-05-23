package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.TransformationEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/2/22.
 */
@Repository
public interface TransDao {
    public List<TransformationEntity> getThisPageTrans(int start,int limit,String userGroupName); //获取当页的记录

    public Integer getTotalSize(String userGroupName);  //获取总记录数

    public List<TransformationEntity> conditionFindTrans(int start,int limit,String namme,String date,String userGroupName);//带条件的查询

    public Integer conditionFindTransCount(String name,String date,String userGroupName);//带条件查询总记录数u

    public TransformationEntity getTransByName(String transName);

    public void updateTransNameforTrans(String oldName,String newName);

}
