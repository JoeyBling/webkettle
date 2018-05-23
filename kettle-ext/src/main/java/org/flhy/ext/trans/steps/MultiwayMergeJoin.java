package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.trans.step.StepIOMetaInterface;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.errorhandling.Stream;
import org.pentaho.di.trans.step.errorhandling.StreamIcon;
import org.pentaho.di.trans.step.errorhandling.StreamInterface;
import org.pentaho.di.trans.step.errorhandling.StreamInterface.StreamType;
import org.pentaho.di.trans.steps.multimerge.MultiMergeJoinMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("MultiwayMergeJoin")
@Scope("prototype")
public class MultiwayMergeJoin extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		MultiMergeJoinMeta mergeJoinMeta = (MultiMergeJoinMeta) stepMetaInterface;
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("keys"));
		String[] keyFields = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++)
			keyFields[i] = jsonArray.getString(i);
		mergeJoinMeta.setKeyFields(keyFields);
		
		StepIOMetaInterface stepIOMeta = mergeJoinMeta.getStepIOMeta();
		jsonArray = JSONArray.fromObject(cell.getAttribute("stepnames"));
		for(int i=0; i<jsonArray.size(); i++) {
			stepIOMeta.addStream(new Stream( StreamType.INFO, null, BaseMessages.getString(MultiMergeJoinMeta.class, "MultiMergeJoin.InfoStream.Description" ), StreamIcon.INFO, null ) );
		}
		
		String[] inputSteps = new String[jsonArray.size()];
		List<StreamInterface> infoStreams = stepIOMeta.getInfoStreams();
		for (int i = 0; i < infoStreams.size(); i++) {
			infoStreams.get(i).setSubject(jsonArray.getString(i));
			inputSteps[i] = jsonArray.getString(i);
		}
		mergeJoinMeta.setInputSteps(inputSteps);
		
		mergeJoinMeta.setJoinType(cell.getAttribute("join_type"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		MultiMergeJoinMeta mergeJoinMeta = (MultiMergeJoinMeta) stepMetaInterface;
		
		e.setAttribute("join_type", mergeJoinMeta.getJoinType());
		
		JSONArray jsonArray = new JSONArray();
		List<StreamInterface> infoStreams = mergeJoinMeta.getStepIOMeta().getInfoStreams();
		for (int i = 0; i < infoStreams.size(); i++) {
			jsonArray.add(infoStreams.get(i).getStepname());
		}
		e.setAttribute("stepnames", jsonArray.toString());
		
		jsonArray = new JSONArray();
		String[] keyFields = mergeJoinMeta.getKeyFields();
		for (int i = 0; i < keyFields.length; i++) {
			jsonArray.add(keyFields[i]);
		}
		e.setAttribute("keys", jsonArray.toString());
		
		return e;
	}

}
