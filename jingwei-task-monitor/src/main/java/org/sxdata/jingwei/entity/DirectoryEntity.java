package org.sxdata.jingwei.entity;

/**
 * Created by cRAZY on 2017/2/27.
 * 资源库存放的层级目录
 */
public class DirectoryEntity {
    private Integer directoryId;    //目录Id
    private Integer parentDirectoryId;  //该目录的直接父级目录的id
    private String directoryName;   //该目录的名称

    public Integer getDirectoryId() {
        return directoryId;
    }

    public Integer getParentDirectoryId() {
        return parentDirectoryId;
    }

    public String getDirectoryName() {
        return directoryName;
    }

    public void setDirectoryId(Integer directoryId) {
        this.directoryId = directoryId;
    }

    public void setParentDirectoryId(Integer parentDirectoryId) {
        this.parentDirectoryId = parentDirectoryId;
    }

    public void setDirectoryName(String directoryName) {
        this.directoryName = directoryName;
    }
}
