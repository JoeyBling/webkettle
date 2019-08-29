package org.flhy.ext.trans.step;

import com.mxgraph.model.mxCell;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.metastore.api.IMetaStore;

import java.util.List;

public interface StepDecoder {

	public StepMeta decodeStep(mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception;
	
}
