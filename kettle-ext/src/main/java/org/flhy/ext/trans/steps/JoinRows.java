package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.ConditionCodec;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.joinrows.JoinRowsMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("JoinRows")
@Scope("prototype")
public class JoinRows extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		JoinRowsMeta joinRowsMeta = (JoinRowsMeta) stepMetaInterface;
		
		joinRowsMeta.setDirectory(cell.getAttribute("directory"));
		joinRowsMeta.setPrefix(cell.getAttribute("prefix"));
		joinRowsMeta.setCacheSize(Const.toInt(cell.getAttribute("cache_size"), -1));
		joinRowsMeta.setMainStepname(cell.getAttribute("main"));
		
		String conditionString = cell.getAttribute("condition");
		JSONObject jsonObject = JSONObject.fromObject(conditionString);
		joinRowsMeta.setCondition(ConditionCodec.decode(jsonObject));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		JoinRowsMeta joinRowsMeta = (JoinRowsMeta) stepMetaInterface;
		
		e.setAttribute("directory", joinRowsMeta.getDirectory());
		e.setAttribute("prefix", joinRowsMeta.getPrefix());
		e.setAttribute("cache_size", joinRowsMeta.getCacheSize() + "");
		e.setAttribute("main", joinRowsMeta.getLookupStepname());
		
		if(joinRowsMeta.getCondition() != null)
			e.setAttribute("condition", ConditionCodec.encode(joinRowsMeta.getCondition()).toString());
		
		return e;
	}

}
