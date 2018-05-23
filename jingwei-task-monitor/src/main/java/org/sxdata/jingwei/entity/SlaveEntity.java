package org.sxdata.jingwei.entity;

/**
 * Created by cRAZY on 2017/2/28.
 * 节点
 */
public class SlaveEntity {
    private Integer slaveId;    //节点id
    private String name;
    private String hostName;    //节点的ip地址
    private String username;
    private String password;
    private String port;        //端口
    private String webappName;
    private String proxyHostname;
    private String proxyPort;
    private String nonproxyHosts;
    private char master;
    private double loadAvg;     //负载指数
    private String status;      //状态
    private Integer runningJobNum;  //运行中的作业数
    private Integer runningTransNum;    //运行中的转换数
    private Integer finishJobNum;   //当天完成的作业数
    private Integer finishTransNum;  //当天完成的转换数
    private String upTime;  //在线时长

    public String getNonproxyHosts() {
        return nonproxyHosts;
    }

    public void setNonproxyHosts(String nonproxyHosts) {
        this.nonproxyHosts = nonproxyHosts;
    }

    public String getWebappName() {
        return webappName;
    }

    public void setWebappName(String webappName) {
        this.webappName = webappName;
    }

    public String getProxyHostname() {
        return proxyHostname;
    }

    public void setProxyHostname(String proxyHostname) {
        this.proxyHostname = proxyHostname;
    }

    public String getProxyPort() {
        return proxyPort;
    }

    public void setProxyPort(String proxyPort) {
        this.proxyPort = proxyPort;
    }

    public char getMaster() {
        return master;
    }

    public void setMaster(char master) {
        this.master = master;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRunningJobNum(Integer runningJobNum) {
        this.runningJobNum = runningJobNum;
    }

    public void setRunningTransNum(Integer runningTransNum) {
        this.runningTransNum = runningTransNum;
    }

    public void setFinishJobNum(Integer finishJobNum) {
        this.finishJobNum = finishJobNum;
    }

    public void setFinishTransNum(Integer finishTransNum) {
        this.finishTransNum = finishTransNum;
    }

    public void setUpTime(String upTime) {
        this.upTime = upTime;
    }

    public Integer getRunningJobNum() {
        return runningJobNum;
    }

    public Integer getRunningTransNum() {
        return runningTransNum;
    }

    public Integer getFinishJobNum() {
        return finishJobNum;
    }

    public Integer getFinishTransNum() {
        return finishTransNum;
    }

    public String getUpTime() {
        return upTime;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setLoadAvg(double loadAvg) {
        this.loadAvg = loadAvg;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getLoadAvg() {
        return loadAvg;
    }

    public String getStatus() {
        return status;
    }

    public Integer getSlaveId() {
        return slaveId;
    }

    public String getHostName() {
        return hostName;
    }

    public String getPort() {
        return port;
    }

    public void setSlaveId(Integer slaveId) {
        this.slaveId = slaveId;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public void setPort(String port) {
        this.port = port;
    }
}
