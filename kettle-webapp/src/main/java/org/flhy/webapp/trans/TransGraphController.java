package org.flhy.webapp.trans;

import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Toolkit;
import java.awt.color.ColorSpace;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import javax.print.attribute.IntegerSyntax;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mchange.v2.c3p0.stmt.GooGooStatementCache;
import net.sf.json.JSON;
import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.TransDebugExecutor;
import org.flhy.ext.TransExecutor;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.core.ConditionCodec;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.trans.TransExecutionConfigurationCodec;
import org.flhy.ext.trans.step.StepEncoder;
import org.flhy.ext.utils.*;
import org.flhy.webapp.utils.GetSQLProgress;
import org.flhy.webapp.utils.SearchFieldsProgress;
import org.flhy.webapp.utils.TransPreviewProgress;
import org.pentaho.di.base.AbstractMeta;
import org.pentaho.di.core.CheckResultInterface;
import org.pentaho.di.core.CheckResultSourceInterface;
import org.pentaho.di.core.Condition;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.RowMetaAndData;
import org.pentaho.di.core.SQLStatement;
import org.pentaho.di.core.database.Database;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.logging.DefaultLogLevel;
import org.pentaho.di.core.logging.LoggingObjectInterface;
import org.pentaho.di.core.logging.LoggingObjectType;
import org.pentaho.di.core.logging.SimpleLoggingObject;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositorySecurityProvider;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.trans.TransExecutionConfiguration;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.TransPreviewFactory;
import org.pentaho.di.trans.debug.StepDebugMeta;
import org.pentaho.di.trans.debug.TransDebugMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.springframework.beans.factory.parsing.QualifierEntry;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.Element;

import com.mxgraph.util.mxUtils;

@Controller
@RequestMapping(value="/trans")
public class TransGraphController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/engineXml")
	protected void engineXml(HttpServletRequest request, HttpServletResponse response,@RequestParam String graphXml) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		AbstractMeta transMeta = codec.decode(graphXml);
		String xml = XMLHandler.getXMLHeader() + transMeta.getXML();
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(xml);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/database")
	protected void database(@RequestParam String graphXml, String name) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		DatabaseMeta databaseMeta = transMeta.findDatabase(name);
		if(databaseMeta == null)
			databaseMeta = new DatabaseMeta();
		
		JSONObject jsonObject = DatabaseCodec.encode(databaseMeta);
		JsonUtils.response(jsonObject);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/save")
	protected void save(@RequestParam String graphXml) throws Exception {
		Repository repository=null;
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		System.out.println(StringEscapeHelper.decode(graphXml));
		AbstractMeta transMeta = codec.decode(StringEscapeHelper.decode(graphXml));
		repository= App.getInstance().getRepository();
		ObjectId existingId = repository.getTransformationID( transMeta.getName(), transMeta.getRepositoryDirectory() );
		if(transMeta.getCreatedDate() == null)
			transMeta.setCreatedDate(new Date());
		if(transMeta.getObjectId() == null)
			transMeta.setObjectId(existingId);
		transMeta.setModifiedDate(new Date());

		boolean versioningEnabled = true;
		boolean versionCommentsEnabled = true;
		String fullPath = transMeta.getRepositoryDirectory() + "/" + transMeta.getName() + transMeta.getRepositoryElementType().getExtension();
		RepositorySecurityProvider repositorySecurityProvider = repository.getSecurityProvider() != null ? repository.getSecurityProvider() : null;
		if ( repositorySecurityProvider != null ) {
			versioningEnabled = repositorySecurityProvider.isVersioningEnabled(fullPath);
			versionCommentsEnabled = repositorySecurityProvider.allowsVersionComments( fullPath );
		}
		String versionComment = null;
		if (!versioningEnabled || !versionCommentsEnabled) {
			versionComment = "";
		} else {
			versionComment = "no comment";
		}
		repository.save( transMeta, versionComment, null);
		JsonUtils.success("转换保存成功！");
	}
	
	/**
	 * 校验这个转换
	 * 
	 * @param graphXml
	 * @param show_successful_results
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/check")
	protected void check(@RequestParam String graphXml, @RequestParam boolean show_successful_results) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
		ArrayList<CheckResultInterface> remarks = new ArrayList<CheckResultInterface>();
		transMeta.checkSteps(remarks, false, null, transMeta, App.getInstance().getRepository(), App.getInstance().getMetaStore() );
		
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < remarks.size(); i++) {
			CheckResultInterface cr = remarks.get(i);
			if (show_successful_results || cr.getType() != CheckResultInterface.TYPE_RESULT_OK) {
				JSONObject jsonObject = new JSONObject();

				CheckResultSourceInterface sourceMeta = cr.getSourceInfo();
				if (sourceMeta != null) {
					jsonObject.put("name", sourceMeta.getName());
				} else {
					jsonObject.put("name", "&lt;global&gt;");
				}

				jsonObject.put("type", cr.getType());
				jsonObject.put("typeDesc", cr.getTypeDesc());
				jsonObject.put("text", cr.getText());

				jsonArray.add(jsonObject);
			}
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/initPreview")
	protected void initPreview(@RequestParam String graphXml, @RequestParam String selectedCells) throws Exception {
		JSONArray cells = JSONArray.fromObject(URLDecoder.decode(selectedCells, "utf-8"));
		HashSet hs = new HashSet();
		hs.addAll(cells);
		
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		transMeta.setRepository(App.getInstance().getRepository());
		transMeta.setMetaStore(App.getInstance().getMetaStore());
		
		TransExecutionConfiguration executionConfiguration = App.getInstance().getTransPreviewExecutionConfiguration();
		executionConfiguration.setRepository(App.getInstance().getRepository());
		executionConfiguration.setSafeModeEnabled(true);
		
		TransDebugMeta transDebugMeta = transPreviewMetaMap.get(transMeta);
		if (transDebugMeta == null) {
			transDebugMeta = new TransDebugMeta(transMeta);
			transPreviewMetaMap.put(transMeta, transDebugMeta);
		}
		
		transDebugMeta.getTransMeta().setRepository(App.getInstance().getRepository());
		
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < transDebugMeta.getTransMeta().getSteps().size(); i++) {
			StepMeta stepMeta = transDebugMeta.getTransMeta().getStep(i);
			transDebugMeta.getStepDebugMetaMap().get(stepMeta);

			PluginInterface plugin = PluginRegistry.getInstance().getPlugin(StepPluginType.class, stepMeta.getStepID());
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("index", transMeta.indexOfStep(stepMeta));
			jsonObject.put("name", stepMeta.getName());
			jsonObject.put("image", SvgImageUrl.getUrl(plugin));
			
			if(hs.contains(stepMeta.getName())) {
				jsonObject.put("rowCount", PropsUI.getInstance().getDefaultPreviewSize());
				jsonObject.put("pauseBreakPoint", "N");
				jsonObject.put("firstRows", "Y");
			}
			
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/preview")
	protected void preview(@RequestParam String graphXml, @RequestParam String selectedCells) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		transMeta.setRepository(App.getInstance().getRepository());
		transMeta.setMetaStore(App.getInstance().getMetaStore());
		
		TransExecutionConfiguration executionConfiguration = App.getInstance().getTransPreviewExecutionConfiguration();
		executionConfiguration.setRepository(App.getInstance().getRepository());
		executionConfiguration.setSafeModeEnabled(true);
		
		TransDebugMeta transDebugMeta = transPreviewMetaMap.get(transMeta);
		if (transDebugMeta == null) {
			transDebugMeta = new TransDebugMeta(transMeta);
			transPreviewMetaMap.put(transMeta, transDebugMeta);
		}
		
		transDebugMeta.getTransMeta().setRepository( App.getInstance().getRepository() );
		
		
		JSONArray cells = JSONArray.fromObject(URLDecoder.decode(selectedCells, "utf-8"));
		for(int i=0; i<cells.size(); i++) {
			JSONObject jsonObject = cells.getJSONObject(i);
			
			StepMeta stepMeta = transMeta.getStep(jsonObject.optInt("index"));
			StepDebugMeta stepDebugMeta = new StepDebugMeta(stepMeta);

			stepDebugMeta.setPausingOnBreakPoint("Y".equalsIgnoreCase(jsonObject.optString("pauseBreakPoint")));
			stepDebugMeta.setReadingFirstRows("Y".equalsIgnoreCase(jsonObject.optString("firstRows")));
			stepDebugMeta.setRowCount(Const.toInt( jsonObject.optString("rowCount"), -1));
			
			if(jsonObject.optJSONObject("condition") != null) {
				Condition condition = ConditionCodec.decode(jsonObject.optJSONObject("condition"));
				stepDebugMeta.setCondition(condition);
			} else {
				stepDebugMeta.setCondition(new Condition());
			}
			
			transDebugMeta.getStepDebugMetaMap().put(stepMeta, stepDebugMeta);
		}
		
		executionConfiguration.setExecutingLocally( true );
        executionConfiguration.setExecutingRemotely( false );
        executionConfiguration.setExecutingClustered( false );
        
        Object[] data = App.getInstance().getVariables().getData();
        String[] fields = App.getInstance().getVariables().getRowMeta().getFieldNames();
        Map<String, String> variableMap = new HashMap<String, String>();
        variableMap.putAll( executionConfiguration.getVariables() ); // the default
        for ( int idx = 0; idx < fields.length; idx++ ) {
          String value = executionConfiguration.getVariables().get( fields[idx] );
          if ( Const.isEmpty( value ) ) {
            value = data[idx].toString();
          }
          variableMap.put( fields[idx], value );
        }

        executionConfiguration.setVariables( variableMap );
        executionConfiguration.getUsedVariables( transMeta );
        executionConfiguration.getUsedArguments( transMeta, App.getInstance().getArguments() );

        TransDebugExecutor transExecutor = TransDebugExecutor.initExecutor(executionConfiguration, transMeta, transDebugMeta);
	    Thread tr = new Thread(transExecutor, "TransDebugExecutor_" + transExecutor.getExecutionId());
	    tr.start();
		
        JsonUtils.success(transExecutor.getExecutionId());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/stop")
	protected JSONObject stop(@RequestParam String executionId,HttpServletResponse response) throws Exception {
		TransExecutor transExecutor = TransExecutor.getExecutor(executionId);
		if(transExecutor!=null && transExecutor.getTrans()==null){
			response.setContentType("text/html;charset=utf-8");
			PrintWriter out=response.getWriter();
			out.write("faile");
			out.flush();
			out.close();
			return null;
		}
		if(transExecutor != null || transExecutor.getTrans()!=null) {
			transExecutor.stop();
			while(!transExecutor.isFinished())
				Thread.sleep(500);
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("finished", transExecutor.isFinished());
			jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
			jsonObject.put("log", transExecutor.getExecutionLog());
			jsonObject.put("stepStatus", transExecutor.getStepStatus());
			TransExecutor.remove(executionId);
			return jsonObject;
		}
		
		TransDebugExecutor transDebugExecutor = TransDebugExecutor.getExecutor(executionId);
		if(transDebugExecutor != null) {
			transDebugExecutor.stop();
			while(!transDebugExecutor.isFinished())
				Thread.sleep(500);
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("finished", transDebugExecutor.isFinished());
			jsonObject.put("stepMeasure", transDebugExecutor.getStepMeasure());
			jsonObject.put("log", transDebugExecutor.getExecutionLog());
			jsonObject.put("stepStatus", transDebugExecutor.getStepStatus());
			jsonObject.put("previewData", transDebugExecutor.getPreviewData());
			
			TransDebugExecutor.remove(executionId);
			return jsonObject;
		}
		return null;
	}

	//暂停 or 开始
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/pause")
	protected void pause(@RequestParam String executionId,HttpServletResponse response) throws Exception {
		TransExecutor transExecutor = TransExecutor.getExecutor(executionId);
		String result="";
		if(transExecutor != null && null!=transExecutor.getTrans()) {
			transExecutor.pause();
			result="success";
		}else{
			result="faile";
		}
		response.setContentType("text/html;charset=utf-8");
		PrintWriter out=response.getWriter();
		out.write(result);
		out.flush();
		out.close();
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/previewResult")
	protected void previewResult(@RequestParam String executionId, @RequestParam(required=false) String action,HttpServletResponse response) throws Exception {
		TransDebugExecutor transExecutor = TransDebugExecutor.getExecutor(executionId);
		if(transExecutor == null)
			return;
		
		if("stop".equalsIgnoreCase(action)) {
//			transExecutor.stop();
//			while(!transExecutor.isFinished())
//				Thread.sleep(500);
			
//			JSONObject jsonObject = new JSONObject();
//			jsonObject.put("finished", transExecutor.isFinished());
//			jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
//			jsonObject.put("log", transExecutor.getExecutionLog());
//			jsonObject.put("stepStatus", transExecutor.getStepStatus());
//			jsonObject.put("previewData", transExecutor.getPreviewData());
//			TransDebugExecutor.remove(executionId);
			JsonUtils.response(stop(executionId,response));
			return;
		} else if("askformore".equalsIgnoreCase(action)) {
			while(!transExecutor.isPreviewed() && !transExecutor.isFinished())
				Thread.sleep(200);
			
			JSONObject jsonObject = new JSONObject();
			
			jsonObject.put("finished", transExecutor.isFinished());
			jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
			jsonObject.put("log", transExecutor.getExecutionLog());
			jsonObject.put("stepStatus", transExecutor.getStepStatus());
			jsonObject.put("previewData", transExecutor.getPreviewData());
			
			if(transExecutor.isFinished()) {
				jsonObject.put("lastPreviewResults", transExecutor.getLastPreviewResults());
				TransDebugExecutor.remove(executionId);
			}
			
			JsonUtils.response(jsonObject);
			transExecutor.clearPreview();
			transExecutor.resume();
			return;
		}
	}
	
	private Map<TransMeta, TransDebugMeta> transPreviewMetaMap = new HashMap<TransMeta, TransDebugMeta>();
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/initRun")
	protected void initRun(@RequestParam String graphXml) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		transMeta.setRepository(App.getInstance().getRepository());
		transMeta.setMetaStore(App.getInstance().getMetaStore());
		
		TransExecutionConfiguration executionConfiguration = App.getInstance().getTransExecutionConfiguration();
		
		if (transMeta.findFirstUsedClusterSchema() != null) {
			executionConfiguration.setExecutingLocally(false);
			executionConfiguration.setExecutingRemotely(false);
			executionConfiguration.setExecutingClustered(true);
		} else {
			executionConfiguration.setExecutingLocally(true);
			executionConfiguration.setExecutingRemotely(false);
			executionConfiguration.setExecutingClustered(false);
		}
		
		 // Remember the variables set previously
	    //
		RowMetaAndData variables = App.getInstance().getVariables();
	    Object[] data = variables.getData();
	    String[] fields = variables.getRowMeta().getFieldNames();
	    Map<String, String> variableMap = new HashMap<String, String>();
	    for ( int idx = 0; idx < fields.length; idx++ ) {
	    	variableMap.put( fields[idx], data[idx].toString() );
	    }

	    executionConfiguration.setVariables(variableMap);
	    executionConfiguration.getUsedVariables( transMeta );
	    executionConfiguration.getUsedArguments(transMeta, App.getInstance().getArguments());
	    executionConfiguration.setReplayDate(null);
	    executionConfiguration.setRepository(App.getInstance().getRepository());
	    executionConfiguration.setSafeModeEnabled(false);

	    executionConfiguration.setLogLevel(DefaultLogLevel.getLogLevel());
		
		// Fill the parameters, maybe do this in another place?
		Map<String, String> params = executionConfiguration.getParams();
		params.clear();
		String[] paramNames = transMeta.listParameters();
		for (String name : paramNames) {
			params.put(name, "");
		}
		
		JsonUtils.response(TransExecutionConfigurationCodec.encode(executionConfiguration));
	}
	
	/**
	 * 执行转换
	 * 
	 * @param graphXml
	 * @param executionConfiguration
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/run")
	protected void run(@RequestParam String graphXml, @RequestParam String executionConfiguration) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
		JSONObject jsonObject = JSONObject.fromObject(executionConfiguration);
		TransExecutionConfiguration transExecutionConfiguration = TransExecutionConfigurationCodec.decode(jsonObject, transMeta);
	    
	    TransExecutor transExecutor = TransExecutor.initExecutor(transExecutionConfiguration, transMeta);
	    Thread tr = new Thread(transExecutor, "TransExecutor_" + transExecutor.getExecutionId());
	    tr.start();
//      executions.put(transExecutor.getExecutionId(), transExecutor);
		
        JsonUtils.success(transExecutor.getExecutionId());
	}
	
//	private static HashMap<String, TransExecutor> executions = new HashMap<String, TransExecutor>();
	
	/**
	 * 获取执行结果
	 * 
	 * @param executionId
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/result")
	protected void result(@RequestParam String executionId) throws Exception {
		JSONObject jsonObject = new JSONObject();
		TransExecutor transExecutor = TransExecutor.getExecutor(executionId);
		if (transExecutor!=null) {
			jsonObject.put("finished", transExecutor.isFinished());
			if(transExecutor.isFinished()) {
                TransExecutor.remove(executionId);
                jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
                jsonObject.put("log", transExecutor.getExecutionLog());
                jsonObject.put("stepStatus", transExecutor.getStepStatus());
    //			jsonObject.put("previewData", transExecutor.getPreviewData());
            } else {
                jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
                jsonObject.put("log", transExecutor.getExecutionLog());
                jsonObject.put("stepStatus", transExecutor.getStepStatus());
    //			jsonObject.put("previewData", transExecutor.getPreviewData());
            }
		}
		JsonUtils.response(jsonObject);
	}
	
	/**
	 * 新建步骤
	 * 
	 * @param graphXml
	 * @param pluginId
	 * @param name
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/newStep")
	protected void newStep(@RequestParam String graphXml, @RequestParam String pluginId, @RequestParam String name) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
	    if ( transMeta.findStep( name ) != null ) {
	      int i = 2;
	      String newName = name + " " + i;
	      while ( transMeta.findStep( newName ) != null ) {
	        i++;
	        newName = name + " " + i;
	      }
	      name = newName;
	    }

		PluginRegistry registry = PluginRegistry.getInstance();

		PluginInterface stepPlugin = registry.findPluginWithId(StepPluginType.class, pluginId);
		if (stepPlugin != null) {
			StepMetaInterface info = (StepMetaInterface) registry.loadClass(stepPlugin);
			info.setDefault();
			StepMeta stepMeta = new StepMeta(stepPlugin.getIds()[0], name, info);
			stepMeta.drawStep();
			
			StepEncoder encoder = (StepEncoder) PluginFactory.getBean(pluginId);
			Element e = encoder.encodeStep(stepMeta);
			
			JsonUtils.responseXml(XMLHandler.getXMLHeader() + mxUtils.getXml(e));
		}
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/nextSteps")
	protected void nextSteps(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
		JSONArray jsonArray = new JSONArray();
		StepMeta stepinfo = transMeta.findStep( URLDecoder.decode(stepName, "utf-8") );
		List<StepMeta> steps = transMeta.findNextSteps(stepinfo);
		for(StepMeta stepMeta : steps) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", stepMeta.getName());
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/previousSteps")
	protected void previousSteps(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
		JSONArray jsonArray = new JSONArray();
		StepMeta stepinfo = transMeta.findStep(URLDecoder.decode(stepName, "utf-8"));
		List<StepMeta> steps = transMeta.findPreviousSteps(stepinfo);
		for(StepMeta stepMeta : steps) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", stepMeta.getName());
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/getSQL")
	protected void getSQL(@RequestParam String graphXml) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		//
		GetSQLProgress getSQLProgress = new GetSQLProgress(transMeta);
		List<SQLStatement> stats = getSQLProgress.run();
		JSONArray jsonArray = new JSONArray();
		if(stats != null && stats.size() > 0) {
			for ( int i = 0; i < stats.size(); i++ ) {
				SQLStatement stat = stats.get( i );

				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", stat.getStepname());
				if(stat.getDatabase() != null)
					jsonObject.put("databaseName", stat.getDatabase().getName());
				jsonObject.put("sql", StringEscapeHelper.encode(stat.getSQL()));
				jsonObject.put("error", stat.getError());
				jsonArray.add(jsonObject);
			}
		} else {

		}
		
		JsonUtils.response(jsonArray);
	}
	
	/**
	 * 获取输入输出字段
	 * 
	 * @param stepName
	 * @param graphXml
	 * @param before false回去输出字段，true获取输入字段
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/inputOutputFields")
	protected void inputOutputFields(@RequestParam String graphXml, @RequestParam String stepName, @RequestParam boolean before) throws Exception {
		stepName = StringEscapeHelper.decode(stepName);
		
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
		StepMeta stepMeta = getStep(transMeta, stepName);
		SearchFieldsProgress op = new SearchFieldsProgress(transMeta,stepMeta,before );
		op.run();
		RowMetaInterface rowMetaInterface = op.getFields();
		
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < rowMetaInterface.size(); i++) {
			ValueMetaInterface v = rowMetaInterface.getValueMeta(i);
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", v.getName());
			jsonObject.put("type", v.getTypeDesc());
			jsonObject.put("length", v.getLength() < 0 ? "-" : "" + v.getLength());
			jsonObject.put("precision", v.getPrecision() < 0 ? "-" : "" + v.getPrecision());
			jsonObject.put("origin", Const.NVL(v.getOrigin(), ""));
			jsonObject.put("storageType", ValueMeta.getStorageTypeCode(v.getStorageType()));
			jsonObject.put("conversionMask", Const.NVL(v.getConversionMask(), ""));
			jsonObject.put("currencySymbol", Const.NVL(v.getCurrencySymbol(), ""));
			jsonObject.put("decimalSymbol", Const.NVL(v.getDecimalSymbol(), ""));
			jsonObject.put("groupingSymbol", Const.NVL(v.getGroupingSymbol(), ""));
			jsonObject.put("trimType", ValueMeta.getTrimTypeDesc(v.getTrimType()));
			jsonObject.put("comments", Const.NVL(v.getComments(), ""));
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	public StepMeta getStep(TransMeta transMeta, String label) {
		List<StepMeta> list = transMeta.getSteps();
		for(int i=0; i<list.size(); i++) {
			StepMeta step = list.get(i);
			if(label.equals(step.getName()))
				return step;
		}
		return null;
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/tableFields")
	protected void tableFields(@RequestParam String graphXml, @RequestParam String databaseName, @RequestParam String schema, @RequestParam String table) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		DatabaseMeta inf = transMeta.findDatabase(databaseName);
		
		Database db = new Database( loggingObject, inf );
		db.connect();
		
		JSONArray jsonArray = new JSONArray();
		String schemaTable = inf.getQuotedSchemaTableCombination( transMeta.environmentSubstitute( schema ), transMeta.environmentSubstitute( table ) );
		RowMetaInterface fields = db.getTableFields(schemaTable);
		if (fields != null) {
			for (int i = 0; i < fields.size(); i++) {
				ValueMetaInterface field = fields.getValueMeta(i);
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", inf.quoteField(field.getName()));
				jsonArray.add(jsonObject);
			}
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/previewData")
	protected void previewData(@RequestParam String graphXml, @RequestParam String stepName, @RequestParam int rowLimit) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		StepMeta stepMeta = getStep(transMeta, stepName);
		TransMeta previewMeta = TransPreviewFactory.generatePreviewTransformation( transMeta, stepMeta.getStepMetaInterface(), stepName );
		TransPreviewProgress progresser = new TransPreviewProgress(previewMeta, new String[] {stepName }, new int[] { rowLimit } );
		
		RowMetaInterface rowMeta = progresser.getPreviewRowsMeta(stepName);
		List<Object[]> rowsData = progresser.getPreviewRows(stepName);
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		FontMetrics fm = Toolkit.getDefaultToolkit().getFontMetrics(f);
			
		if (rowMeta != null) {
			JSONObject jsonObject = new JSONObject();
			List<ValueMetaInterface> valueMetas = rowMeta.getValueMetaList();
			
			int width = 0;
			JSONArray columns = new JSONArray();
			JSONObject metaData = new JSONObject();
			JSONArray fields = new JSONArray();
			for (int i = 0; i < valueMetas.size(); i++) {
				ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
				fields.add(valueMeta.getName());
				String header = valueMeta.getComments() == null ? valueMeta.getName() : valueMeta.getComments();
				
				int hWidth = fm.stringWidth(header) + 10;
				width += hWidth;
				JSONObject column = new JSONObject();
				column.put("dataIndex", valueMeta.getName());
				column.put("header", header);
				column.put("width", hWidth);
				columns.add(column);
			}
			metaData.put("fields", fields);
			metaData.put("root", "firstRecords");
			
			JSONArray firstRecords = new JSONArray();
			for (int rowNr = 0; rowNr < rowsData.size(); rowNr++) {
				Object[] rowData = rowsData.get(rowNr);
				JSONObject row = new JSONObject();
				for (int colNr = 0; colNr < rowMeta.size(); colNr++) {
					String string = null;
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
						e.printStackTrace();
					}
					if(!StringUtils.hasText(string))
						string = "&lt;null&gt;";
					
					ValueMetaInterface valueMeta = rowMeta.getValueMeta( colNr );
					row.put(valueMeta.getName(), string);
				}
				if(firstRecords.size() <= rowLimit) {
					firstRecords.add(row);
				}
			}
			
			jsonObject.put("metaData", metaData);
			jsonObject.put("columns", columns);
			jsonObject.put("firstRecords", firstRecords);
			jsonObject.put("width", width < 1000 ? width : 1000);
			
			JsonUtils.response(jsonObject);
		} else {
			
		}
		
	}
	
	public static final LoggingObjectInterface loggingObject = new SimpleLoggingObject("TransGraphController", LoggingObjectType.TRANSMETA, null );
}
