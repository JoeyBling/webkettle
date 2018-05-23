package org.sxdata.jingwei.service;

import net.sf.json.JSONArray;
import org.pentaho.di.trans.step.StepStatus;
import org.sxdata.jingwei.entity.TaskControlEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/3/10.
 */
public interface ControlService {
    public List<TaskControlEntity> getAllRunningJob(String userGroupName) throws Exception;

    public List<TaskControlEntity> getAllRunningTrans(String userGroupName) throws Exception;

    public String getLogDetailForJob(String id,String hostName) throws Exception;

    public String getLogDetailForTrans(String id,String hostName) throws Exception;

    public List<StepStatus> getTransDetail(String id,String hostName) throws Exception;

    public void stopTrans(String hostName,String id) throws Exception;

    public void stopJob(String hostName,String id) throws Exception;

    public void pauseOrStartTrans(String[] id,String[] hostName) throws Exception;
}
