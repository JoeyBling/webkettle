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

@Component("EVAL")
@Scope("prototype")
public class JobEntryEval extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.eval.JobEntryEval jobEntryEval = (org.pentaho.di.job.entries.eval.JobEntryEval) jobEntry;
		jobEntryEval.setScript(StringEscapeHelper.decode( cell.getAttribute("script") ));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.eval.JobEntryEval jobEntryEval = (org.pentaho.di.job.entries.eval.JobEntryEval) jobEntry;
		e.setAttribute("script", StringEscapeHelper.encode(jobEntryEval.getScript()));
		return e;
	}


}
