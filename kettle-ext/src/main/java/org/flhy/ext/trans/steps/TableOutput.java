package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.tableoutput.TableOutputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("TableOutput")
@Scope("prototype")
public class TableOutput extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		TableOutputMeta tableOutputMeta = (TableOutputMeta) stepMetaInterface;
		
		tableOutputMeta.setDatabaseMeta(DatabaseMeta.findDatabase(databases, cell.getAttribute("connection")));
		tableOutputMeta.setSchemaName(cell.getAttribute("schema"));
		tableOutputMeta.setTableName(cell.getAttribute("table"));
		tableOutputMeta.setCommitSize(cell.getAttribute("commit"));
		tableOutputMeta.setTruncateTable("Y".equalsIgnoreCase(cell.getAttribute("truncate")));
		tableOutputMeta.setIgnoreErrors("Y".equalsIgnoreCase(cell.getAttribute("ignore_errors")));
		tableOutputMeta.setUseBatchUpdate("Y".equalsIgnoreCase(cell.getAttribute("use_batch")));
		
		tableOutputMeta.setSpecifyFields("Y".equalsIgnoreCase(cell.getAttribute("specify_fields")));
		tableOutputMeta.setPartitioningEnabled("Y".equalsIgnoreCase(cell.getAttribute("partitioning_enabled")));
		tableOutputMeta.setPartitioningField(cell.getAttribute("partitioning_field"));
		tableOutputMeta.setPartitioningDaily("Y".equalsIgnoreCase(cell.getAttribute("partitioning_daily")));
		tableOutputMeta.setPartitioningMonthly("Y".equalsIgnoreCase(cell.getAttribute("partitioning_monthly")));
		
		tableOutputMeta.setTableNameInField("Y".equalsIgnoreCase(cell.getAttribute("tablename_in_field")));
		tableOutputMeta.setTableNameField(cell.getAttribute("tablename_field"));
		tableOutputMeta.setTableNameInTable("Y".equalsIgnoreCase(cell.getAttribute("tablename_in_table")));
		tableOutputMeta.setReturningGeneratedKeys("Y".equalsIgnoreCase(cell.getAttribute("return_keys")));
		tableOutputMeta.setGeneratedKeyField(cell.getAttribute("return_field"));

		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("fields"));
		String[] fieldDatabase = new String[jsonArray.size()];
		String[] fieldStream = new String[jsonArray.size()];
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			fieldDatabase[i] = jsonObject.optString("column_name");
			fieldStream[i] = jsonObject.optString("stream_name");
		}

		tableOutputMeta.setFieldDatabase(fieldDatabase);
		tableOutputMeta.setFieldStream(fieldStream);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		TableOutputMeta tableOutputMeta = (TableOutputMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		DatabaseMeta databaseMeta = tableOutputMeta.getDatabaseMeta();
		e.setAttribute("connection", databaseMeta == null ? "" : databaseMeta.getName());
		e.setAttribute("schema", tableOutputMeta.getSchemaName());
		e.setAttribute("table", tableOutputMeta.getTableName());
		e.setAttribute("commit", tableOutputMeta.getCommitSize());
		e.setAttribute("truncate", tableOutputMeta.truncateTable() ? "Y" : "N");
		e.setAttribute("ignore_errors", tableOutputMeta.ignoreErrors() ? "Y" : "N");
		e.setAttribute("use_batch", tableOutputMeta.useBatchUpdate() ? "Y" : "N");
		e.setAttribute("specify_fields", tableOutputMeta.specifyFields() ? "Y" : "N");
		
		e.setAttribute("partitioning_enabled", tableOutputMeta.isPartitioningEnabled() ? "Y" : "N");
		e.setAttribute("partitioning_field", tableOutputMeta.getPartitioningField());
		e.setAttribute("partitioning_daily", tableOutputMeta.isPartitioningDaily() ? "Y" : "N");
		e.setAttribute("partitioning_monthly", tableOutputMeta.isPartitioningMonthly() ? "Y" : "N");
		
		e.setAttribute("tablename_in_field", tableOutputMeta.isTableNameInField() ? "Y" : "N");
		e.setAttribute("tablename_field", tableOutputMeta.getTableNameField());
		e.setAttribute("tablename_in_table", tableOutputMeta.isTableNameInTable() ? "Y" : "N");
		
		e.setAttribute("return_keys", tableOutputMeta.isReturningGeneratedKeys() ? "Y" : "N");
		e.setAttribute("return_field", tableOutputMeta.getGeneratedKeyField());
		
		JSONArray jsonArray = new JSONArray();
		String[] fieldDatabase = tableOutputMeta.getFieldDatabase();
		for ( int i = 0; i < fieldDatabase.length; i++ ) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("column_name", fieldDatabase[i]);
			jsonObject.put("stream_name", tableOutputMeta.getFieldStream()[i]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
	}

}
