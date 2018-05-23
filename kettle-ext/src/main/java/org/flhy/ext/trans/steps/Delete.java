package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.delete.DeleteMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("Delete")
@Scope("prototype")
public class Delete extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		DeleteMeta deleteMeta = (DeleteMeta) stepMetaInterface;
		
		deleteMeta.setDatabaseMeta(DatabaseMeta.findDatabase(databases, cell.getAttribute("connection")));
		deleteMeta.setSchemaName(cell.getAttribute("schema"));
		deleteMeta.setTableName(cell.getAttribute("table"));
		deleteMeta.setCommitSize(cell.getAttribute("commit"));
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("key"));
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

		deleteMeta.setKeyStream(keyStream);
		deleteMeta.setKeyCondition(keyCondition);
		deleteMeta.setKeyLookup(keyLookup);
		deleteMeta.setKeyStream2(keyStream2);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		DeleteMeta deleteMeta = (DeleteMeta) stepMetaInterface;
		
		DatabaseMeta databaseMeta = deleteMeta.getDatabaseMeta();
		e.setAttribute("connection", databaseMeta == null ? "" : databaseMeta.getName());
		e.setAttribute("schema", deleteMeta.getSchemaName());
		e.setAttribute("table", deleteMeta.getTableName());
		e.setAttribute("commit", deleteMeta.getCommitSizeVar());
		
		JSONArray jsonArray = new JSONArray();
		String[] keyStream = deleteMeta.getKeyStream();
		for(int j=0; j<keyStream.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", keyStream[j]);
			jsonObject.put("field", deleteMeta.getKeyLookup()[j]);
			jsonObject.put("condition", deleteMeta.getKeyCondition()[j]);
			jsonObject.put("name2", deleteMeta.getKeyStream2()[j]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("key", jsonArray.toString());
		
		return e;
	}

}
