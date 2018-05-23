package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.addsequence.AddSequenceMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("Sequence")
@Scope("prototype")
public class Sequence extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		AddSequenceMeta addSequenceMeta = (AddSequenceMeta) stepMetaInterface;
		
		addSequenceMeta.setValuename(cell.getAttribute("valuename"));
		addSequenceMeta.setUseDatabase("Y".equalsIgnoreCase(cell.getAttribute("useDatabase")));
		addSequenceMeta.setDatabase(DatabaseMeta.findDatabase( databases, cell.getAttribute("connection")));
		addSequenceMeta.setSchemaName(cell.getAttribute("schema"));
		addSequenceMeta.setSequenceName(cell.getAttribute("seqname"));
		
		addSequenceMeta.setUseCounter("Y".equalsIgnoreCase(cell.getAttribute("use_counter")));
		addSequenceMeta.setCounterName(cell.getAttribute("counter_name"));
		addSequenceMeta.setStartAt(cell.getAttribute("start_at"));
		addSequenceMeta.setIncrementBy(cell.getAttribute("increment_by"));
		addSequenceMeta.setMaxValue(cell.getAttribute("max_value"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		AddSequenceMeta addSequenceMeta = (AddSequenceMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("valuename", addSequenceMeta.getValuename());
		e.setAttribute("use_database", addSequenceMeta.isDatabaseUsed() ? "Y" : "N");
		e.setAttribute("connection", addSequenceMeta.getDatabase() == null ? "" : addSequenceMeta.getDatabase().getName());
		e.setAttribute("schema", addSequenceMeta.getSchemaName());
		e.setAttribute("seqname", addSequenceMeta.getSequenceName());
		
		e.setAttribute("use_counter", addSequenceMeta.isCounterUsed() ? "Y" : "N");
		e.setAttribute("counter_name", addSequenceMeta.getCounterName());
		e.setAttribute("start_at", addSequenceMeta.getStartAt());
		e.setAttribute("increment_by", addSequenceMeta.getIncrementBy());
		e.setAttribute("max_value", addSequenceMeta.getMaxValue());
		
		return e;
	}

}
