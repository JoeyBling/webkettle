package org.sxdata.jingwei.entity;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by cRAZY on 2017/2/15.
 * 作业
 */
public class JobEntity {
    private Integer jobId;//作业id
    private Date createDate;//创建时间
    private String modifiedUser;//修改用户
    private Date modifiedDate;//修改时间
    private String name;
    private String createUser; //创建用户
    private Integer directoryId;// 作业所在的目录的id,与层级目录表的id对应,用于标识该作业是存放在哪个目录,根目录是/
    private String directoryName;   //作业的完整目录名
    private String belongToTaskGroup;   //所属任务组 多个以逗号形式分隔

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

    public Integer getJobId() {
        return jobId;
    }

    public void setJobId(Integer jobId) {
        this.jobId = jobId;
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
