package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.constant.ConstantMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("Constant")
@Scope("prototype")
public class Constant extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		ConstantMeta constantMeta = (ConstantMeta) stepMetaInterface;
		
		String fields = cell.getAttribute("fields");
		JSONArray jsonArray = JSONArray.fromObject(fields);
		String[] fieldName = new String[jsonArray.size()];
		String[] fieldType = new String[jsonArray.size()];
		String[] fieldFormat = new String[jsonArray.size()];
		String[] currency = new String[jsonArray.size()];
		String[] decimal = new String[jsonArray.size()];
		String[] group = new String[jsonArray.size()];
		String[] nullif = new String[jsonArray.size()];
		int[] fieldLength = new int[jsonArray.size()];
		int[] fieldPrecision = new int[jsonArray.size()];
		boolean[] setEmptyString = new boolean[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			fieldName[i] = jsonObject.optString("name");
			fieldType[i] = jsonObject.optString("type");
			fieldFormat[i] = jsonObject.optString("format");
			currency[i] = jsonObject.optString("currency");
			decimal[i] = jsonObject.optString("decimal");
			group[i] = jsonObject.optString("group");
			nullif[i] = jsonObject.optString("nullif");
			fieldLength[i] = jsonObject.optInt("length", -1);
			fieldPrecision[i] = jsonObject.optInt("precision", -1);
			setEmptyString[i] = "Y".equalsIgnoreCase(jsonObject.optString("set_empty_string"));
		}
		constantMeta.setFieldName(fieldName);
		constantMeta.setFieldType(fieldType);
		constantMeta.setFieldFormat(fieldFormat);
		constantMeta.setCurrency(currency);
		constantMeta.setDecimal(decimal);
		constantMeta.setGroup(group);
		constantMeta.setValue(nullif);
		constantMeta.setFieldLength(fieldLength);
		constantMeta.setFieldPrecision(fieldPrecision);
		constantMeta.setEmptyString(setEmptyString);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		ConstantMeta constantMeta = (ConstantMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		JSONArray jsonArray = new JSONArray();
		String[] fieldName = constantMeta.getFieldName();
		if(fieldName != null) {
			for(int i=0; i<fieldName.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", fieldName[i]);
				jsonObject.put("type", constantMeta.getFieldType()[i]);
				jsonObject.put("format", constantMeta.getFieldFormat()[i]);
				jsonObject.put("currency", constantMeta.getCurrency()[i]);
				jsonObject.put("decimal", constantMeta.getDecimal()[i]);
				jsonObject.put("group", constantMeta.getGroup()[i]);
				jsonObject.put("nullif", constantMeta.getValue()[i]);
				jsonObject.put("length", constantMeta.getFieldLength()[i]);
				jsonObject.put("precision", constantMeta.getFieldPrecision()[i]);
				jsonObject.put("set_empty_string", constantMeta.isSetEmptyString()[i] ? "Y" : "N");
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
	}

}
