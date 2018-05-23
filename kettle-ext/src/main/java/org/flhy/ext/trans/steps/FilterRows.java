package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.ConditionCodec;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Condition;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.errorhandling.StreamInterface;
import org.pentaho.di.trans.steps.filterrows.FilterRowsMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("FilterRows")
@Scope("prototype")
public class FilterRows extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		FilterRowsMeta filterRowsMeta = (FilterRowsMeta) stepMetaInterface;
		
		List<StreamInterface> targetStreams = filterRowsMeta.getStepIOMeta().getTargetStreams();

		targetStreams.get(0).setSubject(cell.getAttribute("send_true_to"));
		targetStreams.get(1).setSubject(cell.getAttribute("send_false_to"));
		
		String conditionString = cell.getAttribute("condition");
		JSONObject jsonObject = JSONObject.fromObject(conditionString);
		filterRowsMeta.setCondition(ConditionCodec.decode(jsonObject));
	}
	
	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		FilterRowsMeta filterRowsMeta = (FilterRowsMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		List<StreamInterface> targetStreams = stepMetaInterface.getStepIOMeta().getTargetStreams();
		e.setAttribute("send_true_to", targetStreams.get( 0 ).getStepname() );
		e.setAttribute("send_false_to", targetStreams.get( 1 ).getStepname() );
		
		Condition condition = filterRowsMeta.getCondition();
		if(condition != null) {
			e.setAttribute("condition", ConditionCodec.encode(condition).toString());
		}
		
		return e;
	}
}
