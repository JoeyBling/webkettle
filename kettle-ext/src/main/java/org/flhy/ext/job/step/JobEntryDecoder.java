package org.flhy.ext.job.step;

import com.mxgraph.model.mxCell;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.metastore.api.IMetaStore;

import java.util.List;

public interface JobEntryDecoder {

	public JobEntryCopy decodeStep(mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception;
	
}
