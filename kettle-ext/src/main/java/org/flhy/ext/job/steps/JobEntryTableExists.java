package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("TABLE_EXISTS")
@Scope("prototype")
public class JobEntryTableExists extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.tableexists.JobEntryTableExists jobEntryTableExists = (org.pentaho.di.job.entries.tableexists.JobEntryTableExists) jobEntry;
		
		jobEntryTableExists.setDatabase(DatabaseMeta.findDatabase(databases, cell.getAttribute("connection")));
		jobEntryTableExists.setSchemaname(cell.getAttribute("schemaname"));
		jobEntryTableExists.setTablename(cell.getAttribute("tablename"));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.tableexists.JobEntryTableExists jobEntryTableExists = (org.pentaho.di.job.entries.tableexists.JobEntryTableExists) jobEntry;

		DatabaseMeta databaseMeta = jobEntryTableExists.getDatabase();
		e.setAttribute("connection", databaseMeta == null ? "" : databaseMeta.getName());
		e.setAttribute("schemaname", jobEntryTableExists.getSchemaname());
		e.setAttribute("tablename", jobEntryTableExists.getTablename());
		
		return e;
	}


}
