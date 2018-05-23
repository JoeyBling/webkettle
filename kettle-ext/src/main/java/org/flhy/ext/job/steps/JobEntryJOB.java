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

@Component("JOB")
@Scope("prototype")
public class JobEntryJOB extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.job.JobEntryJob jobEntryJob = (org.pentaho.di.job.entries.job.JobEntryJob) jobEntry;
		
		String specification_method = cell.getAttribute("specification_method");
		jobEntryJob.setSpecificationMethod(ObjectLocationSpecificationMethod.getSpecificationMethodByCode(specification_method));
		
		if(jobEntryJob.getSpecificationMethod() == ObjectLocationSpecificationMethod.FILENAME) {
			jobEntryJob.setFileName(cell.getAttribute("filename"));
		} else if(jobEntryJob.getSpecificationMethod() == ObjectLocationSpecificationMethod.REPOSITORY_BY_NAME) {
			jobEntryJob.setDirectory(cell.getAttribute("directory"));
			jobEntryJob.setJobName(cell.getAttribute("jobname"));
		} else if(jobEntryJob.getSpecificationMethod() == ObjectLocationSpecificationMethod.REPOSITORY_BY_REFERENCE) {
			jobEntryJob.setJobObjectId(new StringObjectId(cell.getAttribute("job_object_id")));
		}
		
		jobEntryJob.argFromPrevious = "Y".equalsIgnoreCase(cell.getAttribute("arg_from_previous"));
		jobEntryJob.paramsFromPrevious = "Y".equalsIgnoreCase(cell.getAttribute("params_from_previous"));
		jobEntryJob.execPerRow = "Y".equalsIgnoreCase(cell.getAttribute("exec_per_row"));
		jobEntryJob.setLogfile = "Y".equalsIgnoreCase(cell.getAttribute("set_logfile"));
		jobEntryJob.logfile = cell.getAttribute("logfile");
		
		jobEntryJob.logext = cell.getAttribute("logext");
		jobEntryJob.addDate = "Y".equalsIgnoreCase(cell.getAttribute("add_date"));
		jobEntryJob.addTime = "Y".equalsIgnoreCase(cell.getAttribute("add_time"));
		jobEntryJob.logFileLevel = LogLevel.getLogLevelForCode( cell.getAttribute( "loglevel" ) );
		
		jobEntryJob.setRemoteSlaveServerName(cell.getAttribute("slave_server_name"));
		jobEntryJob.setAppendLogfile = "Y".equalsIgnoreCase(cell.getAttribute("set_append_logfile"));
		jobEntryJob.waitingToFinish = "Y".equalsIgnoreCase(cell.getAttribute("wait_until_finished"));
		jobEntryJob.followingAbortRemotely = "Y".equalsIgnoreCase(cell.getAttribute("follow_abort_remote"));
		jobEntryJob.createParentFolder = "Y".equalsIgnoreCase(cell.getAttribute("create_parent_folder"));
		jobEntryJob.expandingRemoteJob = "Y".equalsIgnoreCase(cell.getAttribute("expandingRemoteJob"));
		jobEntryJob.setPassingExport( "Y".equalsIgnoreCase(cell.getAttribute("passingExport")));

		if(StringUtils.hasText(cell.getAttribute("arguments"))) {
			JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("arguments"));
			jobEntryJob.arguments = new String[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				jobEntryJob.arguments[i] = jsonObject.optString("name");
			}
		}
		
		if(StringUtils.hasText(cell.getAttribute("parameters"))) {
			JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("parameters"));
			jobEntryJob.parameters = new String[jsonArray.size()];
			jobEntryJob.parameterFieldNames = new String[jsonArray.size()];
			jobEntryJob.parameterValues = new String[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				jobEntryJob.parameters[i] = jsonObject.optString("name");
				jobEntryJob.parameterFieldNames[i] = jsonObject.optString("stream_name");
				jobEntryJob.parameterValues[i] = jsonObject.optString("value");
			}
		}
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.job.JobEntryJob jobEntryJob = (org.pentaho.di.job.entries.job.JobEntryJob) jobEntry;
		Repository repo = App.getInstance().getRepository();
		e.setAttribute("supportsReferences", repo.getRepositoryMeta().getRepositoryCapabilities().supportsReferences() ? "Y" : "N");
		
		ObjectLocationSpecificationMethod specificationMethod = jobEntryJob.getSpecificationMethod();
		e.setAttribute("specification_method", specificationMethod != null ? specificationMethod.getCode() : null);
		
		if(specificationMethod == ObjectLocationSpecificationMethod.FILENAME) {
			e.setAttribute("filename", jobEntryJob.getFilename());
		} else if(specificationMethod == ObjectLocationSpecificationMethod.REPOSITORY_BY_NAME) {
			e.setAttribute("jobname", jobEntryJob.getJobName());
			if(StringUtils.hasText(jobEntryJob.getDirectory()))
				e.setAttribute("directory", jobEntryJob.getDirectory());
			else
				e.setAttribute("directory", jobEntryJob.getDirectory());
		} else if(specificationMethod == ObjectLocationSpecificationMethod.REPOSITORY_BY_REFERENCE) {
			ObjectId jobObjectId = jobEntryJob.getJobObjectId();
			if(jobObjectId != null) {
				RepositoryObject objectInformation = repo.getObjectInformation( jobObjectId, RepositoryObjectType.JOB );
				if (objectInformation != null) {
					e.setAttribute("job_object_id", jobObjectId.getId());
					e.setAttribute("referenceName", getPathOf(objectInformation));
				}
			}
		}
		
		e.setAttribute("arg_from_previous", jobEntryJob.argFromPrevious ? "Y" : "N");
		e.setAttribute("params_from_previous", jobEntryJob.paramsFromPrevious ? "Y" : "N");
		e.setAttribute("exec_per_row", jobEntryJob.execPerRow ? "Y" : "N");
		e.setAttribute("set_logfile", jobEntryJob.setLogfile ? "Y" : "N");
		e.setAttribute("logfile", jobEntryJob.logfile);
		
		e.setAttribute("logext", jobEntryJob.logext);
		e.setAttribute("add_date", jobEntryJob.addDate ? "Y" : "N");
		e.setAttribute("add_time", jobEntryJob.addTime ? "Y" : "N");
		e.setAttribute("loglevel", jobEntryJob.logFileLevel != null ? jobEntryJob.logFileLevel.getCode() : null);
		
		e.setAttribute("slave_server_name", jobEntryJob.getRemoteSlaveServerName());
		e.setAttribute("set_append_logfile", jobEntryJob.setAppendLogfile ? "Y" : "N");
		e.setAttribute("wait_until_finished", jobEntryJob.waitingToFinish ? "Y" : "N");
		e.setAttribute("follow_abort_remote", jobEntryJob.followingAbortRemotely ? "Y" : "N");
		e.setAttribute("create_parent_folder", jobEntryJob.createParentFolder ? "Y" : "N");
		e.setAttribute("expandingRemoteJob", jobEntryJob.expandingRemoteJob ? "Y" : "N");
		e.setAttribute("passingExport", jobEntryJob.isPassingExport() ? "Y" : "N");

		
		if (jobEntryJob.arguments != null) {
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < jobEntryJob.arguments.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jobEntryJob.arguments[i]);
				jsonArray.add(jsonObject);
			}
			e.setAttribute("arguments", jsonArray.toString());
		}
		
		if ( jobEntryJob.parameters != null ) {
			e.setAttribute("pass_all_parameters", jobEntryJob.isPassingAllParameters() ? "Y" : "N");
			
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < jobEntryJob.parameters.length; i++) {
				
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jobEntryJob.parameters[i]);
				jsonObject.put("stream_name", jobEntryJob.parameterFieldNames[i]);
				jsonObject.put("value", jobEntryJob.parameterValues[i]);
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
