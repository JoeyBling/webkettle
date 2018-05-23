package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.synchronizeaftermerge.SynchronizeAfterMergeMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SynchronizeAfterMerge")
@Scope("prototype")
public class SynchronizeAfterMerge extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		SynchronizeAfterMergeMeta synchronizeAfterMergeMeta = (SynchronizeAfterMergeMeta) stepMetaInterface;
		
		synchronizeAfterMergeMeta.setDatabaseMeta(DatabaseMeta.findDatabase(databases, cell.getAttribute("connection")));
		synchronizeAfterMergeMeta.setSchemaName(cell.getAttribute("schema"));
		synchronizeAfterMergeMeta.setTableName(cell.getAttribute("table"));
		synchronizeAfterMergeMeta.setCommitSize(Const.toInt( cell.getAttribute("commit"), 0 ));
		synchronizeAfterMergeMeta.setUseBatchUpdate("Y".equalsIgnoreCase(cell.getAttribute("use_batch")));
		
		synchronizeAfterMergeMeta.settablenameInField("Y".equalsIgnoreCase(cell.getAttribute("tablename_in_field")));
		synchronizeAfterMergeMeta.settablenameField(cell.getAttribute("tablename_field"));
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("searchFields"));
		String[] keyStream = new String[jsonArray.size()];
		String[] keyCondition = new String[jsonArray.size()];
		String[] keyLookup = new String[jsonArray.size()];
		String[] keyStream2 = new String[jsonArray.size()];
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			keyStream[i] = jsonObject.optString("name");
			keyCondition[i] = jsonObject.optString("condition");
			keyLookup[i] = jsonObject.optString("field");
			keyStream2[i] = jsonObject.optString("name2");
		}

		synchronizeAfterMergeMeta.setKeyStream(keyStream);
		synchronizeAfterMergeMeta.setKeyCondition(keyCondition);
		synchronizeAfterMergeMeta.setKeyLookup(keyLookup);
		synchronizeAfterMergeMeta.setKeyStream2(keyStream2);
		
		jsonArray = JSONArray.fromObject(cell.getAttribute("updateFields"));
		String[] updateLookup = new String[jsonArray.size()];
		String[] updateStream = new String[jsonArray.size()];
		Boolean[] update = new Boolean[jsonArray.size()];
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			updateLookup[i] = jsonObject.optString("name");
			updateStream[i] = jsonObject.optString("rename");
			update[i] = "Y".equalsIgnoreCase(jsonObject.optString("update"));
		}

		synchronizeAfterMergeMeta.setUpdateLookup(updateLookup);
		synchronizeAfterMergeMeta.setUpdateStream(updateStream);
		synchronizeAfterMergeMeta.setUpdate(update);
		
		synchronizeAfterMergeMeta.setOperationOrderField(cell.getAttribute("operation_order_field"));
		synchronizeAfterMergeMeta.setOrderInsert(cell.getAttribute("order_insert"));
		synchronizeAfterMergeMeta.setOrderUpdate(cell.getAttribute("order_update"));
		synchronizeAfterMergeMeta.setOrderDelete(cell.getAttribute("order_delete"));
		synchronizeAfterMergeMeta.setPerformLookup("Y".equalsIgnoreCase(cell.getAttribute("perform_lookup")));
		
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		SynchronizeAfterMergeMeta synchronizeAfterMergeMeta = (SynchronizeAfterMergeMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("connection", synchronizeAfterMergeMeta.getDatabaseMeta() == null ? "" : synchronizeAfterMergeMeta.getDatabaseMeta().getName());
		e.setAttribute("schema", synchronizeAfterMergeMeta.getSchemaName());
		e.setAttribute("table", synchronizeAfterMergeMeta.getTableName());
		e.setAttribute("commit", synchronizeAfterMergeMeta.getCommitSize() + "");
		e.setAttribute("use_batch", synchronizeAfterMergeMeta.useBatchUpdate() ? "Y" : "N");
		
		e.setAttribute("tablename_in_field", synchronizeAfterMergeMeta.istablenameInField() ? "Y" : "N");
		e.setAttribute("tablename_field", synchronizeAfterMergeMeta.gettablenameField());
		
		JSONArray jsonArray = new JSONArray();
		String[] keyStream = synchronizeAfterMergeMeta.getKeyStream();
		for(int j=0; j<keyStream.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", keyStream[j]);
			jsonObject.put("field", synchronizeAfterMergeMeta.getKeyLookup()[j]);
			jsonObject.put("condition", synchronizeAfterMergeMeta.getKeyCondition()[j]);
			jsonObject.put("name2", synchronizeAfterMergeMeta.getKeyStream2()[j]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("searchFields", jsonArray.toString());
		
		jsonArray = new JSONArray();
		String[] updateLookup = synchronizeAfterMergeMeta.getUpdateLookup();
		for(int j=0; j<updateLookup.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", updateLookup[j]);
			jsonObject.put("rename", synchronizeAfterMergeMeta.getUpdateStream()[j]);
			jsonObject.put("update", synchronizeAfterMergeMeta.getUpdate()[j] ? "Y" : "N");
			jsonArray.add(jsonObject);
		}
		e.setAttribute("updateFields", jsonArray.toString());
		
		e.setAttribute("operation_order_field", synchronizeAfterMergeMeta.getOperationOrderField());
		e.setAttribute("order_insert", synchronizeAfterMergeMeta.getOrderInsert());
		e.setAttribute("order_update", synchronizeAfterMergeMeta.getOrderUpdate());
		e.setAttribute("order_delete", synchronizeAfterMergeMeta.getOrderDelete());
		e.setAttribute("perform_lookup", synchronizeAfterMergeMeta.isPerformLookup() ? "Y" : "N");
		
		return e;
	}

}
