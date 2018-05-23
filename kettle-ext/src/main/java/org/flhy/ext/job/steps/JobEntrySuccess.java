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

@Component("SUCCESS")
@Scope("prototype")
public class JobEntrySuccess extends AbstractJobEntry{

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore)
			throws Exception {
		// TODO Auto-generated method stub
		org.pentaho.di.job.entries.success.JobEntrySuccess jobEntrySuccess = (org.pentaho.di.job.entries.success.JobEntrySuccess) jobEntry;
	
		jobEntrySuccess.setName(cell.getAttribute("name"));
		
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		// TODO Auto-generated method stub
		org.pentaho.di.job.entries.success.JobEntrySuccess jobEntrySuccess =(org.pentaho.di.job.entries.success.JobEntrySuccess)jobEntry;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		e.setAttribute("name", jobEntrySuccess.getName());
		return e;
	}
	

}
