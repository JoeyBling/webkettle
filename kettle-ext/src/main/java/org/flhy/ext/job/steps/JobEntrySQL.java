package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entries.ftpput.JobEntryFTPPUT;
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

@Component("SQL")
@Scope("prototype")
public class JobEntrySQL extends AbstractJobEntry{
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.sql.JobEntrySQL jobEntrySQL= (org.pentaho.di.job.entries.sql.JobEntrySQL) jobEntry;
		//一般---服务器设置
		jobEntrySQL.setSQL(StringEscapeHelper.decode(cell.getAttribute("sql")));
		String con = cell.getAttribute( "connection" );
		jobEntrySQL.setDatabase(DatabaseMeta.findDatabase( databases, con ));
		jobEntrySQL.setSQLFromFile("Y".equalsIgnoreCase(cell.getAttribute("sqlfromfile")));
		jobEntrySQL.setSQLFilename(cell.getAttribute("sqlfilename"));
		jobEntrySQL.setSendOneStatement("Y".equalsIgnoreCase(cell.getAttribute("sendOneStatement")));
		jobEntrySQL.setUseVariableSubstitution("Y".equalsIgnoreCase(cell.getAttribute("useVariableSubstitution")));

	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception    {
		org.pentaho.di.job.entries.sql.JobEntrySQL jobEntrySQL = (org.pentaho.di.job.entries.sql.JobEntrySQL) jobEntry;

		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		//一般---服务器设置
		e.setAttribute("sql", StringEscapeHelper.encode(jobEntrySQL.getSQL()));
		e.setAttribute("connection",  jobEntrySQL.getDatabase() == null ? "" : jobEntrySQL.getDatabase().getName());
		e.setAttribute("sqlfromfile", jobEntrySQL.getSQLFromFile()  ? "Y" : "N");
		e.setAttribute("sqlfilename", jobEntrySQL.getSQLFilename());
		e.setAttribute("sendOneStatement", jobEntrySQL.isSendOneStatement() ? "Y" : "N");
		e.setAttribute("useVariableSubstitution", jobEntrySQL.getUseVariableSubstitution()  ? "Y" : "N");
		return e;
	}

	

}
