package org.sxdata.jingwei.dao;

import org.flhy.ext.Task.ExecutionTraceEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by cRAZY on 2017/4/5.
 */
@Repository("taskExecutionTraceDao")
public interface ExecutionTraceDao {
    public void addExecutionTrace(ExecutionTraceEntity trace);

    public List<ExecutionTraceEntity> getAllLogByPage(int start,int limit,String statu,String type,String startDate,String taskName,String userGroupName);

    public Integer getAllLogCount(String statu,String type,String startDate,String taskName,String userGroupName);

    public ExecutionTraceEntity getTraceById(Integer id);
}
