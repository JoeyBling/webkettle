package org.flhy.ext.trans;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;

import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.base.BaseGraphCodec;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.cluster.SlaveServerCodec;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.StepDecoder;
import org.flhy.ext.trans.step.StepEncoder;
import org.flhy.ext.trans.step.StepErrorMetaCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.base.AbstractMeta;
import org.pentaho.di.cluster.ClusterSchema;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.gui.Point;
import org.pentaho.di.core.logging.LogTableField;
import org.pentaho.di.core.logging.MetricsLogTable;
import org.pentaho.di.core.logging.PerformanceLogTable;
import org.pentaho.di.core.logging.StepLogTable;
import org.pentaho.di.core.logging.TransLogTable;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.core.variables.Variables;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.laf.BasePropertyHandler;
import org.pentaho.di.partition.PartitionSchema;
import org.pentaho.di.repository.HasRepositoryInterface;
import org.pentaho.di.trans.TransHopMeta;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepErrorMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.StepPartitioningMeta;
import org.pentaho.di.trans.steps.missing.MissingTrans;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.io.mxCodec;
import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

@Component(GraphCodec.TRANS_CODEC)
@Scope("prototype")
public class TransMetaCodec extends BaseGraphCodec {

	@Override
	public String encode(AbstractMeta meta) throws Exception {
		TransMeta transMeta = (TransMeta) meta;
		
		mxGraph graph = new mxGraph();
		graph.getModel().beginUpdate();
		mxCell parent = (mxCell) graph.getDefaultParent();
		Document doc = mxUtils.createDocument();
		
		try {
			Element e = super.encodeCommRootAttr(transMeta, doc);
			e.setAttribute("trans_version", transMeta.getTransversion());
			e.setAttribute("trans_type", transMeta.getTransformationType().getCode() );
			e.setAttribute("trans_status", String.valueOf(transMeta.getTransstatus()));
			
		    //variables
		    Properties sp = new Properties();
		    JSONArray jsonArray = new JSONArray();

		    String[] keys = Variables.getADefaultVariableSpace().listVariables();
		    for ( int i = 0; i < keys.length; i++ ) {
		    	sp.put( keys[i], Variables.getADefaultVariableSpace().getVariable( keys[i] ) );
		    }

		    List<String> vars = transMeta.getUsedVariables();
	    	for ( int i = 0; i < vars.size(); i++ ) {
	    		String varname = vars.get( i );
	    		if ( !varname.startsWith( Const.INTERNAL_VARIABLE_PREFIX ) && Const.indexOfString( varname, transMeta.listParameters() ) < 0 ) {
	    			JSONObject param = new JSONObject();
	    			param.put("var_name", varname);
	    			param.put("var_value", sp.getProperty(varname, ""));
	    			jsonArray.add(param);
	    		}
	    	}

		    for ( String varname : Const.INTERNAL_JOB_VARIABLES ) {
		    	String value = transMeta.getVariable( varname );
		    	if ( !Const.isEmpty( value ) ) {
		    		
		    		JSONObject param = new JSONObject();
	    			param.put("var_name", varname);
	    			param.put("var_value", value);
	    			jsonArray.add(param);
		    	}
		    }
		    e.setAttribute("variables", jsonArray.toString());
			
		    TransLogTable transLogTable = transMeta.getTransLogTable();
		    JSONObject jsonObject = new JSONObject();
		    jsonObject.put( "connection", transLogTable.getConnectionName() );
		    jsonObject.put( "schema", transLogTable.getSchemaName() );
		    jsonObject.put( "table", transLogTable.getTableName() );
		    jsonObject.put( "size_limit_lines", transLogTable.getLogSizeLimit() );
		    jsonObject.put( "interval", transLogTable.getLogInterval() );
		    jsonObject.put( "timeout_days", transLogTable.getTimeoutInDays() );
		    JSONArray fields = new JSONArray();
		    for ( LogTableField field : transLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("subjectAllowed", field.isSubjectAllowed());
				if (field.isSubjectAllowed()) {
					jsonField.put("subject", field.getSubject() == null ? "" : field.getSubject().toString());
				} else {
					jsonField.put("subject", "-");
				}
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("transLogTable", jsonObject.toString());
		    
		    StepLogTable stepLogTable = transMeta.getStepLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", stepLogTable.getConnectionName() );
		    jsonObject.put( "schema", stepLogTable.getSchemaName() );
		    jsonObject.put( "table", stepLogTable.getTableName() );
		    jsonObject.put( "timeout_days", stepLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : stepLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("stepLogTable", jsonObject.toString());
		    
		    PerformanceLogTable performanceLogTable = transMeta.getPerformanceLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", performanceLogTable.getConnectionName() );
		    jsonObject.put( "schema", performanceLogTable.getSchemaName() );
		    jsonObject.put( "table", performanceLogTable.getTableName() );
		    jsonObject.put( "interval", performanceLogTable.getLogInterval() );
		    jsonObject.put( "timeout_days", performanceLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : performanceLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("performanceLogTable", jsonObject.toString());
		    
		    MetricsLogTable metricsLogTable = transMeta.getMetricsLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", metricsLogTable.getConnectionName() );
		    jsonObject.put( "schema", metricsLogTable.getSchemaName() );
		    jsonObject.put( "table", metricsLogTable.getTableName() );
		    jsonObject.put( "timeout_days", metricsLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : metricsLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("metricsLogTable", jsonObject.toString());
		    
		    jsonObject = new JSONObject();
		    jsonObject.put("connection", transMeta.getMaxDateConnection() == null ? "" : transMeta.getMaxDateConnection().getName());
		    jsonObject.put("table", transMeta.getMaxDateTable());
		    jsonObject.put("field", transMeta.getMaxDateField());
		    jsonObject.put("offset", transMeta.getMaxDateOffset());
		    jsonObject.put("maxdiff", transMeta.getMaxDateDifference());
		    e.setAttribute("maxdate", jsonObject.toString());
			
		    e.setAttribute("size_rowset", String.valueOf(transMeta.getSizeRowset()));
		    e.setAttribute("sleep_time_empty", String.valueOf(transMeta.getSleepTimeEmpty()));
		    e.setAttribute("sleep_time_full", String.valueOf(transMeta.getSleepTimeFull()));
		    e.setAttribute("unique_connections", transMeta.isUsingUniqueConnections() ? "Y" : "N");
		    e.setAttribute("feedback_shown", transMeta.isFeedbackShown() ? "Y" : "N");
		    e.setAttribute("feedback_size", String.valueOf(transMeta.getFeedbackSize()));
		    e.setAttribute("using_thread_priorities", transMeta.isUsingThreadPriorityManagment() ? "Y" : "N");
		    e.setAttribute("capture_step_performance", transMeta.isCapturingStepPerformanceSnapShots() ? "Y" : "N");
		    e.setAttribute("step_performance_capturing_delay", String.valueOf(transMeta.getStepPerformanceCapturingDelay()));
		    e.setAttribute("step_performance_capturing_size_limit", transMeta.getStepPerformanceCapturingSizeLimit());
		    
		    super.encodeSlaveServers(e, transMeta);
		    encodeClusterSchema(e, transMeta);
		    encodePartitionSchema(e, transMeta);
		    
		    try {
		    	if(transMeta.getKey() != null) {
		    		e.setAttribute("key_for_session_key", XMLHandler.encodeBinaryData(transMeta.getKey()));
		    	} else {
		    		e.setAttribute("key_for_session_key", "");
		    	}
			} catch (Exception e1) {
				e1.printStackTrace();
				e.setAttribute("key_for_session_key", "");
			}
			e.setAttribute("is_key_private", transMeta.isPrivateKey() ? "Y" : "N");
	
			super.encodeNote(doc, graph, transMeta);
			
			super.encodeDatabases(e, transMeta);
		    parent.setValue(e);
		    
		    // encode steps and hops
			HashMap<StepMeta, Object> cells = new HashMap<StepMeta, Object>();
			List<StepMeta> list = transMeta.getSteps();
			for(int i=0; i<list.size(); i++) {
				StepMeta stepMeta = (StepMeta) list.get(i);
				if (stepMeta.getStepMetaInterface() instanceof HasRepositoryInterface) {
					((HasRepositoryInterface) stepMeta.getStepMetaInterface()).setRepository(App.getInstance().getRepository());
				}
				Point p = stepMeta.getLocation();
				StepEncoder stepEncoder = (StepEncoder) PluginFactory.getBean(stepMeta.getStepID());
				
				PluginInterface plugin = PluginRegistry.getInstance().getPlugin(StepPluginType.class, stepMeta.getStepID());
				Object cell = graph.insertVertex(parent, null, stepEncoder.encodeStep(stepMeta), p.x, p.y, PropsUI.STEP_SIZE, PropsUI.STEP_SIZE, "icon;image=" + SvgImageUrl.getUrl(plugin));
				cells.put(stepMeta, cell);
			}
			
			for(int i=0; i<transMeta.nrTransHops(); i++) {
				TransHopMeta transHopMeta = transMeta.getTransHop(i);
				
				Object v1 = cells.get(transHopMeta.getFromStep());
				Object v2 = cells.get(transHopMeta.getToStep());
				
				String style = null;
				StepErrorMeta stepErrorMeta = transHopMeta.getFromStep().getStepErrorMeta();
				if(stepErrorMeta != null && transHopMeta.getToStep().equals(stepErrorMeta.getTargetStep())) {
					style = "error";
				}
				
				graph.insertEdge(parent, null, TransHopMetaCodec.encode(transHopMeta), v1, v2, style);
			}
			
		} finally {
			graph.getModel().endUpdate();
		}
		
		mxCodec codec = new mxCodec();
		return mxUtils.getPrettyXml(codec.encode(graph.getModel()));
	}

	@Override
	public AbstractMeta decode(String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		mxCell root = (mxCell) graph.getDefaultParent();
		
		TransMeta transMeta = new TransMeta();
		decodeCommRootAttr(root, transMeta);
		transMeta.setTransstatus(Const.toInt(root.getAttribute("trans_status"), -1));
		transMeta.setTransversion(root.getAttribute("trans_version"));


		if(transMeta.getRepository() != null)
			transMeta.setSharedObjects(transMeta.getRepository().readTransSharedObjects( transMeta ));
		else
			transMeta.setSharedObjects(transMeta.readSharedObjects());


		transMeta.importFromMetaStore();


		decodeDatabases(root, transMeta);
		decodeNote(graph, transMeta);
		
		int count = graph.getModel().getChildCount(root);
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if(cell.isVertex()) {
				Element e = (Element) cell.getValue();
				if(PropsUI.TRANS_STEP_NAME.equals(e.getTagName())) {
					StepDecoder stepDecoder = (StepDecoder) PluginFactory.getBean(cell.getAttribute("ctype"));
					StepMeta stepMeta = stepDecoder.decodeStep(cell, transMeta.getDatabases(), transMeta.getMetaStore());
					
					stepMeta.setParentTransMeta( transMeta );
					if (stepMeta.isMissing()) {
						transMeta.addMissingTrans((MissingTrans) stepMeta.getStepMetaInterface());
					}
					
					StepMeta check = transMeta.findStep(stepMeta.getName());
					if (check != null) {
						if (!check.isShared()) {
							// Don't overwrite shared objects
							transMeta.addOrReplaceStep(stepMeta);
						} else {
							check.setDraw(stepMeta.isDrawn()); // Just keep the  drawn flag  and location
							check.setLocation(stepMeta.getLocation());
						}
					} else {
						transMeta.addStep(stepMeta); // simply add it.
					}
				}
			}
		}
		
		// Have all StreamValueLookups, etc. reference the correct source steps...
        //
		for (int i = 0; i < transMeta.nrSteps(); i++) {
			StepMeta stepMeta = transMeta.getStep(i);
			StepMetaInterface sii = stepMeta.getStepMetaInterface();
			if (sii != null) {
				sii.searchInfoAndTargetSteps(transMeta.getSteps());
			}
		}
		
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if(cell.isVertex()) {
				Element e = (Element) cell.getValue();
				if(PropsUI.TRANS_STEP_NAME.equals(e.getTagName())) {
					if(e.getAttribute("error") != null) {
						StepMeta stepMeta = transMeta.findStep(e.getAttribute("label"));
						stepMeta.setStepErrorMeta(StepErrorMetaCodec.decode(transMeta, JSONObject.fromObject(e.getAttribute("error"))));
					}
				}
			}
		}
		
		count = graph.getModel().getChildCount(root);
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if (cell.isEdge()) {
				mxCell source = (mxCell) cell.getSource();
				mxCell target = (mxCell) cell.getTarget();

				TransHopMeta hopinf = new TransHopMeta(null, null, true);
				String[] stepNames = transMeta.getStepNames();
				for (int j = 0; j < stepNames.length; j++) {
					if (stepNames[j].equalsIgnoreCase(source.getAttribute("label")))
						hopinf.setFromStep(transMeta.getStep(j));
					if (stepNames[j].equalsIgnoreCase(target.getAttribute("label")))
						hopinf.setToStep(transMeta.getStep(j));
				}
				transMeta.addTransHop(hopinf);
			}
		}
		
		JSONObject jsonObject = JSONObject.fromObject(root.getAttribute("transLogTable"));
		TransLogTable transLogTable = transMeta.getTransLogTable();
		transLogTable.setConnectionName(jsonObject.optString("connection"));
		transLogTable.setSchemaName(jsonObject.optString("schema"));
		transLogTable.setTableName(jsonObject.optString("table"));
		transLogTable.setLogSizeLimit(jsonObject.optString("size_limit_lines"));
		transLogTable.setLogInterval(jsonObject.optString("interval"));
		transLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		JSONArray jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = transLogTable.findField( id );
		    	if ( field == null ) {
		    		field = transLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
					field.setSubject(StepMeta.findStep(transMeta.getSteps(), fieldJson.optString("subject")));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("stepLogTable"));
		StepLogTable stepLogTable = transMeta.getStepLogTable();
		stepLogTable.setConnectionName(jsonObject.optString("connection"));
		stepLogTable.setSchemaName(jsonObject.optString("schema"));
		stepLogTable.setTableName(jsonObject.optString("table"));
		stepLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = stepLogTable.findField( id );
		    	if ( field == null && i<stepLogTable.getFields().size()) {
		    		field = stepLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("performanceLogTable"));
		PerformanceLogTable performanceLogTable = transMeta.getPerformanceLogTable();
		performanceLogTable.setConnectionName(jsonObject.optString("connection"));
		performanceLogTable.setSchemaName(jsonObject.optString("schema"));
		performanceLogTable.setTableName(jsonObject.optString("table"));
		performanceLogTable.setLogInterval(jsonObject.optString("interval"));
		performanceLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = performanceLogTable.findField( id );
		    	if ( field == null && i<performanceLogTable.getFields().size()) {
		    		field = performanceLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("metricsLogTable"));
	    MetricsLogTable metricsLogTable = transMeta.getMetricsLogTable();
	    metricsLogTable.setConnectionName(jsonObject.optString("connection"));
	    metricsLogTable.setSchemaName(jsonObject.optString("schema"));
	    metricsLogTable.setTableName(jsonObject.optString("table"));
	    metricsLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = metricsLogTable.findField( id );
		    	if ( field == null && i<metricsLogTable.getFields().size()) {
		    		field = metricsLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
		jsonArray = JSONArray.fromObject(root.getAttribute("partitionSchemas"));
		for (int i = 0; i < jsonArray.size(); i++) {
			jsonObject = jsonArray.getJSONObject(i);
			PartitionSchema partitionSchema = decodePartitionSchema(jsonObject);
			PartitionSchema check = transMeta.findPartitionSchema(partitionSchema.getName());
			if (check != null) {
				if (!check.isShared()) {
					transMeta.addOrReplacePartitionSchema(partitionSchema);
				}
			} else {
				transMeta.getPartitionSchemas().add(partitionSchema);
			}
		}
		
		for (int i = 0; i < transMeta.nrSteps(); i++) {
			StepPartitioningMeta stepPartitioningMeta = transMeta.getStep(i).getStepPartitioningMeta();
			if (stepPartitioningMeta != null) {
				stepPartitioningMeta.setPartitionSchemaAfterLoading(transMeta.getPartitionSchemas());
			}
			StepPartitioningMeta targetStepPartitioningMeta = transMeta.getStep(i).getTargetStepPartitioningMeta();
			if (targetStepPartitioningMeta != null) {
				targetStepPartitioningMeta.setPartitionSchemaAfterLoading(transMeta.getPartitionSchemas());
			}
		}
	    
		decodeSlaveServers(root, transMeta);
		
		jsonArray = JSONArray.fromObject(root.getAttribute("clusterSchemas"));
		for (int i = 0; i < jsonArray.size(); i++) {
			jsonObject = jsonArray.getJSONObject(i);
			ClusterSchema clusterSchema = decodeClusterSchema(jsonObject, transMeta.getSlaveServers());
			clusterSchema.shareVariablesWith(transMeta);

			ClusterSchema check = transMeta.findClusterSchema(clusterSchema.getName());
			if (check != null) {
				if (!check.isShared()) {
					transMeta.addOrReplaceClusterSchema(clusterSchema);
				}
			} else {
				transMeta.getClusterSchemas().add(clusterSchema);
			}
		}
	    
		for (int i = 0; i < transMeta.nrSteps(); i++) {
			transMeta.getStep(i).setClusterSchemaAfterLoading(transMeta.getClusterSchemas());
		}
	    
		transMeta.setSizeRowset(Const.toInt( root.getAttribute( "size_rowset" ), Const.ROWS_IN_ROWSET ));
		transMeta.setSleepTimeEmpty( Const.toInt( root.getAttribute( "sleep_time_empty" ), Const.TIMEOUT_GET_MILLIS ));
		transMeta.setSleepTimeFull( Const.toInt( root.getAttribute( "sleep_time_full" ), Const.TIMEOUT_PUT_MILLIS ));
        transMeta.setUsingUniqueConnections("Y".equalsIgnoreCase( root.getAttribute( "unique_connections" ) ));

        transMeta.setFeedbackShown(!"N".equalsIgnoreCase( root.getAttribute( "feedback_shown" ) ));
        transMeta.setFeedbackSize(Const.toInt( root.getAttribute( "feedback_size" ), Const.ROWS_UPDATE ));
        transMeta.setUsingThreadPriorityManagment(!"N".equalsIgnoreCase( root.getAttribute( "using_thread_priorities" ) ));
        
        transMeta.setCapturingStepPerformanceSnapShots("Y".equalsIgnoreCase( root.getAttribute( "capture_step_performance" ) ));
        transMeta.setStepPerformanceCapturingDelay(Const.toLong( root.getAttribute( "step_performance_capturing_delay" ), 1000 ));
        transMeta.setStepPerformanceCapturingSizeLimit(root.getAttribute( "step_performance_capturing_size_limit" ));

	    transMeta.setKey(XMLHandler.stringToBinary( root.getAttribute( "key_for_session_key" ) ));
	    transMeta.setPrivateKey("Y".equals( root.getAttribute( "is_key_private" ) ));
	    
	    return transMeta;
	}
	
	public ClusterSchema decodeClusterSchema(JSONObject jsonObject, List<SlaveServer> referenceSlaveServers) {
		ClusterSchema clusterSchema = new ClusterSchema();
		clusterSchema.setName(jsonObject.optString( "name" ));
		clusterSchema.setBasePort(jsonObject.optString( "base_port" ));
		clusterSchema.setSocketsBufferSize(jsonObject.optString( "sockets_buffer_size" ));
		clusterSchema.setSocketsFlushInterval(jsonObject.optString( "sockets_flush_interval" ));
		clusterSchema.setSocketsCompressed("Y".equalsIgnoreCase( jsonObject.optString( "sockets_compressed" ) ));
		clusterSchema.setDynamic("Y".equalsIgnoreCase( jsonObject.optString( "dynamic" ) ));
		
		ArrayList<SlaveServer> slaveServers = new ArrayList<SlaveServer>();
		JSONArray slavesNode = jsonObject.optJSONArray("slaveservers");
		if(slavesNode != null) {
			for (int i = 0; i < slavesNode.size(); i++) {
				JSONObject slaveServerJson = slavesNode.getJSONObject(i);
				SlaveServer slaveServer = SlaveServer.findSlaveServer(referenceSlaveServers, slaveServerJson.optString("name"));
				if (slaveServer != null) {
					slaveServers.add(slaveServer);
				}
			}
			clusterSchema.setSlaveServers(slaveServers);
		}
		
		return clusterSchema;
	}
	
	public void encodeClusterSchema(Element e, TransMeta transMeta) {
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < transMeta.getClusterSchemas().size(); i++) {
			ClusterSchema clusterSchema = transMeta.getClusterSchemas().get(i);

			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", clusterSchema.getName());
			jsonObject.put("base_port", clusterSchema.getBasePort());
			jsonObject.put("sockets_buffer_size", clusterSchema.getSocketsBufferSize());

			jsonObject.put("sockets_flush_interval", clusterSchema.getSocketsFlushInterval());
			jsonObject.put("sockets_compressed", clusterSchema.isSocketsCompressed() ? "Y" : "N");
			jsonObject.put("dynamic", clusterSchema.isDynamic() ? "Y" : "N");

			JSONArray slaveservers = new JSONArray();
			for (int j = 0; j < clusterSchema.getSlaveServers().size(); j++) {
				SlaveServer slaveServer = clusterSchema.getSlaveServers().get(j);
				slaveservers.add(SlaveServerCodec.encode(slaveServer));
			}
			jsonObject.put("slaveservers", slaveservers);

			jsonArray.add(jsonObject);
		}
		e.setAttribute("clusterSchemas", jsonArray.toString());
	}
	
	public PartitionSchema decodePartitionSchema(JSONObject jsonObject) {
		PartitionSchema partitionSchema = new PartitionSchema();
		partitionSchema.setName(jsonObject.optString("name"));
		partitionSchema.setDynamicallyDefined("Y".equalsIgnoreCase(jsonObject.optString("dynamic")));
		partitionSchema.setNumberOfPartitionsPerSlave(jsonObject.optString("partitions_per_slave"));

	    JSONArray jsonArray = jsonObject.optJSONArray("partition");
	    if(jsonArray != null) {
	    	for ( int i = 0; i < jsonArray.size(); i++ ) {
	    		JSONObject jsonObject2 = jsonArray.getJSONObject(i);
	    		if(StringUtils.hasText(jsonObject2.optString("partitionId")))
	    			partitionSchema.getPartitionIDs().add(jsonObject2.optString("partitionId"));
		    }
	    }
	    
	    return partitionSchema;
	}
	
	public void encodePartitionSchema(Element e, TransMeta transMeta) {
		JSONArray jsonArray = new JSONArray();
	    List<PartitionSchema> partitionSchemas = transMeta.getPartitionSchemas();
		for (int i = 0; i < partitionSchemas.size(); i++) {
			PartitionSchema partitionSchema = partitionSchemas.get(i);
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", partitionSchema.getName());
			jsonObject.put("dynamic", partitionSchema.isDynamicallyDefined() ? "Y" : "N");
			jsonObject.put("partitions_per_slave", partitionSchema.getNumberOfPartitionsPerSlave());
			
			JSONArray partitionIds = new JSONArray();
			List<String> partitionIDs = partitionSchema.getPartitionIDs();
			for (int j = 0; j < partitionIDs.size(); j++) {
				JSONObject jsonObject2 = new JSONObject();
				jsonObject2.put("partitionId", partitionIDs.get(j));
				partitionIds.add(jsonObject2);
			}
			jsonObject.put("partition", partitionIds);
			
			jsonArray.add(jsonObject);
		}
		e.setAttribute("partitionSchemas", jsonArray.toString());
	}

	@Override
	public boolean isDatabaseConnectionUsed(AbstractMeta meta, DatabaseMeta databaseMeta) {
		TransMeta transMeta = (TransMeta) meta;
		for (int i = 0; i < transMeta.nrSteps(); i++) {
			StepMeta stepMeta = transMeta.getStep(i);
			DatabaseMeta[] dbs = stepMeta.getStepMetaInterface().getUsedDatabaseConnections();
			for (int d = 0; d < dbs.length; d++) {
				if (dbs[d].equals(databaseMeta)) {
					return true;
				}
			}
		}
		
		TransLogTable transLogTable = transMeta.getTransLogTable();
		if (transLogTable.getDatabaseMeta() != null && transLogTable.getDatabaseMeta().equals(databaseMeta)) {
			return true;
		}

		return false;
	}

}
