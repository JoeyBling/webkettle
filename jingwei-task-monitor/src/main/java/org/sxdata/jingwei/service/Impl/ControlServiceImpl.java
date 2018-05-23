package org.sxdata.jingwei.service.Impl;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.flhy.ext.JobExecutor;
import org.flhy.ext.TransExecutor;
import org.flhy.ext.trans.TransMetaCodec;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Result;
import org.pentaho.di.job.Job;
import org.pentaho.di.job.JobExecutionConfiguration;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.trans.Trans;
import org.pentaho.di.trans.TransExecutionConfiguration;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepStatus;
import org.pentaho.di.www.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.sxdata.jingwei.dao.SlaveDao;
import org.sxdata.jingwei.dao.TaskGroupDao;
import org.sxdata.jingwei.entity.JobEntity;
import org.sxdata.jingwei.entity.SlaveEntity;
import org.sxdata.jingwei.entity.TaskControlEntity;
import org.sxdata.jingwei.entity.TransformationEntity;
import org.sxdata.jingwei.service.ControlService;
import org.sxdata.jingwei.util.TaskUtil.CarteClient;
import org.sxdata.jingwei.util.TaskUtil.KettleEncr;

import java.util.*;

/**
 * Created by cRAZY on 2017/3/10.
 */
//任务监控
@Service
public class ControlServiceImpl extends StopTransServlet implements ControlService{
    @Autowired
    SlaveDao slaveDao;
    @Autowired
    TaskGroupDao taskGroupDao;

    @Override
    //获取转换的详情列表
    public List<StepStatus> getTransDetail(String id,String hostName) throws Exception {
        List<StepStatus> result=null;
        if(hostName.equals("本地执行")){
            Hashtable<String,TransExecutor> table= TransExecutor.getExecutors();
            Enumeration<String> keys=table.keys();
            while (keys.hasMoreElements()){
                String transExecutorId = keys.nextElement();
                TransExecutor transExecutor = table.get(transExecutorId);
                if(transExecutor.getExecutionId().equals(id)){
                    result=transExecutor.getTransStepStatus();
                }
            }
        }else{
            SlaveEntity slave=slaveDao.getSlaveByHostName(hostName);
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient carte=new CarteClient(slave);
            //获取当前节点下所有正在运行的转换
            String status=carte.getStatusOrNull();
            SlaveServerStatus serverStatus = SlaveServerStatus.fromXML(status);
            //遍历这些转换,判断和所需要查询的ID是否相同
            for (SlaveServerTransStatus transStatus : serverStatus.getTransStatusList()) {
                //如果转换没有停止
                if(transStatus.isRunning() || transStatus.isPaused()){
                    String transStatusXml = carte.getTransStatus(transStatus.getTransName(), transStatus.getId());
                    SlaveServerTransStatus realTransStatus = SlaveServerTransStatus.fromXML(transStatusXml);
                    //如果相同则获取当前正在运行的转换详情
                    if(realTransStatus.getId().equals(id.trim())){
                        result=realTransStatus.getStepStatusList();
                    }
                }
            }
        }
        return result;
    }

    @Override
    //获取作业日志
    public String getLogDetailForJob(String id,String hostName) throws Exception {
        String log="";
        if(hostName.equals("本地执行")){
            Hashtable<String,JobExecutor> table=JobExecutor.getExecutors();
            Enumeration<String> keys=table.keys();
            while (keys.hasMoreElements()){
                String jobExecutorId=keys.nextElement();
                JobExecutor jobExecutor=table.get(jobExecutorId);
                if(jobExecutor.getExecutionId().equals(id)){
                    log=jobExecutor.getExecutionLog();
                    log=log.replaceAll("\n","<br/>");
                }
            }
        }else{
            SlaveEntity slave=slaveDao.getSlaveByHostName(hostName);
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient cc=new CarteClient(slave);
            log=cc.getJobLogText(id);
            log=log.replaceAll("\n","<br/>");
        }
        return log;
    }

    @Override
    //获取转换日志
    public String getLogDetailForTrans(String id,String hostName) throws Exception {
        String result="";
        if(hostName.equals("本地执行")){
            Hashtable<String,TransExecutor> table= TransExecutor.getExecutors();
            Enumeration<String> keys=table.keys();
            while (keys.hasMoreElements()){
                String transExecutorId = keys.nextElement();
                TransExecutor transExecutor = table.get(transExecutorId);
                if(id.equals(transExecutor.getExecutionId())){
                    result=transExecutor.getExecutionLog();
                    result=result.replaceAll("\n","<br/>");
                }
            }
        }else{
            SlaveEntity slave=slaveDao.getSlaveByHostName(hostName);
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient cc=new CarteClient(slave);
            result=cc.getTransLogText(id);
            result=result.replaceAll("\n","<br/>");
        }
        return result;
    }


    public String transToStatusDesc(SlaveServerTransStatus realTransStatus) throws Exception{
        String running_status = null;
        if(realTransStatus.isRunning()) {
            running_status = "运行中";
        }else if(realTransStatus.isPaused()){
            running_status = "暂停";
        }else {
            running_status = realTransStatus.getStatusDescription();
        }
        return running_status;
    }

    //暂停/开始转换
    @Override
    public void pauseOrStartTrans(String[] id,String[] hostName) throws Exception {
        for(int i=0;i<id.length;i++){
            if(hostName[i].equals("本地执行")){
                Hashtable<String,TransExecutor> table= TransExecutor.getExecutors();
                Enumeration<String> keys=table.keys();
                while (keys.hasMoreElements()){
                    String transExecutorId = keys.nextElement();
                    TransExecutor transExecutor = table.get(transExecutorId);
                    if(id[i].equals(transExecutor.getExecutionId())){
                        Trans trans=transExecutor.getTrans();
                        if(!trans.isPaused()){
                            trans.pauseRunning();
                        }else{
                            trans.resumeRunning();
                        }
                    }
                }
            }else{
                SlaveEntity slave=slaveDao.getSlaveByHostName(hostName[i]);
                slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
                CarteClient cc=new CarteClient(slave);
                cc.pauseTrans(id[i]);
            }
        }
    }

    //获取所有运行中的转换
    @Override
    public List<TaskControlEntity> getAllRunningTrans(String userGroupName) throws Exception {
        //获取该用户组下所有可见的转换
        List<TransformationEntity> transItems=taskGroupDao.getAllTrans(userGroupName);

        List<TaskControlEntity> items=new ArrayList<TaskControlEntity>();
        //获取内存中正在运行的转换   本地执行的转换
        Hashtable<String,TransExecutor> table= TransExecutor.getExecutors();
        Enumeration<String> keys=table.keys();
        while (keys.hasMoreElements()){
            TransExecutor transExecutor = table.get(keys.nextElement());
            TransExecutionConfiguration executionConfiguration=transExecutor.getExecutionConfiguration();
            SlaveServer slaveServer =executionConfiguration.getRemoteServer();
            Trans trans=transExecutor.getTrans();
            //转换未完成并且是在本地执行
            if(!transExecutor.isFinished() && executionConfiguration.isExecutingLocally() && !transExecutor.isClickStop()){
                //判断当前转换是否是该用户的可见转换
                boolean isSee=false;
                for(TransformationEntity transformation:transItems){
                    if(transformation.getName().equals(transExecutor.getTransMeta().getName())){
                        isSee=true;
                        break;
                    }
                }
                if (!isSee)
                    continue;
                //本地执行
                TaskControlEntity taskControl=new TaskControlEntity();
                taskControl.setName(transExecutor.getTransMeta().getName());
                taskControl.setId(transExecutor.getExecutionId());
                taskControl.setType("转换");
                taskControl.setCarteObjectId(transExecutor.getCarteObjectId());
                taskControl.setHostName("本地执行");
                if(trans.isPaused()){
                    taskControl.setIsStart("暂停中");
                }else{
                    taskControl.setIsStart("正在运行");
                }
                items.add(taskControl);
            }
        }
        //获取远程执行的转换 从carte服务上获取
        List<SlaveEntity> slaves=slaveDao.getAllSlave("");
        for(SlaveEntity slave:slaves){
            //对数据库里取出的密码进行转码
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient carte=new CarteClient(slave);
            String status=carte.getStatusOrNull();
            if(status==null) continue;
            SlaveServerStatus serverStatus = SlaveServerStatus.fromXML(status);
            for (SlaveServerTransStatus transStatus : serverStatus.getTransStatusList()) {
                //转换是运行或者暂停状态
                if(transStatus.isRunning() || transStatus.isPaused()){
                    TaskControlEntity item=new TaskControlEntity();
                    String transStatusXml = carte.getTransStatus(transStatus.getTransName(), transStatus.getId());
                    SlaveServerTransStatus realTransStatus = SlaveServerTransStatus.fromXML(transStatusXml);
                    //判断当前转换是否是该用户的可见转换
                    boolean isSee=false;
                    for(TransformationEntity transformation:transItems){
                        if(transformation.getName().equals(realTransStatus.getTransName())){
                            isSee=true;
                            break;
                        }
                    }
                    if (!isSee)
                        continue;
                    item.setType("转换");
                    item.setHostName(slave.getHostName());
                    item.setName(realTransStatus.getTransName());
                    item.setId(transStatus.getId());
                    if(transStatus.isRunning()){
                        item.setIsStart("正在运行");
                    }else if(transStatus.isPaused()){
                        item.setIsStart("暂停中");
                    }
                    items.add(item);
                }
            }
        }
        return items;
    }

    @Override
    //获取所有运行中的作业
    public List<TaskControlEntity> getAllRunningJob(String userGroupName) throws Exception{
        //获取所有运行中的作业
        List<JobEntity> jobItems=taskGroupDao.getAllJob(userGroupName);
        List<TaskControlEntity> items=new ArrayList<TaskControlEntity>();
        //获取本地执行的作业
        Hashtable<String,JobExecutor> table=JobExecutor.getExecutors();
        Enumeration<String> keys=table.keys();
        while (keys.hasMoreElements()){
            String jobExecutorId=keys.nextElement();
            JobExecutor jobExecutor=table.get(jobExecutorId);
            JobExecutionConfiguration executionConfiguration=jobExecutor.getExecutionConfiguration();
            //作业未完成 而且是本地运行
            if(!jobExecutor.isFinished() && executionConfiguration.isExecutingLocally() && !jobExecutor.isClickStop()){
                //判断当前作业是否是该用户的可见作业
                boolean isSee=false;
                for(JobEntity thisJob:jobItems){
                    if(thisJob.getName().equals(jobExecutor.getJobMeta().getName())){
                        isSee=true;
                        break;
                    }
                }
                if (!isSee)
                    continue;
                TaskControlEntity taskControl=new TaskControlEntity();
                taskControl.setName(jobExecutor.getJobMeta().getName());
                taskControl.setId(jobExecutor.getExecutionId());
                taskControl.setType("作业");
                taskControl.setIsStart("");
                taskControl.setCarteObjectId(jobExecutor.getCarteObjectId());
                taskControl.setHostName("本地执行");
                items.add(taskControl);
            }
        }
        //从carte服务获取远程执行的作业  从所有节点上获取正在运行的作业
        List<SlaveEntity> slaves=slaveDao.getAllSlave("");
        for(SlaveEntity slave:slaves){
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient carte=new CarteClient(slave);
            String status=carte.getStatusOrNull();
            if(status==null) continue;
            SlaveServerStatus serverStatus=SlaveServerStatus.fromXML(status);
            for(SlaveServerJobStatus jobStatus:serverStatus.getJobStatusList()){
                if(jobStatus.isRunning()){
                    TaskControlEntity item=new TaskControlEntity();
                    String jobStatusxml=carte.getJobStatus(jobStatus.getJobName(), jobStatus.getId());
                    SlaveServerJobStatus realJobStatus=SlaveServerJobStatus.fromXML(jobStatusxml);
                    //判断当前作业是否是该用户的可见作业
                    boolean isSee=false;
                    for(JobEntity thisJob:jobItems){
                        if(thisJob.getName().equals(realJobStatus.getJobName())){
                            isSee=true;
                            break;
                        }
                    }
                    if (!isSee)
                        continue;
                    //根据前台展示需求来封装 暂时只展示作业名以及所运行节点
                    item.setHostName(slave.getHostName());
                    item.setId(realJobStatus.getId());
                    item.setName(jobStatus.getJobName());
                    item.setType("作业");
                    item.setIsStart("");
                    items.add(item);
                }
            }
        }
        return  items;
    }

    @Override
    public void stopTrans(String hostName,String id) throws Exception {
        if(hostName.equals("本地执行")){
            Hashtable<String,TransExecutor> table= TransExecutor.getExecutors();
            Enumeration<String> keys=table.keys();
            while (keys.hasMoreElements()){
                String transExecutorId = keys.nextElement();
                TransExecutor transExecutor = table.get(transExecutorId);
                if(transExecutor.getExecutionId().equals(id) && !transExecutor.isFinished() && !transExecutor.isClickStop()){
                    transExecutor.stop();
                    transExecutor.setIsClickStop(true);
                    return;
                }
            }
        }else{
            SlaveEntity slave=slaveDao.getSlaveByHostName(hostName);
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient cc=new CarteClient(slave);
            cc.stopTrans(id);
        }
    }

    @Override
    public void stopJob(String hostName,String id) throws Exception {
        if(hostName.equals("本地执行")){
            Hashtable<String,JobExecutor> table= JobExecutor.getExecutors();
            Enumeration<String> keys=table.keys();
            while (keys.hasMoreElements()){
                String jobExecutorId = keys.nextElement();
                JobExecutor jobExecutor = table.get(jobExecutorId);
                if(jobExecutor.getExecutionId().equals(id)){
                    if(hostName.trim().equals("本地执行")){
                        jobExecutor.stop();
                        jobExecutor.setIsClickStop(true);
                    }
                }
            }
        }else{
            SlaveEntity slave=slaveDao.getSlaveByHostName(hostName);
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient cc=new CarteClient(slave);
            cc.stopJob(id);
        }
    }
}
