package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entries.ftpput.JobEntryFTPPUT;
import org.pentaho.di.job.entries.ftpsget.FTPSConnection;
import org.pentaho.di.job.entries.setvariables.JobEntrySetVariables;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.trans.steps.textfileoutput.TextFileOutputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;



import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SET_VARIABLES")
@Scope("prototype")
public class JobEntrySetVariable extends AbstractJobEntry{
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
	JobEntrySetVariables setVariables = (JobEntrySetVariables) jobEntry;

		setVariables.filename=cell.getAttribute("filename");
		setVariables.replaceVars= "Y".equalsIgnoreCase(cell.getAttribute("replaceVars"));
		setVariables.fileVariableType= setVariables.getVariableType(cell.getAttribute("fileVariableType"));

		String fields = cell.getAttribute("fields");
		JSONArray jsonArray = JSONArray.fromObject(fields);
		String[] fieldName = new String[jsonArray.size()];
		String[] variableName = new String[jsonArray.size()];
		int[] variableType = new int[jsonArray.size()];
		String[] variableValue = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			variableName[i] = jsonObject.optString("variableName");
			variableType[i] = setVariables.getVariableType(jsonObject.optString("variableType"));
			variableValue[i] = jsonObject.optString("variableValue");
		}
		setVariables.setVariableName(variableName);
		setVariables.setVariableType(variableType);
		setVariables.variableValue= variableValue;
		
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		JobEntrySetVariables setVariables = (JobEntrySetVariables) jobEntry;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		
		e.setAttribute("filename", setVariables.filename);
		e.setAttribute("replaceVars", setVariables.replaceVars  ? "Y" : "N");
		e.setAttribute("fileVariableType", setVariables.getVariableTypeCode(setVariables.fileVariableType));

		JSONArray jsonArray = new JSONArray();
		String[] fieldName = setVariables.variableName;
		if(fieldName != null) {
			for(int i=0; i<fieldName.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("field_name", fieldName[i]);
				jsonObject.put("variableName", setVariables.variableName[i]);
				jsonObject.put("variableType", setVariables.getVariableTypeCode(setVariables.variableType[i]));
				jsonObject.put("variableValue", setVariables.variableValue[i]);
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
		}

}
