package org.flhy.ext.trans.steps;

import java.util.ArrayList;
import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.datagrid.DataGridMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("DataGrid")
@Scope("prototype")
public class DataGrid extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		DataGridMeta dataGridMeta = (DataGridMeta) stepMetaInterface;
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("fields"));
		String[] fieldName = new String[jsonArray.size()];
		String[] fieldType = new String[jsonArray.size()];
		String[] fieldFormat = new String[jsonArray.size()];
		String[] currency = new String[jsonArray.size()];
		String[] decimal = new String[jsonArray.size()];
		String[] group = new String[jsonArray.size()];
		int[] length = new int[jsonArray.size()];
		int[] precision = new int[jsonArray.size()];
		boolean[] setEmptyString = new boolean[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			fieldName[i] = jsonObject.optString("name");
			fieldType[i] = jsonObject.optString("type");
			fieldFormat[i] = jsonObject.optString("format");
			currency[i] = jsonObject.optString("currencyType");
			decimal[i] = jsonObject.optString("decimal");
			group[i] = jsonObject.optString("group");
			length[i] = jsonObject.optInt("length", -1);
			precision[i] = jsonObject.optInt("precision", -1);
			setEmptyString[i] = "Y".equalsIgnoreCase(jsonObject.optString("nullable"));
		}
		dataGridMeta.setFieldName(fieldName);
		dataGridMeta.setFieldType(fieldType);
		dataGridMeta.setFieldFormat(fieldFormat);
		dataGridMeta.setCurrency(currency);
		dataGridMeta.setDecimal(decimal);
		dataGridMeta.setGroup(group);
		dataGridMeta.setFieldLength(length);
		dataGridMeta.setFieldPrecision(precision);
		dataGridMeta.setEmptyString(setEmptyString);

		ArrayList<List<String>> dataLines = new ArrayList<List<String>>();
		jsonArray = JSONArray.fromObject(cell.getAttribute("data"));
		for (int i = 0; i < jsonArray.size(); i++) {
			ArrayList<String> dataLine = new ArrayList<String>();
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			
			for(int j=0; j<fieldName.length; j++)
				dataLine.add(jsonObject.optString(fieldName[j]));
			
			dataLines.add(dataLine);
		}
		dataGridMeta.setDataLines(dataLines);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		DataGridMeta dataGridMeta = (DataGridMeta) stepMetaInterface;
		
		JSONArray jsonArray1 = new JSONArray();
		
		String[] fieldName = dataGridMeta.getFieldName();
		String[] fieldType = dataGridMeta.getFieldType();
		String[] fieldFormat = dataGridMeta.getFieldFormat();
		String[] currency = dataGridMeta.getCurrency();
		String[] decimal = dataGridMeta.getDecimal();
		String[] group = dataGridMeta.getGroup();
		int[] length = dataGridMeta.getFieldLength();
		int[] precision = dataGridMeta.getFieldPrecision();
		boolean[] setEmptyString = dataGridMeta.isSetEmptyString();
		
		for(int j=0; j<fieldName.length; j++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", fieldName[j]);
			jsonObject.put("type", fieldType[j]);
			jsonObject.put("format", fieldFormat[j]);
			jsonObject.put("currencyType", currency[j]);
			jsonObject.put("decimal", decimal[j]);
			jsonObject.put("group", group[j]);
			if(length[j] != -1)
				jsonObject.put("length", length[j]);
			if(precision[j] != -1)
				jsonObject.put("precision", precision[j]);
			jsonObject.put("nullable", setEmptyString[j] ? "Y" : "N");
			jsonArray1.add(jsonObject);
		}
		e.setAttribute("fields", jsonArray1.toString());
		
		JSONArray jsonArray2 = new JSONArray();
		for(List<String> dataLine : dataGridMeta.getDataLines()) {
			JSONObject jsonObject = new JSONObject();
			for(int i=0; i<fieldName.length; i++)
				jsonObject.put(fieldName[i], dataLine.get(i));
			jsonArray2.add(jsonObject);
		}
		e.setAttribute("data", jsonArray2.toString());
		
		return e;
	}

}
