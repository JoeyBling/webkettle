package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("DELETE_FOLDERS")
@Scope("prototype")
public class JobEntryDeleteFolders extends AbstractJobEntry {
	
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.deletefolders.JobEntryDeleteFolders jobEntryDeleteFolders = (org.pentaho.di.job.entries.deletefolders.JobEntryDeleteFolders) jobEntry;
		
		jobEntryDeleteFolders.argFromPrevious = "Y".equalsIgnoreCase(cell.getAttribute("arg_from_previous"));
		jobEntryDeleteFolders.setSuccessCondition(cell.getAttribute("success_condition"));
		jobEntryDeleteFolders.setLimitFolders(cell.getAttribute("limit_folders"));
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("fields"));
		jobEntryDeleteFolders.arguments = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			jobEntryDeleteFolders.arguments[i] = jsonObject.optString("field");
		}
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.deletefolders.JobEntryDeleteFolders jobEntryDeleteFolders = (org.pentaho.di.job.entries.deletefolders.JobEntryDeleteFolders) jobEntry;
		
		e.setAttribute("arg_from_previous", jobEntryDeleteFolders.isArgFromPrevious() ? "Y" : "N");
		e.setAttribute("success_condition", jobEntryDeleteFolders.getSuccessCondition());
		e.setAttribute("limit_folders", jobEntryDeleteFolders.getLimitFolders());
		
		JSONArray jsonArray = new JSONArray();
		if(jobEntryDeleteFolders.arguments != null) {
			for(int j=0; j<jobEntryDeleteFolders.arguments.length; j++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("field", jobEntryDeleteFolders.arguments[j]);
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
	}

}

