package org.sxdata.jingwei.service;

import net.sf.json.JSONObject;
import org.flhy.ext.JobExecutor;
import org.sxdata.jingwei.entity.DirectoryEntity;
import org.sxdata.jingwei.entity.JobEntity;
import org.sxdata.jingwei.entity.JobTimeSchedulerEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by cRAZY on 2017/2/22.
 */
public interface JobService {
    public JSONObject findJobs(int start,int limit,String name,String createDate,String userGroupName) throws Exception;

    public void deleteJobs(String jobPath,String flag) throws Exception;

    public void executeJob(String path,Integer slaveId) throws Exception;

    public boolean judgeJobIsAlike(JobTimeSchedulerEntity willAddJobTimer);

    public void addTimeExecuteJob(String graphXml,String executionConfiguration,HttpServletRequest request) throws Exception;

    public boolean beforeTimeExecuteJob(Map<String, Object> params,HttpServletRequest request) throws Exception;

    public List<JobTimeSchedulerEntity> getAllTimerJob() throws Exception;

    public JobEntity getJobById(Integer jobId) throws Exception;

    public List<JobEntity> getJobPath(List<JobEntity> jobs) throws Exception;

    public JobEntity getJobByName(String jobName) throws Exception;

    public boolean updateJobName(String oldName,String newName);
}
