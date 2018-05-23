package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.sql.ExecSQLMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("ExecSQL")
@Scope("prototype")
public class ExecSQL extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		ExecSQLMeta execSQLMeta = (ExecSQLMeta) stepMetaInterface;
		
		String con = cell.getAttribute( "connection" );
		execSQLMeta.setDatabaseMeta(DatabaseMeta.findDatabase( databases, con ));
		execSQLMeta.setSql(StringEscapeHelper.decode(cell.getAttribute( "sql" )));
		
		execSQLMeta.setExecutedEachInputRow("Y".equalsIgnoreCase(cell.getAttribute( "executedEachInputRow" )));
		execSQLMeta.setSingleStatement("Y".equalsIgnoreCase(cell.getAttribute( "singleStatement" )));
		execSQLMeta.setVariableReplacementActive("Y".equalsIgnoreCase(cell.getAttribute( "replaceVariables" )));
		execSQLMeta.setParams("Y".equalsIgnoreCase(cell.getAttribute( "setParams" )));
		execSQLMeta.setQuoteString("Y".equalsIgnoreCase(cell.getAttribute( "quoteString" )));

		execSQLMeta.setInsertField(cell.getAttribute("insert_field"));
		execSQLMeta.setUpdateField(cell.getAttribute("update_field"));
		execSQLMeta.setDeleteField(cell.getAttribute("delete_field"));
		execSQLMeta.setReadField(cell.getAttribute("read_field"));
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute( "arguments" ));
		execSQLMeta.allocate( jsonArray.size() );
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			execSQLMeta.getArguments()[i] = jsonObject.optString("name");
		}
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		ExecSQLMeta execSQLMeta = (ExecSQLMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("connection", execSQLMeta.getDatabaseMeta() == null ? "" : execSQLMeta.getDatabaseMeta().getName());
		e.setAttribute("sql", StringEscapeHelper.encode(execSQLMeta.getSql()));
		e.setAttribute("executedEachInputRow", execSQLMeta.isExecutedEachInputRow() ? "Y" : "N");
		e.setAttribute("singleStatement", execSQLMeta.isSingleStatement() ? "Y" : "N");
		e.setAttribute("replaceVariables", execSQLMeta.isReplaceVariables() ? "Y" : "N");
		e.setAttribute("setParams", execSQLMeta.isParams() ? "Y" : "N");
		e.setAttribute("quoteString", execSQLMeta.isQuoteString() ? "Y" : "N");
		
		e.setAttribute("insert_field", execSQLMeta.getInsertField());
		e.setAttribute("update_field", execSQLMeta.getUpdateField());
		e.setAttribute("delete_field", execSQLMeta.getDeleteField());
		e.setAttribute("read_field", execSQLMeta.getReadField());
		
		JSONArray arguments = new JSONArray();
		for ( int i = 0; i < execSQLMeta.getArguments().length; i++ ) {
			String name = execSQLMeta.getArguments()[i];
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", name);
			arguments.add(jsonObject);
		}
		e.setAttribute("arguments", arguments.toString());
		
		return e;
	}

}
