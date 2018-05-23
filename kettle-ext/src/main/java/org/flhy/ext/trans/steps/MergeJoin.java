package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.errorhandling.StreamInterface;
import org.pentaho.di.trans.steps.mergejoin.MergeJoinMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("MergeJoin")
@Scope("prototype")
public class MergeJoin extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		MergeJoinMeta mergeJoinMeta = (MergeJoinMeta) stepMetaInterface;
		
		List<StreamInterface> infoStreams = mergeJoinMeta.getStepIOMeta().getInfoStreams();
		StreamInterface referenceStream = infoStreams.get(0);
		StreamInterface compareStream = infoStreams.get(1);

		compareStream.setSubject(cell.getAttribute("step1"));
		referenceStream.setSubject(cell.getAttribute("step2"));
		
		mergeJoinMeta.setJoinType(cell.getAttribute("join_type"));
		
		String key1 = cell.getAttribute("key1");
		JSONArray jsonArray = JSONArray.fromObject(key1);
		String[] keyFields1 = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			keyFields1[i] = jsonObject.optString("key");
		}
		mergeJoinMeta.setKeyFields1(keyFields1);
		
		String key2 = cell.getAttribute("key2");
		jsonArray = JSONArray.fromObject(key2);
		String[] keyFields2 = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			keyFields2[i] = jsonObject.optString("key");
		}
		mergeJoinMeta.setKeyFields2(keyFields2);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		MergeJoinMeta mergeJoinMeta = (MergeJoinMeta) stepMetaInterface;
		
		e.setAttribute("join_type", mergeJoinMeta.getJoinType());
		List<StreamInterface> infoStreams = mergeJoinMeta.getStepIOMeta().getInfoStreams();
		e.setAttribute("step1", infoStreams.get(0).getStepname());
		e.setAttribute("step2", infoStreams.get(1).getStepname());
		
		JSONArray jsonArray = new JSONArray();
		String[] keyFields1 = mergeJoinMeta.getKeyFields1();
		for(int j=0; j<keyFields1.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("key", keyFields1[j]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("key1", jsonArray.toString());
		
		jsonArray = new JSONArray();
		String[] keyFields2 = mergeJoinMeta.getKeyFields2();
		for(int j=0; j<keyFields2.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("key", keyFields2[j]);
			jsonArray.add(jsonObject);
		}
		e.setAttribute("key2", jsonArray.toString());
		
		return e;
	}

}
