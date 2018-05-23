package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.samplerows.SampleRowsMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SampleRows")
@Scope("prototype")
public class SampleRows extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		SampleRowsMeta sampleRowsMeta = (SampleRowsMeta) stepMetaInterface;
		sampleRowsMeta.setLinesRange(cell.getAttribute("linesrange"));
		sampleRowsMeta.setLineNumberField(cell.getAttribute("linenumfield"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		SampleRowsMeta sampleRowsMeta = (SampleRowsMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("linesrange", sampleRowsMeta.getLinesRange());
		e.setAttribute("linenumfield", sampleRowsMeta.getLineNumberField());
		
		return e;
	}

}