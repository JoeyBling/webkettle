package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.update.UpdateMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("Update")
@Scope("prototype")
public class Update extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		UpdateMeta updateMeta = (UpdateMeta) stepMetaInterface;
		
		updateMeta.setDatabaseMeta(DatabaseMeta.findDatabase(databases, cell.getAttribute("connection")));
		updateMeta.setSchemaName(cell.getAttribute("schema"));
		updateMeta.setTableName(cell.getAttribute("table"));
		updateMeta.setCommitSize(cell.getAttribute("commit"));
		updateMeta.setSkipLookup("Y".equalsIgnoreCase(cell.getAttribute("skip_lookup")));
		updateMeta.setErrorIgnored("Y".equalsIgnoreCase(cell.getAttribute("error_ignored")));
		updateMeta.setUseBatchUpdate("Y".equalsIgnoreCase(cell.getAttribute("use_batch")));
		updateMeta.setIgnoreFlagField(cell.getAttribute("ignore_flag_field"));
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("searchFields"));
		String[] keyStream = new String[jsonArray.size()];
		String[] keyCondition = new String[jsonArray.size()];
		String[] keyLookup = new String[jsonArray.size()];
		String[] keyStream2 = new String[jsonArray.size()];
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			keyStream[i] = jsonObject.optString("name");
			keyCondition[i] = jsonObject.optString("field");
			keyLookup[i] = jsonObject.optString("condition");
			keyStream2[i] = jsonObject.optString("name2");
		}

		updateMeta.setKeyStream(keyStream);
		updateMeta.setKeyCondition(keyCondition);
		updateMeta.setKeyLookup(keyLookup);
		updateMeta.setKeyStream2(keyStream2);
		
		jsonArray = JSONArray.fromObject(cell.getAttribute("updateFields"));
		String[] updateLookup = new String[jsonArray.size()];
		String[] updateStream = new String[jsonArray.size()];
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			updateLookup[i] = jsonObject.optString("name");
			updateStream[i] = jsonObject.optString("rename");
		}

		updateMeta.setUpdateLookup(updateLookup);
		updateMeta.setUpdateStream(updateStream);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		UpdateMeta updateMeta = (UpdateMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("connection", updateMeta.getDatabaseMeta() == null ? "" : updateMeta.getDatabaseMeta().getName());
		e.setAttribute("schema", updateMeta.getSchemaName());
		e.setAttribute("table", updateMeta.getTableName());
		e.setAttribute("skip_lookup", updateMeta.isSkipLookup() ? "Y" : "N");
		e.setAttribute("commit", updateMeta.getCommitSizeVar());
		e.setAttribute("use_batch", updateMeta.useBatchUpdate() ? "Y" : "N");
		e.setAttribute("error_ignored", updateMeta.isErrorIgnored() ? "Y" : "N");
		e.setAttribute("ignore_flag_field", updateMeta.getIgnoreFlagField());
		
		JSONArray jsonArray = new JSONArray();
		String[] keyStream = updateMeta.getKeyStream();
		for(int j=0; j<keyStream.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", keyStream[j]);
			jsonObject.put("field", updateMeta.getKeyLookup()[j]);
			jsonObject.put("condition", updateMeta.getKeyCondition()[j]);
			jsonObject.put("name2", updateMeta.getKeyStream2()[j]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("searchFields", jsonArray.toString());
		
		jsonArray = new JSONArray();
		String[] updateLookup = updateMeta.getUpdateLookup();
		for(int j=0; j<updateLookup.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", updateLookup[j]);
			jsonObject.put("rename", updateMeta.getUpdateStream()[j]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("updateFields", jsonArray.toString());
		
		return e;
	}
	
}
