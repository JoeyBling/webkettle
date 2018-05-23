package org.flhy.ext;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.mxgraph.util.mxUtils;
import net.sf.json.JsonConfig;
import net.sf.json.util.CycleDetectionStrategy;
import org.apache.ibatis.session.SqlSession;
import org.flhy.ext.Task.ExecutionTraceEntity;
import org.flhy.ext.Task.MybatisDaoSuppo;
import org.flhy.ext.trans.steps.SystemInfo;
import org.flhy.ext.utils.ExceptionUtils;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.Result;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.exception.KettleStepException;
import org.pentaho.di.core.logging.KettleLogLayout;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.KettleLoggingEvent;
import org.pentaho.di.core.logging.LogMessage;
import org.pentaho.di.core.logging.LoggingRegistry;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.trans.Trans;
import org.pentaho.di.trans.TransAdapter;
import org.pentaho.di.trans.TransExecutionConfiguration;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.cluster.TransSplitter;
import org.pentaho.di.trans.step.RowAdapter;
import org.pentaho.di.trans.step.StepInterface;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.step.StepMetaDataCombi;
import org.pentaho.di.trans.step.StepStatus;
import org.pentaho.di.www.SlaveServerTransStatus;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class TransExecutor implements Runnable {
	private boolean isClickStop=false;
	private String executionId;
	private TransExecutionConfiguration executionConfiguration;
	private TransMeta transMeta = null;
	private Trans trans = null;
	private Map<StepMeta, String> stepLogMap = new HashMap<StepMeta, String>();
	private TransSplitter transSplitter = null;
	private boolean finished = false;
	private long errCount;
	private static Hashtable<String, TransExecutor> executors = new Hashtable<String, TransExecutor>();
	public static void remove(String executionId) {
		executors.remove(executionId);
	}
	public String getExecutionId() {
		return executionId;
	}
	public long getErrCount() {
		return errCount;
	}
	public static TransExecutor getExecutor(String executionId) {
		return executors.get(executionId);
	}
	public String getCarteObjectId() {
		return carteObjectId;
	}
	public void setCarteObjectId(String carteObjectId) {
		this.carteObjectId = carteObjectId;
	}
	public TransMeta getTransMeta() {
		return transMeta;
	}
	public void setTransMeta(TransMeta transMeta) {
		this.transMeta = transMeta;
	}
	public TransExecutionConfiguration getExecutionConfiguration() {
		return executionConfiguration;
	}
	public void setExecutionConfiguration(TransExecutionConfiguration executionConfiguration) {
		this.executionConfiguration = executionConfiguration;
	}
	public Trans getTrans() {
		return trans;
	}
	public void setTrans(Trans trans) {
		this.trans = trans;
	}

	public boolean isClickStop() {
		return isClickStop;
	}

	public void setIsClickStop(boolean isClickStop) {
		this.isClickStop = isClickStop;
	}

	public static Hashtable<String, TransExecutor> getExecutors(){
		return executors;
	}
	private TransExecutor(TransExecutionConfiguration transExecutionConfiguration, TransMeta transMeta) {
		this.executionId = UUID.randomUUID().toString().replaceAll("-", "");
		this.executionConfiguration = transExecutionConfiguration;
		this.transMeta = transMeta;
	}

	public static synchronized TransExecutor initExecutor(TransExecutionConfiguration transExecutionConfiguration, TransMeta transMeta) {
		TransExecutor transExecutor = new TransExecutor(transExecutionConfiguration, transMeta);
		executors.put(transExecutor.getExecutionId(), transExecutor);
		return transExecutor;
	}

	@Override
	public void run() {
		ExecutionTraceEntity trace=new ExecutionTraceEntity();
		try {
			trace.setStartTime(new Date());
			if (executionConfiguration.isExecutingLocally()) {
				// Set the variables
				transMeta.injectVariables( executionConfiguration.getVariables() );
				// Set the named parameters
				Map<String, String> paramMap = executionConfiguration.getParams();
				Set<String> keys = paramMap.keySet();
				for (String key : keys) {
					transMeta.setParameterValue(key, Const.NVL(paramMap.get(key), ""));
				}
				transMeta.activateParameters();
				// Set the arguments
				Map<String, String> arguments = executionConfiguration.getArguments();
		        String[] argumentNames = arguments.keySet().toArray( new String[arguments.size()] );
		        Arrays.sort( argumentNames );

		        String[] args = new String[argumentNames.length];
		        for ( int i = 0; i < args.length; i++ ) {
		          String argumentName = argumentNames[i];
		          args[i] = arguments.get( argumentName );
		        }
		        boolean initialized = false;
		        trans = new Trans( transMeta );
		        
		        trans.setSafeModeEnabled( executionConfiguration.isSafeModeEnabled() );
		        trans.setGatheringMetrics( executionConfiguration.isGatheringMetrics() );
		        trans.setLogLevel( executionConfiguration.getLogLevel() );
		        trans.setReplayDate( executionConfiguration.getReplayDate() );
		        trans.setRepository( executionConfiguration.getRepository() );
		        try {
		            trans.prepareExecution( args );
					capturePreviewData(trans, transMeta.getSteps());
		            initialized = true;
		        } catch (Exception e ) {
		        	e.printStackTrace();
		            checkErrorVisuals();
					throw new Exception();
		        }
		        if ( trans.isReadyToStart() && initialized) {
					trans.addTransListener(new TransAdapter() {
						public void transFinished(Trans trans) {
							checkErrorVisuals();
						}
					});
					trans.startThreads();
					
					while(!trans.isFinished())
						Thread.sleep(500);
					errCount = trans.getErrors();
		        } else {
		        	checkErrorVisuals();
		        	errCount = trans.getErrors();
		        }
			} else if (executionConfiguration.isExecutingRemotely()) {
				carteObjectId = Trans.sendToSlaveServer( transMeta, executionConfiguration, App.getInstance().getRepository(), App.getInstance().getMetaStore() );
					SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
					boolean running = true;
					while(running) {
						SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
						running = transStatus.isRunning();
					if(!running) errCount = transStatus.getResult().getNrErrors();
					Thread.sleep(500);
				}
			} else if(executionConfiguration.isExecutingClustered()) {
				transSplitter = new TransSplitter( transMeta );
				transSplitter.splitOriginalTransformation();
				
				for (String var : Const.INTERNAL_TRANS_VARIABLES) {
					executionConfiguration.getVariables().put(var, transMeta.getVariable(var));
				}
				for (String var : Const.INTERNAL_JOB_VARIABLES) {
					executionConfiguration.getVariables().put(var, transMeta.getVariable(var));
				}

				// Parameters override the variables.
				// For the time being we're passing the parameters over the wire
				// as variables...
				//
				TransMeta ot = transSplitter.getOriginalTransformation();
				for (String param : ot.listParameters()) {
					String value = Const.NVL(ot.getParameterValue(param), Const.NVL(ot.getParameterDefault(param), ot.getVariable(param)));
					if (!Const.isEmpty(value)) {
						executionConfiguration.getVariables().put(param, value);
					}
				}

				try {
					Trans.executeClustered(transSplitter, executionConfiguration);
				} catch (Exception e) {
					// Something happened posting the transformation to the
					// cluster.
					// We need to make sure to de-allocate ports and so on for
					// the next try...
					// We don't want to suppress original exception here.
					try {
						Trans.cleanupCluster(App.getInstance().getLog(), transSplitter);
					} catch (Exception ee) {
						throw new Exception("Error executing transformation and error to clenaup cluster", e);
					}
					// we still have execution error but cleanup ok here...
					throw e;
				}

//				if (executionConfiguration.isClusterPosting()) {
//					if (masterServer != null) {
//						// spoon.addSpoonSlave( masterServer );
//						for (int i = 0; i < slaves.length; i++) {
//							// spoon.addSpoonSlave( slaves[i] );
//						}
//					}
//				}
				
				Trans.monitorClusteredTransformation(App.getInstance().getLog(), transSplitter, null);
				
				
				Result result = Trans.getClusteredTransformationResult(App.getInstance().getLog(), transSplitter, null);
				errCount = result.getNrErrors();
			}
			trace.setEndTime(new Date());
			trace.setJobName(transMeta.getName());
			//结果
			String status="成功";
			if(errCount>0){
				status="失败";
			}
			trace.setStatus(status);
			//任务类型
			trace.setType("trans");
			//LOG
			net.sf.json.JSONObject transLog=new net.sf.json.JSONObject();
			transLog.put("stepMeasure",this.getStepMeasure());
			transLog.put("finished",true);
			transLog.put("log", this.getExecutionLog());
			trace.setExecutionLog(transLog.toString());
			//执行方式
			String execMethod="";
			if(executionConfiguration.isExecutingLocally()){
				execMethod="本地";
			}else{
				execMethod="远程:"+executionConfiguration.getRemoteServer().getHostname();
			}
			trace.setExecMethod(execMethod);
			//executionConfigration  获取执行时的配置信息
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
			try{
				trace.setEndTime(new Date());
				trace.setJobName(transMeta.getName());
				trace.setStatus("程序错误");
				trace.setExecutionLog(ExceptionUtils.toString(e));
				trace.setType("trans");
				//执行方式
				String execMethod="";
				if(executionConfiguration.isExecutingLocally()){
					execMethod="本地";
				}else{
					execMethod="远程:"+executionConfiguration.getRemoteServer().getHostname();
				}
				trace.setExecMethod(execMethod);
				//executionConfigration  获取执行时的配置信息
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
				e.printStackTrace();
				App.getInstance().getLog().logError("执行失败！", e);
			}catch (Exception e1){
				e1.printStackTrace();
			}
		} finally {
			finished = true;
			SqlSession session= MybatisDaoSuppo.sessionFactory.openSession();
			trace.setEndTime(new Date());
			session.insert("org.sxdata.jingwei.dao.ExecutionTraceDao.addExecutionTrace",trace);
			session.commit();
			session.close();
		}
	}
	
	public void capturePreviewData(Trans trans, List<StepMeta> stepMetas) {
		final StringBuffer loggingText = new StringBuffer();

		try {
			final TransMeta transMeta = trans.getTransMeta();

			for (final StepMeta stepMeta : stepMetas) {
				final RowMetaInterface rowMeta = transMeta.getStepFields( stepMeta ).clone();
				previewMetaMap.put(stepMeta, rowMeta);
				final List<Object[]> rowsData = new LinkedList<Object[]>();

				previewDataMap.put(stepMeta, rowsData);
				previewLogMap.put(stepMeta, loggingText);

				StepInterface step = trans.findRunThread(stepMeta.getName());

				if (step != null) {

					step.addRowListener(new RowAdapter() {
						@Override
						public void rowWrittenEvent(RowMetaInterface rowMeta, Object[] row) throws KettleStepException {
							try {
								rowsData.add(rowMeta.cloneRow(row));
								if (rowsData.size() > 100) {
									rowsData.remove(0);
								}
							} catch (Exception e) {
								throw new KettleStepException("Unable to clone row for metadata : " + rowMeta, e);
							}
						}
					});
				}

			}
		} catch (Exception e) {
			loggingText.append(Const.getStackTracker(e));
		}

		trans.addTransListener(new TransAdapter() {
			@Override
			public void transFinished(Trans trans) throws KettleException {
				if (trans.getErrors() != 0) {
					for (StepMetaDataCombi combi : trans.getSteps()) {
						if (combi.copy == 0) {
							StringBuffer logBuffer = KettleLogStore.getAppender().getBuffer(combi.step.getLogChannel().getLogChannelId(), false);
							previewLogMap.put(combi.stepMeta, logBuffer);
						}
					}
				}
			}
		});
	}
	
	protected Map<StepMeta, RowMetaInterface> previewMetaMap = new HashMap<StepMeta, RowMetaInterface>();
	protected Map<StepMeta, List<Object[]>> previewDataMap = new HashMap<StepMeta, List<Object[]>>();
	protected Map<StepMeta, StringBuffer> previewLogMap = new HashMap<StepMeta, StringBuffer>();
	
	private void checkErrorVisuals() {
		if (trans.getErrors() > 0) {
			stepLogMap.clear();
			
			for (StepMetaDataCombi combi : trans.getSteps()) {
				if (combi.step.getErrors() > 0) {
					String channelId = combi.step.getLogChannel().getLogChannelId();
					List<KettleLoggingEvent> eventList = KettleLogStore.getLogBufferFromTo(channelId, false, 0, KettleLogStore.getLastBufferLineNr());
					StringBuilder logText = new StringBuilder();
					for (KettleLoggingEvent event : eventList) {
						Object message = event.getMessage();
						if (message instanceof LogMessage) {
							LogMessage logMessage = (LogMessage) message;
							if (logMessage.isError()) {
								logText.append(logMessage.getMessage()).append(Const.CR);
							}
						}
					}
					stepLogMap.put(combi.stepMeta, logText.toString());
				}
			}

		} else {
			stepLogMap.clear();
		}
	}
	
	private String carteObjectId = null;

	public boolean isFinished() {
		return finished;
	}

	public List<StepStatus> getTransStepStatus() throws Exception{
		List<StepStatus> items=new ArrayList<StepStatus>();
		if(executionConfiguration.isExecutingLocally()) {
			for (int i = 0; i < trans.nrSteps(); i++) {
				StepInterface baseStep = trans.getRunThread(i);
				StepStatus stepStatus = new StepStatus(baseStep);
				items.add(stepStatus);
			}
		} else if(executionConfiguration.isExecutingRemotely()) {
			SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			items = transStatus.getStepStatusList();
		} else if(executionConfiguration.isExecutingClustered()) {
			SlaveServer masterServer = transSplitter.getMasterServer();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			items = transStatus.getStepStatusList();
		}
		return items;
	}
	
	public JSONArray getStepMeasure() throws Exception {
    	JSONArray jsonArray = new JSONArray();
    	
    	if(executionConfiguration.isExecutingLocally()) {
    		for (int i = 0; i < trans.nrSteps(); i++) {
    			StepInterface baseStep = trans.getRunThread(i);
    			StepStatus stepStatus = new StepStatus(baseStep);

    			String[] fields = stepStatus.getTransLogFields();

    			JSONArray childArray = new JSONArray();
    			for (int f = 1; f < fields.length; f++) {
    				childArray.add(fields[f]);
    			}
    			jsonArray.add(childArray);
    		}
    	} else if(executionConfiguration.isExecutingRemotely()) {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
        	for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				String[] fields = stepStatus.getTransLogFields();
	
				JSONArray childArray = new JSONArray();
				for (int f = 1; f < fields.length; f++) {
					childArray.add(fields[f]);
				}
				jsonArray.add(childArray);
			}
    	} else if(executionConfiguration.isExecutingClustered()) {
    		SlaveServer masterServer = transSplitter.getMasterServer();
			SlaveServer[] slaves = transSplitter.getSlaveTargets();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
			for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				String[] fields = stepStatus.getTransLogFields();
	
				JSONArray childArray = new JSONArray();
				for (int f = 1; f < fields.length; f++) {
					childArray.add(fields[f]);
				}
				jsonArray.add(childArray);
			}
			
			for (SlaveServer slaveServer : slaves) {
				transStatus = slaveServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getSlaveTransMap().get(slaveServer)), 0);
				stepStatusList = transStatus.getStepStatusList();
				for (int i = 0; i < stepStatusList.size(); i++) {
					StepStatus stepStatus = stepStatusList.get(i);
					String[] fields = stepStatus.getTransLogFields();

					JSONArray childArray = new JSONArray();
					for (int f = 1; f < fields.length; f++) {
						childArray.add(fields[f]);
					}
					jsonArray.add(childArray);
				}
			}
    	}
    	
    	return jsonArray;
	}
	
	public String getExecutionLog() throws Exception {
		
		if(executionConfiguration.isExecutingLocally()) {
			StringBuffer sb = new StringBuffer();
			KettleLogLayout logLayout = new KettleLogLayout( true );
			List<String> childIds = LoggingRegistry.getInstance().getLogChannelChildren( trans.getLogChannelId() );
			List<KettleLoggingEvent> logLines = KettleLogStore.getLogBufferFromTo( childIds, true, -1, KettleLogStore.getLastBufferLineNr() );
			 for ( int i = 0; i < logLines.size(); i++ ) {
	             KettleLoggingEvent event = logLines.get( i );
	             String line = logLayout.format( event ).trim();
	             sb.append(line).append("\n");
			 }
			 return sb.toString();
    	} else if(executionConfiguration.isExecutingRemotely()) {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			return transStatus.getLoggingString();
    	} else if(executionConfiguration.isExecutingClustered()) {
    		SlaveServer masterServer = transSplitter.getMasterServer();
			SlaveServer[] slaves = transSplitter.getSlaveTargets();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			String log = transStatus.getLoggingString();
			for(SlaveServer slaveServer : slaves) {
				 transStatus = slaveServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getSlaveTransMap().get(slaveServer)), 0);
				 if(StringUtils.hasText(transStatus.getLoggingString())) {
					 log += transStatus.getLoggingString();
				 }
			}
			
			return log;
    	}
		
		return "";
	}
	
	public JSONArray getStepStatus() throws Exception {
		JSONArray jsonArray = new JSONArray();
		
		HashMap<String, Integer> stepIndex = new HashMap<String,Integer>();
		if(executionConfiguration.isExecutingLocally()) {
			for (StepMetaDataCombi combi : trans.getSteps()) {
				Integer index = stepIndex.get(combi.stepMeta.getName());
				if(index == null) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("stepName", combi.stepMeta.getName());
					int errCount = (int) combi.step.getErrors();
					jsonObject.put("stepStatus", errCount);
					
					if(errCount > 0) {
						StringBuilder logText = new StringBuilder();
						String channelId = combi.step.getLogChannel().getLogChannelId();
						List<KettleLoggingEvent> eventList = KettleLogStore.getLogBufferFromTo(channelId, false, -1, KettleLogStore.getLastBufferLineNr());
						for (KettleLoggingEvent event : eventList) {
							Object message = event.getMessage();
							if (message instanceof LogMessage) {
								LogMessage logMessage = (LogMessage) message;
								if (logMessage.isError()) {
									logText.append(logMessage.getMessage()).append(Const.CR);
								}
							}
						}
						jsonObject.put("logText", logText.toString());
					}
					
					stepIndex.put(combi.stepMeta.getName(), jsonArray.size());
					jsonArray.add(jsonObject);
				} else {
					JSONObject jsonObject = jsonArray.getJSONObject(index);
					int errCount = (int) (combi.step.getErrors() + jsonObject.optInt("stepStatus"));
					jsonObject.put("stepStatus", errCount);
				}
			}
    	} else if(executionConfiguration.isExecutingRemotely()) {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
        	for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				Integer index = stepIndex.get(stepStatus.getStepname());
				if(index == null) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("stepName", stepStatus.getStepname());
					jsonObject.put("stepStatus", stepStatus.getErrors());
					
					stepIndex.put(stepStatus.getStepname(), jsonArray.size());
					jsonArray.add(jsonObject);
				} else {
					JSONObject jsonObject = jsonArray.getJSONObject(index);
					int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
					jsonObject.put("stepStatus", errCount);
				}
	
			}
    	} else if(executionConfiguration.isExecutingClustered()) {
    		SlaveServer masterServer = transSplitter.getMasterServer();
			SlaveServer[] slaves = transSplitter.getSlaveTargets();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
			for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				Integer index = stepIndex.get(stepStatus.getStepname());
				if(index == null) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("stepName", stepStatus.getStepname());
					jsonObject.put("stepStatus", stepStatus.getErrors());
					
					stepIndex.put(stepStatus.getStepname(), jsonArray.size());
					jsonArray.add(jsonObject);
				} else {
					JSONObject jsonObject = jsonArray.getJSONObject(index);
					int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
					jsonObject.put("stepStatus", errCount);
				}
			}
			
			for (SlaveServer slaveServer : slaves) {
				transStatus = slaveServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getSlaveTransMap().get(slaveServer)), 0);
				stepStatusList = transStatus.getStepStatusList();
				for (int i = 0; i < stepStatusList.size(); i++) {
					StepStatus stepStatus = stepStatusList.get(i);
					Integer index = stepIndex.get(stepStatus.getStepname());
					if(index == null) {
						JSONObject jsonObject = new JSONObject();
						jsonObject.put("stepName", stepStatus.getStepname());
						jsonObject.put("stepStatus", stepStatus.getErrors());
						
						stepIndex.put(stepStatus.getStepname(), jsonArray.size());
						jsonArray.add(jsonObject);
					} else {
						JSONObject jsonObject = jsonArray.getJSONObject(index);
						int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
						jsonObject.put("stepStatus", errCount);
					}
				}
			}
    	}
		
		return jsonArray;
	}
	
	public void stop() {
		if(trans!=null){
			trans.stopAll();
		}
	}
	
	public void pause() {
		if(!trans.isPaused())
			trans.pauseRunning();
		else
			trans.resumeRunning();
	}
	
	public JSONObject getPreviewData() {
		JSONObject jsonObject = new JSONObject();
		for (StepMetaDataCombi combi : trans.getSteps()) {
			RowMetaInterface rowMeta = previewMetaMap.get(combi.stepMeta);
			
			if (rowMeta != null) {
				JSONObject stepJson = new JSONObject();
				List<ValueMetaInterface> valueMetas = rowMeta.getValueMetaList();
				
				JSONArray columns = new JSONArray();
				JSONObject metaData = new JSONObject();
				JSONArray fields = new JSONArray();
				for (int i = 0; i < valueMetas.size(); i++) {
					ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
					fields.add(valueMeta.getName());
					
					JSONObject column = new JSONObject();
					column.put("dataIndex", valueMeta.getName());
					column.put("width", 100);
					column.put("header", valueMeta.getComments() == null ? valueMeta.getName() : valueMeta.getComments());
					column.put("width", valueMeta.getLength() > 0 ? valueMeta.getLength() : 150);
					columns.add(column);
				}
				metaData.put("fields", fields);
				metaData.put("root", "firstRecords");
				stepJson.put("metaData", metaData);
				stepJson.put("columns", columns);
				
				List<Object[]> rowsData = previewDataMap.get(combi.stepMeta);
				JSONArray firstRecords = new JSONArray();
				JSONArray lastRecords = new JSONArray();
				for (int rowNr = 0; rowNr < rowsData.size(); rowNr++) {
					Object[] rowData = rowsData.get(rowNr);
					JSONObject row = new JSONObject();
					for (int colNr = 0; colNr < rowMeta.size(); colNr++) {
						String string;
						ValueMetaInterface valueMetaInterface;
						try {
							valueMetaInterface = rowMeta.getValueMeta(colNr);
							if (valueMetaInterface.isStorageBinaryString()) {
								Object nativeType = valueMetaInterface.convertBinaryStringToNativeType((byte[]) rowData[colNr]);
								string = valueMetaInterface.getStorageMetadata().getString(nativeType);
							} else {
								string = rowMeta.getString(rowData, colNr);
							}
						} catch (Exception e) {
							string = "Conversion error: " + e.getMessage();
						}
						
						ValueMetaInterface valueMeta = rowMeta.getValueMeta( colNr );
						row.put(valueMeta.getName(), string);
						
					}
					if(firstRecords.size() <= 50) {
						firstRecords.add(row);
					}
					lastRecords.add(row);
					if(lastRecords.size() > 50)
						lastRecords.remove(0);
				}
				stepJson.put("firstRecords", firstRecords);
				jsonObject.put(combi.stepname, stepJson);
			}
		}
		
		return jsonObject;
	}
}
