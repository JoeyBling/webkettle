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

@Component("DELETE_FILE")
@Scope("prototype")
public class JobEntryDeleteFile extends AbstractJobEntry {
	
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.deletefile.JobEntryDeleteFile jobEntryDeleteFile = (org.pentaho.di.job.entries.deletefile.JobEntryDeleteFile) jobEntry;
		jobEntryDeleteFile.setFilename(cell.getAttribute("filename"));
		jobEntryDeleteFile.setFailIfFileNotExists("Y".equalsIgnoreCase(cell.getAttribute("fail_if_file_exists")));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.deletefile.JobEntryDeleteFile jobEntryDeleteFile = (org.pentaho.di.job.entries.deletefile.JobEntryDeleteFile) jobEntry;
		e.setAttribute("filename", jobEntryDeleteFile.getFilename());
		e.setAttribute("fail_if_file_exists", jobEntryDeleteFile.isFailIfFileNotExists() ? "Y" : "N");
		
		return e;
	}

}
