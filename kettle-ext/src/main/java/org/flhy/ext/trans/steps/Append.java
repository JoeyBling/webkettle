package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.errorhandling.StreamInterface;
import org.pentaho.di.trans.steps.append.AppendMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("Append")
@Scope("prototype")
public class Append extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		AppendMeta appendMeta = (AppendMeta) stepMetaInterface;
		
		List<StreamInterface> infoStreams = appendMeta.getStepIOMeta().getInfoStreams();
		StreamInterface headStream = infoStreams.get(0);
		StreamInterface tailStream = infoStreams.get(1);
		
		headStream.setSubject(cell.getAttribute("head_name"));
		tailStream.setSubject(cell.getAttribute("tail_name"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		AppendMeta appendMeta = (AppendMeta) stepMetaInterface;
		
		List<StreamInterface> infoStreams = appendMeta.getStepIOMeta().getInfoStreams();
		e.setAttribute("head_name", infoStreams.get(0).getStepname());
		e.setAttribute("tail_name", infoStreams.get(1).getStepname());
		
		return e;
	}

}
