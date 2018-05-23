package org.sxdata.jingwei.entity;

import java.sql.Timestamp;
import java.util.Date;

/**
 * Created by cRAZY on 2017/2/22.
 * 转换
 */
public class TransformationEntity {
    private Date createDate;//创建时间
    private String modifiedUser;//修改用户
    private Date modifiedDate;//修改时间
    private String name;
    private String createUser; //创建用户
    private Integer transformationId;
    private Integer directoryId;    //与层级目录表主键关联 代表该转换存放于哪个目录下
    private String directoryName;   //所在的直接父级目录名
    private String belongToTaskGroup;

    public String getBelongToTaskGroup() {
        return belongToTaskGroup;
    }

    public void setBelongToTaskGroup(String belongToTaskGroup) {
        this.belongToTaskGroup = belongToTaskGroup;
    }

    public String getDirectoryName() {
        return directoryName;
    }

    public void setDirectoryName(String directoryName) {
        this.directoryName = directoryName;
    }


    public Integer getDirectoryId() {
        return directoryId;
    }

    public void setDirectoryId(Integer directoryId) {
        this.directoryId = directoryId;
    }

    public void setTransformationId(Integer transformationId) {
        this.transformationId = transformationId;
    }

    public Integer getTransformationId() {
        return transformationId;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public String getModifiedUser() {
        return modifiedUser;
    }

    public Date getModifiedDate() {
        return modifiedDate;
    }

    public String getName() {
        return name;
    }

    public String getCreateUser() {
        return createUser;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public void setModifiedUser(String modifiedUser) {
        this.modifiedUser = modifiedUser;
    }

    public void setModifiedDate(Date modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCreateUser(String createUser) {
        this.createUser = createUser;
    }
}
