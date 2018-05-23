package org.sxdata.jingwei.entity;

/**
 * Created by cRAZY on 2017/3/10.
 */
public class TaskControlEntity {
    private String id;
    private String name;
    private String hostName;
    private String type;
    private String isStart;
    private String carteObjectId;

    public String getCarteObjectId() {
        return carteObjectId;
    }

    public void setCarteObjectId(String carteObjectId) {
        this.carteObjectId = carteObjectId;
    }

    public String getIsStart() {
        return isStart;
    }

    public void setIsStart(String isStart) {
        this.isStart = isStart;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getHostName() {
        return hostName;
    }

    public String getType() {
        return type;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public void setType(String type) {
        this.type = type;
    }
}
