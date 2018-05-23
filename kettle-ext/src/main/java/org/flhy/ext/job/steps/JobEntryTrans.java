package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.App;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.ObjectLocationSpecificationMethod;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.logging.LogLevel;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.RepositoryElementMetaInterface;
import org.pentaho.di.repository.RepositoryObject;
import org.pentaho.di.repository.RepositoryObjectType;
import org.pentaho.di.repository.StringObjectId;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("TRANS")
@Scope("prototype")
public class JobEntryTrans extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.trans.JobEntryTrans jobEntryTrans = (org.pentaho.di.job.entries.trans.JobEntryTrans) jobEntry;
		String specification_method = cell.getAttribute("specification_method");
		jobEntryTrans.setSpecificationMethod(ObjectLocationSpecificationMethod.getSpecificationMethodByCode(specification_method));
		
		if(jobEntryTrans.getSpecificationMethod() == ObjectLocationSpecificationMethod.FILENAME) {
			jobEntryTrans.setFileName(cell.getAttribute("filename"));
		} else if(jobEntryTrans.getSpecificationMethod() == ObjectLocationSpecificationMethod.REPOSITORY_BY_NAME) {
			jobEntryTrans.setDirectory(cell.getAttribute("directory"));
			jobEntryTrans.setTransname(cell.getAttribute("transname"));
		} else if(jobEntryTrans.getSpecificationMethod() == ObjectLocationSpecificationMethod.REPOSITORY_BY_REFERENCE) {
			jobEntryTrans.setTransObjectId(new StringObjectId(cell.getAttribute("trans_object_id")));
		}
		
		jobEntryTrans.argFromPrevious = "Y".equalsIgnoreCase(cell.getAttribute("arg_from_previous"));
		jobEntryTrans.paramsFromPrevious = "Y".equalsIgnoreCase(cell.getAttribute("params_from_previous"));
		jobEntryTrans.execPerRow = "Y".equalsIgnoreCase(cell.getAttribute("exec_per_row"));
		jobEntryTrans.clearResultRows = "Y".equalsIgnoreCase(cell.getAttribute("clear_rows"));
		jobEntryTrans.clearResultFiles = "Y".equalsIgnoreCase(cell.getAttribute("clear_files"));
		jobEntryTrans.setLogfile = "Y".equalsIgnoreCase(cell.getAttribute("set_logfile"));
		jobEntryTrans.logfile = cell.getAttribute("logfile");
		
		jobEntryTrans.logext = cell.getAttribute("logext");
		jobEntryTrans.addDate = "Y".equalsIgnoreCase(cell.getAttribute("add_date"));
		jobEntryTrans.addTime = "Y".equalsIgnoreCase(cell.getAttribute("add_time"));
		jobEntryTrans.logFileLevel = LogLevel.getLogLevelForCode( cell.getAttribute( "loglevel" ) );
		
		jobEntryTrans.setClustering( "Y".equalsIgnoreCase(cell.getAttribute("cluster")));
		jobEntryTrans.setRemoteSlaveServerName(cell.getAttribute("slave_server_name"));
		jobEntryTrans.setAppendLogfile = "Y".equalsIgnoreCase(cell.getAttribute("set_append_logfile"));
		jobEntryTrans.waitingToFinish = "Y".equalsIgnoreCase(cell.getAttribute("wait_until_finished"));
		jobEntryTrans.followingAbortRemotely = "Y".equalsIgnoreCase(cell.getAttribute("follow_abort_remote"));
		jobEntryTrans.createParentFolder = "Y".equalsIgnoreCase(cell.getAttribute("create_parent_folder"));
		jobEntryTrans.setLoggingRemoteWork("Y".equalsIgnoreCase(cell.getAttribute("logging_remote_work")));
		
		if(StringUtils.hasText(cell.getAttribute("arguments"))) {
			JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("arguments"));
			jobEntryTrans.arguments = new String[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				jobEntryTrans.arguments[i] = jsonObject.optString("name");
			}
		}
		
		if(StringUtils.hasText(cell.getAttribute("parameters"))) {
			JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("parameters"));
			jobEntryTrans.parameters = new String[jsonArray.size()];
			jobEntryTrans.parameterFieldNames = new String[jsonArray.size()];
			jobEntryTrans.parameterValues = new String[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				jobEntryTrans.parameters[i] = jsonObject.optString("name");
				jobEntryTrans.parameterFieldNames[i] = jsonObject.optString("stream_name");
				jobEntryTrans.parameterValues[i] = jsonObject.optString("value");
			}
		}
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.trans.JobEntryTrans jobEntryTrans = (org.pentaho.di.job.entries.trans.JobEntryTrans) jobEntry;
		Repository repo = App.getInstance().getRepository();
		e.setAttribute("supportsReferences", repo.getRepositoryMeta().getRepositoryCapabilities().supportsReferences() ? "Y" : "N");
		
		ObjectLocationSpecificationMethod specificationMethod = jobEntryTrans.getSpecificationMethod();
		e.setAttribute("specification_method", specificationMethod != null ? specificationMethod.getCode() : null);
		
		if(specificationMethod == ObjectLocationSpecificationMethod.FILENAME) {
			e.setAttribute("filename", jobEntryTrans.getFilename());
		} else if(specificationMethod == ObjectLocationSpecificationMethod.REPOSITORY_BY_NAME) {
			e.setAttribute("transname", jobEntryTrans.getTransname());
			if(StringUtils.hasText(jobEntryTrans.getDirectory()))
				e.setAttribute("directory", jobEntryTrans.getDirectory());
			else
				e.setAttribute("directory", jobEntryTrans.getDirectoryPath());
		} else if(specificationMethod == ObjectLocationSpecificationMethod.REPOSITORY_BY_REFERENCE) {
			ObjectId transObjectId = jobEntryTrans.getTransObjectId();
			if(transObjectId != null) {
				RepositoryObject objectInformation = repo.getObjectInformation( transObjectId, RepositoryObjectType.TRANSFORMATION );
				if (objectInformation != null) {
					e.setAttribute("trans_object_id", transObjectId.getId());
					e.setAttribute("referenceName", getPathOf(objectInformation));
				}
			}
		}
		
		e.setAttribute("arg_from_previous", jobEntryTrans.argFromPrevious ? "Y" : "N");
		e.setAttribute("params_from_previous", jobEntryTrans.paramsFromPrevious ? "Y" : "N");
		e.setAttribute("exec_per_row", jobEntryTrans.execPerRow ? "Y" : "N");
		e.setAttribute("clear_rows", jobEntryTrans.clearResultRows ? "Y" : "N");
		e.setAttribute("clear_files", jobEntryTrans.clearResultFiles ? "Y" : "N");
		e.setAttribute("set_logfile", jobEntryTrans.setLogfile ? "Y" : "N");
		e.setAttribute("logfile", jobEntryTrans.logfile);
		
		e.setAttribute("logext", jobEntryTrans.logext);
		e.setAttribute("add_date", jobEntryTrans.addDate ? "Y" : "N");
		e.setAttribute("add_time", jobEntryTrans.addTime ? "Y" : "N");
		e.setAttribute("loglevel", jobEntryTrans.logFileLevel != null ? jobEntryTrans.logFileLevel.getCode() : null);
		
		e.setAttribute("cluster", jobEntryTrans.isClustering() ? "Y" : "N");
		e.setAttribute("slave_server_name", jobEntryTrans.getRemoteSlaveServerName());
		e.setAttribute("set_append_logfile", jobEntryTrans.setAppendLogfile ? "Y" : "N");
		e.setAttribute("wait_until_finished", jobEntryTrans.waitingToFinish ? "Y" : "N");
		e.setAttribute("follow_abort_remote", jobEntryTrans.followingAbortRemotely ? "Y" : "N");
		e.setAttribute("create_parent_folder", jobEntryTrans.createParentFolder ? "Y" : "N");
		e.setAttribute("logging_remote_work", jobEntryTrans.isLoggingRemoteWork() ? "Y" : "N");
		
		if (jobEntryTrans.arguments != null) {
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < jobEntryTrans.arguments.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jobEntryTrans.arguments[i]);
				jsonArray.add(jsonObject);
			}
			e.setAttribute("arguments", jsonArray.toString());
		}
		
		if ( jobEntryTrans.parameters != null ) {
			e.setAttribute("pass_all_parameters", jobEntryTrans.isPassingAllParameters() ? "Y" : "N");
			
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < jobEntryTrans.parameters.length; i++) {
				
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jobEntryTrans.parameters[i]);
				jsonObject.put("stream_name", jobEntryTrans.parameterFieldNames[i]);
				jsonObject.put("value", jobEntryTrans.parameterValues[i]);
				jsonArray.add(jsonObject);
			}
			e.setAttribute("parameters", jsonArray.toString());
		}
		
		return e;
	}

	public static String getPathOf(RepositoryElementMetaInterface object) {
		if (object != null && !object.isDeleted()) {
			RepositoryDirectoryInterface directory = object.getRepositoryDirectory();
			if (directory != null) {
				String path = directory.getPath();
				if (path != null) {
					if (!path.endsWith("/")) {
						path += "/";
					}
					path += object.getName();

					return path;
				}
			}
		}
		return null;
	}

}
