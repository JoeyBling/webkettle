package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.setvariable.SetVariableMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SetVariable")
@Scope("prototype")
public class SetVariable extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		SetVariableMeta setVariableMeta = (SetVariableMeta) stepMetaInterface;
		
		String fields = cell.getAttribute("fields");
		JSONArray jsonArray = JSONArray.fromObject(fields);
		String[] fieldName = new String[jsonArray.size()];
		String[] variableName = new String[jsonArray.size()];
		int[] variableType = new int[jsonArray.size()];
		String[] defaultValue = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			fieldName[i] = jsonObject.optString("field_name");
			variableName[i] = jsonObject.optString("variable_name");
			variableType[i] = SetVariableMeta.getVariableType(jsonObject.optString("variable_type"));
			defaultValue[i] = jsonObject.optString("default_value");
		}
		setVariableMeta.setFieldName(fieldName);
		setVariableMeta.setVariableName(variableName);
		setVariableMeta.setVariableType(variableType);
		setVariableMeta.setDefaultValue(defaultValue);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		SetVariableMeta setVariableMeta = (SetVariableMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		JSONArray jsonArray = new JSONArray();
		String[] fieldName = setVariableMeta.getFieldName();
		if(fieldName != null) {
			for(int i=0; i<fieldName.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("field_name", fieldName[i]);
				jsonObject.put("variable_name", setVariableMeta.getVariableName()[i]);
				jsonObject.put("variable_type", SetVariableMeta.getVariableTypeCode(setVariableMeta.getVariableType()[i]));
				jsonObject.put("default_value", setVariableMeta.getDefaultValue()[i]);
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
	}

}
