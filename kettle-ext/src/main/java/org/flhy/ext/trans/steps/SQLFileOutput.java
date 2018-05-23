package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.sqlfileoutput.SQLFileOutputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SQLFileOutput")
@Scope("prototype")
public class SQLFileOutput extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		SQLFileOutputMeta sqlFileOutputMeta = (SQLFileOutputMeta) stepMetaInterface;
		
		sqlFileOutputMeta.setDatabaseMeta(DatabaseMeta.findDatabase( databases, cell.getAttribute("connection") ));
		sqlFileOutputMeta.setSchemaName(cell.getAttribute("schema"));
		sqlFileOutputMeta.setTablename(cell.getAttribute("table"));
		
		sqlFileOutputMeta.setTruncateTable("Y".equalsIgnoreCase(cell.getAttribute("truncate")));
		sqlFileOutputMeta.setCreateTable("Y".equalsIgnoreCase(cell.getAttribute("create")));
		sqlFileOutputMeta.setStartNewLine("Y".equalsIgnoreCase(cell.getAttribute("startnewline")));
		sqlFileOutputMeta.setFileName(cell.getAttribute("name"));
		sqlFileOutputMeta.setCreateParentFolder("Y".equalsIgnoreCase(cell.getAttribute("create_parent_folder")));
		sqlFileOutputMeta.setDoNotOpenNewFileInit("Y".equalsIgnoreCase(cell.getAttribute("DoNotOpenNewFileInit")));
		sqlFileOutputMeta.setExtension(cell.getAttribute("extention"));
		sqlFileOutputMeta.setStepNrInFilename("Y".equalsIgnoreCase(cell.getAttribute("split")));
		sqlFileOutputMeta.setDateInFilename("Y".equalsIgnoreCase(cell.getAttribute("add_date")));
		sqlFileOutputMeta.setTimeInFilename("Y".equalsIgnoreCase(cell.getAttribute("add_time")));
		sqlFileOutputMeta.setFileAppended("Y".equalsIgnoreCase(cell.getAttribute("append")));
		sqlFileOutputMeta.setSplitEvery( Const.toInt( cell.getAttribute("splitevery"), 0 ));
		sqlFileOutputMeta.setAddToResult("Y".equalsIgnoreCase(cell.getAttribute("addtoresult")));
		
		sqlFileOutputMeta.setEncoding(cell.getAttribute("encoding"));
		sqlFileOutputMeta.setDateFormat(cell.getAttribute("dateformat"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		SQLFileOutputMeta sqlFileOutputMeta = (SQLFileOutputMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("connection", sqlFileOutputMeta.getDatabaseMeta() == null ? "" : sqlFileOutputMeta.getDatabaseMeta().getName());
		e.setAttribute("schema", sqlFileOutputMeta.getSchemaName());
		e.setAttribute("table", sqlFileOutputMeta.getTablename());
		
		e.setAttribute("truncate", sqlFileOutputMeta.truncateTable() ? "Y" : "N");
		e.setAttribute("create", sqlFileOutputMeta.createTable() ? "Y" : "N");
		e.setAttribute("startnewline", sqlFileOutputMeta.StartNewLine() ? "Y" : "N");
		e.setAttribute("name", sqlFileOutputMeta.getFileName());
		e.setAttribute("create_parent_folder", sqlFileOutputMeta.isCreateParentFolder() ? "Y" : "N");
		e.setAttribute("DoNotOpenNewFileInit", sqlFileOutputMeta.isDoNotOpenNewFileInit() ? "Y" : "N");
		e.setAttribute("extention", sqlFileOutputMeta.getExtension());
		e.setAttribute("split", sqlFileOutputMeta.isStepNrInFilename() ? "Y" : "N");
		e.setAttribute("add_date", sqlFileOutputMeta.isDateInFilename() ? "Y" : "N");
		e.setAttribute("add_time", sqlFileOutputMeta.isTimeInFilename() ? "Y" : "N");
		e.setAttribute("append", sqlFileOutputMeta.isFileAppended() ? "Y" : "N");
		e.setAttribute("splitevery", sqlFileOutputMeta.getSplitEvery() + "");
		e.setAttribute("addtoresult", sqlFileOutputMeta.AddToResult() ? "Y" : "N");
		
		e.setAttribute("encoding", sqlFileOutputMeta.getEncoding());
		e.setAttribute("dateformat", sqlFileOutputMeta.getDateFormat());
		
		return e;
	}

}
