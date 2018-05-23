package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("DELAY")
@Scope("prototype")
public class JobEntryDelay extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.delay.JobEntryDelay jobEntryDelay = (org.pentaho.di.job.entries.delay.JobEntryDelay) jobEntry;
		
		jobEntryDelay.setMaximumTimeout(cell.getAttribute("maximumTimeout"));
		jobEntryDelay.setScaleTime(Const.toInt(cell.getAttribute("scaletime"), 0));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		org.pentaho.di.job.entries.delay.JobEntryDelay jobEntryDelay = (org.pentaho.di.job.entries.delay.JobEntryDelay) jobEntry;
		
		e.setAttribute("maximumTimeout", jobEntryDelay.getMaximumTimeout());
		e.setAttribute("scaletime", jobEntryDelay.getScaleTime() + "");
		
		return e;
	}


}
