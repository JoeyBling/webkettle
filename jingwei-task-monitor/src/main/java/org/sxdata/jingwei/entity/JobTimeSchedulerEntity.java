package org.sxdata.jingwei.entity;

/**
 * Created by cRAZY on 2017/3/6.
 * 作业定时调度类 包含了定时调度的时间信息以及被调度的作业、节点等信息
 */
public class JobTimeSchedulerEntity {
    private long idJobtask;
    private Integer idJob;
    private String jobName;
    private String slaves;
    private String isrepeat;
    private Integer schedulertype;
    private Integer intervalminutes;
    private Integer hour;
    private Integer minutes;
    private Integer weekday;
    private Integer dayofmonth;
    private String timerInfo;   //定时信息的详细描述
    private String hostName;    //节点ip
    private String executionConfig; //执行定时作业时的配置信息 不参与持久化
    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getIdJobtask() {
        return idJobtask;
    }

    public void setIdJobtask(long idJobtask) {
        this.idJobtask = idJobtask;
    }

    public Integer getIdJob() {
        return idJob;
    }

    public void setIdJob(Integer idJob) {
        this.idJob = idJob;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getSlaves() {
        return slaves;
    }

    public void setSlaves(String slaves) {
        this.slaves = slaves;
    }

    public String getIsrepeat() {
        return isrepeat;
    }

    public void setIsrepeat(String isrepeat) {
        this.isrepeat = isrepeat;
    }

    public Integer getSchedulertype() {
        return schedulertype;
    }

    public void setSchedulertype(Integer schedulertype) {
        this.schedulertype = schedulertype;
    }

    public Integer getIntervalminutes() {
        return intervalminutes;
    }

    public void setIntervalminutes(Integer intervalminutes) {
        this.intervalminutes = intervalminutes;
    }

    public Integer getHour() {
        return hour;
    }

    public void setHour(Integer hour) {
        this.hour = hour;
    }

    public Integer getMinutes() {
        return minutes;
    }

    public void setMinutes(Integer minutes) {
        this.minutes = minutes;
    }

    public Integer getWeekday() {
        return weekday;
    }

    public void setWeekday(Integer weekday) {
        this.weekday = weekday;
    }

    public Integer getDayofmonth() {
        return dayofmonth;
    }

    public void setDayofmonth(Integer dayofmonth) {
        this.dayofmonth = dayofmonth;
    }

    public String getTimerInfo() {
        return timerInfo;
    }

    public void setTimerInfo(String timerInfo) {
        this.timerInfo = timerInfo;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getExecutionConfig() {
        return executionConfig;
    }

    public void setExecutionConfig(String executionConfig) {
        this.executionConfig = executionConfig;
    }
}
