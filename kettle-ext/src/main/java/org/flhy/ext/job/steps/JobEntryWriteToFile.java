package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("WRITE_TO_FILE")
@Scope("prototype")
public class JobEntryWriteToFile extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.writetofile.JobEntryWriteToFile jobEntryWriteToFile = (org.pentaho.di.job.entries.writetofile.JobEntryWriteToFile) jobEntry;
		jobEntryWriteToFile.setFilename(cell.getAttribute("filename"));
		jobEntryWriteToFile.setCreateParentFolder("Y".equalsIgnoreCase(cell.getAttribute("createParentFolder")));
		jobEntryWriteToFile.setAppendFile("Y".equalsIgnoreCase(cell.getAttribute("appendFile")));
		jobEntryWriteToFile.setEncoding(cell.getAttribute("encoding"));
		jobEntryWriteToFile.setContent(StringEscapeHelper.decode(cell.getAttribute("content")));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.writetofile.JobEntryWriteToFile jobEntryWriteToFile = (org.pentaho.di.job.entries.writetofile.JobEntryWriteToFile) jobEntry;
		e.setAttribute("filename", jobEntryWriteToFile.getFilename());
		e.setAttribute("createParentFolder", jobEntryWriteToFile.isCreateParentFolder() ? "Y" : "N");
		e.setAttribute("appendFile", jobEntryWriteToFile.isAppendFile() ? "Y" : "N");
		e.setAttribute("encoding", jobEntryWriteToFile.getEncoding());
		e.setAttribute("content", StringEscapeHelper.encode(jobEntryWriteToFile.getContent()));
		return e;
	}


}