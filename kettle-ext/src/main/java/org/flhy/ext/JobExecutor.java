package org.flhy.ext;

import java.text.SimpleDateFormat;
import java.util.*;

import com.mxgraph.util.mxUtils;
import org.apache.ibatis.session.SqlSession;
import org.flhy.ext.Task.ExecutionTraceEntity;
import org.flhy.ext.Task.MybatisDaoSuppo;
import org.flhy.ext.utils.ExceptionUtils;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.Result;
import org.pentaho.di.core.gui.JobTracker;
import org.pentaho.di.core.logging.KettleLogLayout;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.KettleLoggingEvent;
import org.pentaho.di.core.logging.LoggingObjectType;
import org.pentaho.di.core.logging.LoggingRegistry;
import org.pentaho.di.core.logging.SimpleLoggingObject;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.job.Job;
import org.pentaho.di.job.JobEntryResult;
import org.pentaho.di.job.JobExecutionConfiguration;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.ui.spoon.job.JobEntryCopyResult;
import org.pentaho.di.www.SlaveServerJobStatus;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class JobExecutor implements Runnable {
	private String username;
	private boolean isClickStop=false;
	private String executionId;
	private JobExecutionConfiguration executionConfiguration;
	private JobMeta jobMeta = null;
	private String carteObjectId = null;
	private Job job = null;
	private static final Class PKG = JobEntryCopyResult.class;
	private boolean finished = false;
	private long errCount = 0;
	private static Hashtable<String, JobExecutor> executors = new Hashtable<String, JobExecutor>();
//	private Map<StepMeta, String> stepLogMap = new HashMap<StepMeta, String>();
	public boolean isFinished() {
		return finished;
	}
	public Job getJob() {
		return job;
	}
	public String getExecutionId() {
		return executionId;
	}
	public static JobExecutor getExecutor(String executionId) {
		return executors.get(executionId);
	}
	public void setJob(Job job) {
		this.job = job;
	}
	public JobExecutionConfiguration getExecutionConfiguration() {
		return executionConfiguration;
	}
	public void setExecutionConfiguration(JobExecutionConfiguration executionConfiguration) {
		this.executionConfiguration = executionConfiguration;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public boolean isClickStop() {
		return isClickStop;
	}

	public void setIsClickStop(boolean isClickStop) {
		this.isClickStop = isClickStop;
	}

	public String getCarteObjectId() {
		return carteObjectId;
	}
	public JobMeta getJobMeta() {
		return jobMeta;
	}
	public void setJobMeta(JobMeta jobMeta) {
		this.jobMeta = jobMeta;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}

	public long getErrCount() {
		return errCount;
	}
	public static Hashtable<String, JobExecutor> getExecutors(){
		return executors;
	}
	public static void remove(String executionId) {
		executors.remove(executionId);
	}
	public JobExecutor(JobExecutionConfiguration executionConfiguration, JobMeta jobMeta) {
		this.executionId = UUID.randomUUID().toString().replaceAll("-", "");
		this.executionConfiguration = executionConfiguration;
		this.jobMeta = jobMeta;
	}


	public static synchronized JobExecutor initExecutor(JobExecutionConfiguration executionConfiguration, JobMeta jobMeta) {
		JobExecutor jobExecutor = new JobExecutor(executionConfiguration, jobMeta);
		executors.put(jobExecutor.getExecutionId(), jobExecutor);
		return jobExecutor;
	}

	@Override
	public void run() {
		ExecutionTraceEntity trace=new ExecutionTraceEntity();
		try {
			for (String varName : executionConfiguration.getVariables().keySet()) {
				String varValue = executionConfiguration.getVariables().get(varName);
				jobMeta.setVariable(varName, varValue);
			}

			for (String paramName : executionConfiguration.getParams().keySet()) {
				String paramValue = executionConfiguration.getParams().get(paramName);
				jobMeta.setParameterValue(paramName, paramValue);
			}
			trace.setStartTime(new Date());
			if (executionConfiguration.isExecutingLocally()) {
				 SimpleLoggingObject spoonLoggingObject = new SimpleLoggingObject( "SPOON", LoggingObjectType.SPOON, null );
			     spoonLoggingObject.setContainerObjectId( executionId );
			     spoonLoggingObject.setLogLevel( executionConfiguration.getLogLevel() );
				job = new Job( App.getInstance().getRepository(), jobMeta, spoonLoggingObject );
				job.setLogLevel(executionConfiguration.getLogLevel());
				job.shareVariablesWith(jobMeta);
				job.setInteractive(true);
				job.setGatheringMetrics(executionConfiguration.isGatheringMetrics());
				job.setArguments(executionConfiguration.getArgumentStrings());

				job.getExtensionDataMap().putAll(executionConfiguration.getExtensionOptions());

				// If there is an alternative start job entry, pass it to the job
	            //
	            if ( !Const.isEmpty( executionConfiguration.getStartCopyName() ) ) {
	            	JobEntryCopy startJobEntryCopy = jobMeta.findJobEntry( executionConfiguration.getStartCopyName(), executionConfiguration.getStartCopyNr(), false );
	            	job.setStartJobEntryCopy( startJobEntryCopy );
	            }
	            // Set the named parameters
	            Map<String, String> paramMap = executionConfiguration.getParams();
	            Set<String> keys = paramMap.keySet();
				for (String key : keys) {
					job.getJobMeta().setParameterValue(key, Const.NVL(paramMap.get(key), ""));
				}
	            job.getJobMeta().activateParameters();
	            job.start();
				while(!job.isFinished()){
					Thread.sleep(500);
				}
				errCount = job.getErrors();
			} else if (executionConfiguration.isExecutingRemotely()) {
				carteObjectId = Job.sendToSlaveServer( jobMeta, executionConfiguration, App.getInstance().getRepository(), App.getInstance().getMetaStore() );

				SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
				boolean running = true;
				while(running) {
					SlaveServerJobStatus jobStatus = remoteSlaveServer.getJobStatus(jobMeta.getName(), carteObjectId, 0);
					running = jobStatus.isRunning();
					if(!running)
						errCount = jobStatus.getResult().getNrErrors();
					Thread.sleep(500);
				}
			}
			//记录日志
			trace.setEndTime(new Date());
			trace.setJobName(jobMeta.getName());
			//运行结果
			String status="成功";
			if(errCount>0){
				status="失败";
			}
			trace.setStatus(status);
			//任务类型
			trace.setType("job");
			//日志信息
			net.sf.json.JSONObject logJSON=new net.sf.json.JSONObject();
			logJSON.put("jobMeasure",this.getJobMeasure());
			logJSON.put("finished",true);
			logJSON.put("log", StringEscapeHelper.decode(this.getExecutionLog()));
			trace.setExecutionLog(logJSON.toString());
			//运行方式
			String execMethod="";
			if(executionConfiguration.isExecutingLocally()){
				execMethod="本地";
			}else{
				execMethod="远程:"+executionConfiguration.getRemoteServer().getHostname();
			}
			trace.setExecMethod(execMethod);
			//executionConfigration
			net.sf.json.JSONObject json=new net.sf.json.JSONObject();
			String xml=executionConfiguration.getXML();
			//解析xml
			Document doc = mxUtils.parseXml(xml);
			Element root = doc.getDocumentElement();
			NodeList items1=root.getChildNodes();
			for(int i=0;i<items1.getLength();i++){
				Node node1=items1.item(i);
				if(node1.getNodeType()!=3){
					//判断一级节点下是否还存在子节点
					NodeList items2=node1.getChildNodes();
					if(items2.getLength()>1){
						net.sf.json.JSONArray array=new net.sf.json.JSONArray();
						for(int j=0;j<items2.getLength();j++){
							Node node2=items2.item(j);
							if(node2.getNodeType()!=3){
								net.sf.json.JSONObject obj=new net.sf.json.JSONObject();
								obj.put(node2.getNodeName(),node2.getTextContent().replaceAll("\n","").trim());
								array.add(obj);
							}
						}
						json.put(node1.getNodeName(),array);
					}else{
						json.put(node1.getNodeName(),node1.getTextContent().replaceAll("\n","").trim());
					}
				}
			}
			trace.setExecutionConfiguration(json.toString());
		} catch(Exception e) {
			try {
				trace.setEndTime(new Date());
				trace.setJobName(jobMeta.getName());
				trace.setStatus("系统调度失败");
				trace.setExecutionLog(ExceptionUtils.toString(e));
				//任务类型
				trace.setType("trans");
				String execMethod="";
				if(executionConfiguration.isExecutingLocally()){
					execMethod="本地";
				}else{
					execMethod="远程:"+executionConfiguration.getRemoteServer().getHostname();
				}
				trace.setExecMethod(execMethod);
				//executionConfigration
				net.sf.json.JSONObject json=new net.sf.json.JSONObject();
				String xml=executionConfiguration.getXML();
				//解析xml
				Document doc = mxUtils.parseXml(xml);
				Element root = doc.getDocumentElement();
				NodeList items1=root.getChildNodes();
				for(int i=0;i<items1.getLength();i++){
					Node node1=items1.item(i);
					if(node1.getNodeType()!=3){
						//判断一级节点下是否还存在子节点
						NodeList items2=node1.getChildNodes();
						if(items2.getLength()>1){
							net.sf.json.JSONArray array=new net.sf.json.JSONArray();
							for(int j=0;j<items2.getLength();j++){
								Node node2=items2.item(j);
								if(node2.getNodeType()!=3){
									net.sf.json.JSONObject obj=new net.sf.json.JSONObject();
									obj.put(node2.getNodeName(),node2.getTextContent().replaceAll("\n","").trim());
									array.add(obj);
								}
							}
							json.put(node1.getNodeName(),array);
						}else{
							json.put(node1.getNodeName(),node1.getTextContent().replaceAll("\n","").trim());
						}
					}
				}
				trace.setExecutionConfiguration(json.toString());
			} catch (Exception e1) {
				e1.printStackTrace();
			}
		} finally {
			finished = true;
			SqlSession session=MybatisDaoSuppo.sessionFactory.openSession();
			session.insert("org.sxdata.jingwei.dao.ExecutionTraceDao.addExecutionTrace",trace);
			session.commit();
			session.close();
		}
	}
	public void stop(){
		if(null!=job){
			job.stopAll();
		}
	}
	public int previousNrItems;
	public JSONArray getJobMeasure() throws Exception {
    	JSONArray jsonArray = new JSONArray();
    	if(executionConfiguration.isExecutingLocally()) {
    		JobTracker jobTracker = job.getJobTracker();
        	int nrItems = jobTracker.getTotalNumberOfItems();
        	if ( nrItems != previousNrItems ) {
                // Re-populate this...
                String jobName = jobTracker.getJobName();

    			if (Const.isEmpty(jobName)) {
    				if (!Const.isEmpty(jobTracker.getJobFilename())) {
    					jobName = jobTracker.getJobFilename();
    				} else {
    					jobName = BaseMessages.getString(PKG, "JobLog.Tree.StringToDisplayWhenJobHasNoName");
    				}
    			}
    			
    			JSONObject jsonObject = new JSONObject();
    			jsonObject.put("name", jobName);
    			jsonObject.put("expanded", true);

    			JSONArray children = new JSONArray();
                for ( int i = 0; i < jobTracker.nrJobTrackers(); i++ ) {
                	JSONObject jsonObject2 = addTrackerToTree(jobTracker.getJobTracker(i));
                	if(jsonObject2 != null)
                		children.add(jsonObject2);
                }
                jsonObject.put("children", children);
                jsonArray.add(jsonObject);
                
                previousNrItems = nrItems;
        	}
    	}
    	return jsonArray;
	}
	
	private JSONObject addTrackerToTree( JobTracker jobTracker ) {
		JSONObject jsonObject = new JSONObject();
		if ( jobTracker != null ) {
			if ( jobTracker.nrJobTrackers() > 0 ) {
	    		  // This is a sub-job: display the name at the top of the list...
	    		  jsonObject.put("name", BaseMessages.getString( PKG, "JobLog.Tree.JobPrefix" ) + jobTracker.getJobName() );
	    		  jsonObject.put("expanded", true);
	    		  JSONArray children = new JSONArray();
	    		  // then populate the sub-job entries ...
	    		  for ( int i = 0; i < jobTracker.nrJobTrackers(); i++ ) {
	    			  JSONObject jsonObject2 = addTrackerToTree( jobTracker.getJobTracker( i ) );
	    			  if(jsonObject2 != null)
	    				  children.add(jsonObject2);
	    		  }
	    		  jsonObject.put("children", children);
			} else {
	        	JobEntryResult result = jobTracker.getJobEntryResult();
	        	if ( result != null ) {
	        		String jobEntryName = result.getJobEntryName();
					if (!Const.isEmpty(jobEntryName)) {
						jsonObject.put("name", jobEntryName);
						jsonObject.put("fileName", Const.NVL(result.getJobEntryFilename(), ""));
					} else {
						jsonObject.put("name", BaseMessages.getString(PKG, "JobLog.Tree.JobPrefix2") + jobTracker.getJobName());
					}
					String comment = result.getComment();
					if (comment != null) {
						jsonObject.put("comment", comment);
					}
					Result res = result.getResult();
					if ( res != null ) {
						jsonObject.put("result",  res.getResult() ? BaseMessages.getString( PKG, "JobLog.Tree.Success" ) : BaseMessages.getString(PKG, "JobLog.Tree.Failure" ));
	              		jsonObject.put("number", Long.toString( res.getEntryNr()));
					}
					String reason = result.getReason();
					if (reason != null) {
						jsonObject.put("reason", reason);
					}
					Date logDate = result.getLogDate();
					if (logDate != null) {
						jsonObject.put("logDate", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(logDate));
					}
					jsonObject.put("leaf", true);
	          } else 
	        	  return null;
	        }
	      } else 
	    	  return null;
		return jsonObject;
	}

	public String getExecutionLog() throws Exception {
		if(executionConfiguration.isExecutingLocally()) {
			StringBuffer sb = new StringBuffer();
			KettleLogLayout logLayout = new KettleLogLayout( true );
			List<String> childIds = LoggingRegistry.getInstance().getLogChannelChildren( job.getLogChannelId() );
			List<KettleLoggingEvent> logLines = KettleLogStore.getLogBufferFromTo( childIds, true, -1, KettleLogStore.getLastBufferLineNr() );
			 for ( int i = 0; i < logLines.size(); i++ ) {
	             KettleLoggingEvent event = logLines.get( i );
	             String line = logLayout.format( event ).trim();
	             sb.append(line).append("\n");
			 }
			 return sb.toString();
    	} else {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerJobStatus jobStatus = remoteSlaveServer.getJobStatus(jobMeta.getName(), carteObjectId, 0);
			return jobStatus.getLoggingString();
    	}
		
	}


}
