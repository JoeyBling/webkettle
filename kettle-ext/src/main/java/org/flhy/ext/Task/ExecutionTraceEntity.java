package org.flhy.ext.Task;

import java.util.Date;

/**
 * Created by cRAZY on 2017/3/31.
 */
public class ExecutionTraceEntity {
    private Integer fireId;
    private String jobName;
    private Date startTime;
    private Date endTime;
    private String execMethod;
    private String status;
    private String executionConfiguration;
    private String executionLog;
    private String type;

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public String getExecMethod() {
        return execMethod;
    }

    public void setExecMethod(String execMethod) {
        this.execMethod = execMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getExecutionConfiguration() {
        return executionConfiguration;
    }

    public void setExecutionConfiguration(String executionConfiguration) {
        this.executionConfiguration = executionConfiguration;
    }

    public String getExecutionLog() {
        return executionLog;
    }

    public void setExecutionLog(String executionLog) {
        this.executionLog = executionLog;
    }

    public Integer getFireId() {
        return fireId;
    }

    public void setFireId(Integer fireId) {
        this.fireId = fireId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
