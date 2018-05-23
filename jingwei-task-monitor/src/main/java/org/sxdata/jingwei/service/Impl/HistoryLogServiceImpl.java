package org.sxdata.jingwei.service.Impl;

import net.sf.json.JSONObject;
import org.flhy.ext.Task.ExecutionTraceEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.sxdata.jingwei.bean.PageforBean;
import org.sxdata.jingwei.dao.ExecutionTraceDao;
import org.sxdata.jingwei.dao.TaskGroupDao;
import org.sxdata.jingwei.entity.TaskGroupAttributeEntity;
import org.sxdata.jingwei.entity.TaskGroupEntity;
import org.sxdata.jingwei.service.HistoryLogService;
import org.sxdata.jingwei.util.CommonUtil.StringDateUtil;

import java.util.List;

/**
 * Created by cRAZY on 2017/4/5.
 */
@Service
public class HistoryLogServiceImpl implements HistoryLogService{
    @Autowired
    @Qualifier("taskExecutionTraceDao")
    private ExecutionTraceDao executionTraceDao;

    @Autowired
    private TaskGroupDao groupDao;

    @Override
    public String getAllHistoryLog(int start, int limit,String statu,String type,String startDate,String taskName,String userGroupName) throws Exception{
        List<ExecutionTraceEntity> traces=executionTraceDao.getAllLogByPage(start,limit,statu,type,startDate,taskName,userGroupName);
        for(ExecutionTraceEntity trace:traces){
            if(trace.getStatus().equals("成功")){
                trace.setStatus("<font color='green'>"+trace.getStatus()+"</font>");
            }else{
                trace.setStatus("<font color='red'>"+trace.getStatus()+"</font>");
            }
        }

        PageforBean json=new PageforBean();
        json.setTotalProperty(executionTraceDao.getAllLogCount(statu,type,startDate,taskName,userGroupName));
        json.setRoot(traces);

        return JSONObject.fromObject(json, StringDateUtil.configJson("yyyy-MM-dd HH:mm:ss")).toString();
    }

    @Override
    public String getExecutionTraceById(Integer id) throws Exception{
        ExecutionTraceEntity trace=executionTraceDao.getTraceById(id);
        //增加所属任务组属性
        String config=trace.getExecutionConfiguration();
        if(null!=config){
            JSONObject json=JSONObject.fromObject(config);
            List<TaskGroupAttributeEntity> groups=groupDao.getTaskGroupByTaskName(trace.getJobName(),trace.getType());
            if(null!=groups && groups.size()>0){
                String[] groupNames=new String[groups.size()];
                for(int i=0;i<groups.size();i++){
                    TaskGroupAttributeEntity group=groups.get(i);
                    groupNames[i]=group.getTaskGroupName();
                }
                json.put("group",groupNames);
            }else{
                json.put("group","暂未分配任务组");
            }
            trace.setExecutionConfiguration(json.toString());
            trace.setExecutionLog(trace.getExecutionLog().replaceAll("\\\\n","<br/>"));
        }
        return JSONObject.fromObject(trace).toString();
    }
}
