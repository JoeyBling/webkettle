package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.rowgenerator.RowGeneratorMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("RowGenerator")
@Scope("prototype")
public class RowGenerator extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		RowGeneratorMeta rowGeneratorMeta = (RowGeneratorMeta) stepMetaInterface;
		
		rowGeneratorMeta.setIntervalInMs(cell.getAttribute("intervalInMs"));
		rowGeneratorMeta.setRowLimit(cell.getAttribute("rowLimit"));
		rowGeneratorMeta.setRowTimeField(cell.getAttribute("rowTimeField"));
		rowGeneratorMeta.setLastTimeField(cell.getAttribute("lastTimeField"));
		rowGeneratorMeta.setNeverEnding("Y".equalsIgnoreCase(cell.getAttribute("neverEnding")));
		
		String fields = cell.getAttribute("fields");
		JSONArray jsonArray = JSONArray.fromObject(fields);
		String[] fieldName = new String[jsonArray.size()];
		String[] fieldType = new String[jsonArray.size()];
		String[] fieldFormat = new String[jsonArray.size()];
		String[] currency = new String[jsonArray.size()];
		String[] decimal = new String[jsonArray.size()];
		String[] group = new String[jsonArray.size()];
		String[] value = new String[jsonArray.size()];
		int[] fieldLength = new int[jsonArray.size()];
		int[] fieldPrecision = new int[jsonArray.size()];
		boolean[] setEmptyString = new boolean[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			fieldName[i] = jsonObject.optString("name");
			fieldType[i] = jsonObject.optString("type");
			fieldFormat[i] = jsonObject.optString("format");
			currency[i] = jsonObject.optString("currencyType");
			decimal[i] = jsonObject.optString("decimal");
			group[i] = jsonObject.optString("group");
			value[i] = jsonObject.optString("value");
			fieldLength[i] = jsonObject.optInt("length", -1);
			fieldPrecision[i] = jsonObject.optInt("precision", -1);
			setEmptyString[i] = jsonObject.optBoolean("nullable");
		}
		rowGeneratorMeta.setFieldName(fieldName);
		rowGeneratorMeta.setFieldType(fieldType);
		rowGeneratorMeta.setFieldFormat(fieldFormat);
		rowGeneratorMeta.setCurrency(currency);
		rowGeneratorMeta.setDecimal(decimal);
		rowGeneratorMeta.setGroup(group);
		rowGeneratorMeta.setValue(value);
		rowGeneratorMeta.setFieldLength(fieldLength);
		rowGeneratorMeta.setFieldPrecision(fieldPrecision);
		rowGeneratorMeta.setSetEmptyString(setEmptyString);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		RowGeneratorMeta rowGeneratorMeta = (RowGeneratorMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		e.setAttribute("intervalInMs", rowGeneratorMeta.getIntervalInMs());
		e.setAttribute("rowLimit", rowGeneratorMeta.getRowLimit());
		e.setAttribute("rowTimeField", rowGeneratorMeta.getRowTimeField());
		e.setAttribute("lastTimeField", rowGeneratorMeta.getLastTimeField());
		e.setAttribute("neverEnding", rowGeneratorMeta.isNeverEnding() ? "Y" : "N");
		
		JSONArray jsonArray = new JSONArray();
		String[] fieldName = rowGeneratorMeta.getFieldName();
		String[] fieldType = rowGeneratorMeta.getFieldType();
		String[] fieldFormat = rowGeneratorMeta.getFieldFormat();
		String[] currency = rowGeneratorMeta.getCurrency();
		String[] decimal = rowGeneratorMeta.getDecimal();
		String[] group = rowGeneratorMeta.getGroup();
		String[] value = rowGeneratorMeta.getValue();
		int[] fieldLength = rowGeneratorMeta.getFieldLength();
		int[] fieldPrecision = rowGeneratorMeta.getFieldPrecision();
		boolean[] setEmptyString = rowGeneratorMeta.getSetEmptyString();
		for(int j=0; j<fieldName.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", fieldName[j]);
			jsonObject.put("type", fieldType[j]);
			jsonObject.put("format", fieldFormat[j]);
			jsonObject.put("currencyType", currency[j]);
			jsonObject.put("decimal", decimal[j]);
			jsonObject.put("group", group[j]);
			jsonObject.put("value", value[j]);
			if(fieldLength[j] != -1)
				jsonObject.put("length", fieldLength[j]);
			if(fieldPrecision[j] != -1)
				jsonObject.put("precision", fieldPrecision[j]);
			jsonObject.put("nullable", setEmptyString[j]);
			jsonArray.add(jsonObject);
		}
		
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
	}

	
}
