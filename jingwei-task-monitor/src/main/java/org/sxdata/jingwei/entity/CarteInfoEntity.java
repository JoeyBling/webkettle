package org.sxdata.jingwei.entity;

import java.util.Date;

/**
 * Created by cRAZY on 2017/3/17.
 */
public class CarteInfoEntity {
    private long carteRecordId;
    private Date nDate;
    private Integer slaveId;
    private Integer threadNum;
    private Integer jobNum;
    private Integer transNum;
    private Integer freeMem;
    private Integer totalMem;
    private String usedMemPercent;
    private Float loadAvg;
    private Integer finishedJobNum;
    private Integer finishedTransNum;
    private String hostFreeMem;
    private String hostCpuUsage;
    private String hostFreeDisk;
    private String xHour;

    public String getxHour() {
        return xHour;
    }

    public void setxHour(String xHour) {
        this.xHour = xHour;
    }

    public long getCarteRecordId() {
        return carteRecordId;
    }

    public Date getnDate() {
        return nDate;
    }

    public Integer getSlaveId() {
        return slaveId;
    }

    public Integer getThreadNum() {
        return threadNum;
    }

    public Integer getJobNum() {
        return jobNum;
    }

    public Integer getTransNum() {
        return transNum;
    }

    public Integer getFreeMem() {
        return freeMem;
    }

    public Integer getTotalMem() {
        return totalMem;
    }

    public String getUsedMemPercent() {
        return usedMemPercent;
    }

    public Float getLoadAvg() {
        return loadAvg;
    }

    public Integer getFinishedJobNum() {
        return finishedJobNum;
    }

    public Integer getFinishedTransNum() {
        return finishedTransNum;
    }

    public String getHostFreeMem() {
        return hostFreeMem;
    }

    public String getHostCpuUsage() {
        return hostCpuUsage;
    }

    public String getHostFreeDisk() {
        return hostFreeDisk;
    }

    public void setCarteRecordId(long carteRecordId) {
        this.carteRecordId = carteRecordId;
    }

    public void setnDate(Date nDate) {
        this.nDate = nDate;
    }

    public void setSlaveId(Integer slaveId) {
        this.slaveId = slaveId;
    }

    public void setThreadNum(Integer threadNum) {
        this.threadNum = threadNum;
    }

    public void setJobNum(Integer jobNum) {
        this.jobNum = jobNum;
    }

    public void setTransNum(Integer transNum) {
        this.transNum = transNum;
    }

    public void setFreeMem(Integer freeMem) {
        this.freeMem = freeMem;
    }

    public void setTotalMem(Integer totalMem) {
        this.totalMem = totalMem;
    }

    public void setUsedMemPercent(String usedMemPercent) {
        this.usedMemPercent = usedMemPercent;
    }

    public void setLoadAvg(Float loadAvg) {
        this.loadAvg = loadAvg;
    }

    public void setFinishedJobNum(Integer finishedJobNum) {
        this.finishedJobNum = finishedJobNum;
    }

    public void setFinishedTransNum(Integer finishedTransNum) {
        this.finishedTransNum = finishedTransNum;
    }

    public void setHostFreeMem(String hostFreeMem) {
        this.hostFreeMem = hostFreeMem;
    }

    public void setHostCpuUsage(String hostCpuUsage) {
        this.hostCpuUsage = hostCpuUsage;
    }

    public void setHostFreeDisk(String hostFreeDisk) {
        this.hostFreeDisk = hostFreeDisk;
    }

    public CarteInfoEntity(Date nDate, Integer slaveId, Integer threadNum, Integer jobNum, Integer transNum, Integer freeMem, Integer totalMem, String usedMemPercent, Float loadAvg, Integer finishedJobNum, Integer finishedTransNum, String hostFreeMem, String hostCpuUsage, String hostFreeDisk) {

        this.nDate = nDate;
        this.slaveId = slaveId;
        this.threadNum = threadNum;
        this.jobNum = jobNum;
        this.transNum = transNum;
        this.freeMem = freeMem;
        this.totalMem = totalMem;
        this.usedMemPercent = usedMemPercent;
        this.loadAvg = loadAvg;
        this.finishedJobNum = finishedJobNum;
        this.finishedTransNum = finishedTransNum;
        this.hostFreeMem = hostFreeMem;
        this.hostCpuUsage = hostCpuUsage;
        this.hostFreeDisk = hostFreeDisk;
    }

    public CarteInfoEntity(){

    }
}
