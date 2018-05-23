package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.selectvalues.SelectMetadataChange;
import org.pentaho.di.trans.steps.selectvalues.SelectValuesMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SelectValues")
@Scope("prototype")
public class SelectValues extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		SelectValuesMeta selectValuesMeta = (SelectValuesMeta) stepMetaInterface;
		
		String fields = cell.getAttribute("fields");
		if(StringUtils.hasText(fields)) {
			JSONArray jsonArray = JSONArray.fromObject(fields);
			
			String[] selectName = new String[jsonArray.size()];
			String[] selectRename = new String[jsonArray.size()];
			int[] selectLength = new int[jsonArray.size()];
			int[] selectPrecision = new int[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				
				selectName[i] = jsonObject.optString( "name" );
				selectRename[i] = jsonObject.optString( "rename" );
				selectLength[i] = Const.toInt( jsonObject.optString( "length" ), -2 );
				selectPrecision[i] = Const.toInt( jsonObject.optString( "precision" ), -2 );
			}
			
			selectValuesMeta.setSelectName(selectName);
			selectValuesMeta.setSelectRename(selectRename);
			selectValuesMeta.setSelectLength(selectLength);
			selectValuesMeta.setSelectPrecision(selectPrecision);
		}
		
		selectValuesMeta.setSelectingAndSortingUnspecifiedFields( "Y".equalsIgnoreCase( cell.getAttribute( "select_unspecified" )) );
		
		String remove = cell.getAttribute("remove");
		if(StringUtils.hasText(remove)) {
			JSONArray jsonArray = JSONArray.fromObject(remove);
			String[] deleteName = new String[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				deleteName[i] = jsonObject.optString("name");
			}
			selectValuesMeta.setDeleteName(deleteName);
		}
		
		String meta = cell.getAttribute("meta");
		if(StringUtils.hasText(meta)) {
			JSONArray jsonArray = JSONArray.fromObject(meta);
			
			SelectMetadataChange[] metadata = new SelectMetadataChange[jsonArray.size()];
			for(int i=0; i<jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				SelectMetadataChange selectMetadataChange = new SelectMetadataChange(selectValuesMeta);
				
				selectMetadataChange.setName( jsonObject.optString("name") );
				selectMetadataChange.setRename( jsonObject.optString("rename") );
				selectMetadataChange.setType(ValueMeta.getType( jsonObject.optString("type") ));
				selectMetadataChange.setLength(Const.toInt( jsonObject.optString("length"), -2 ));
				selectMetadataChange.setPrecision(Const.toInt( jsonObject.optString("precision"), -2 ));
				if("Y".equalsIgnoreCase(jsonObject.optString("storage_type")))
					selectMetadataChange.setStorageType(ValueMetaInterface.STORAGE_TYPE_NORMAL);
				selectMetadataChange.setConversionMask( jsonObject.optString("conversion_mask") );
				
				selectMetadataChange.setDateFormatLenient( "Y".equalsIgnoreCase(jsonObject.optString("date_format_lenient")) );
				selectMetadataChange.setDateFormatLocale(jsonObject.optString("date_format_locale"));
				selectMetadataChange.setDateFormatTimeZone(jsonObject.optString("date_format_timezone"));
				selectMetadataChange.setEncoding(jsonObject.optString("encoding"));
				
				selectMetadataChange.setLenientStringToNumber( "Y".equalsIgnoreCase(jsonObject.optString("lenient_string_to_number")) );
				selectMetadataChange.setDecimalSymbol(jsonObject.optString("decimal_symbol"));
				selectMetadataChange.setGroupingSymbol(jsonObject.optString("grouping_symbol"));
				selectMetadataChange.setCurrencySymbol(jsonObject.optString("currency_symbol"));
				
				metadata[i] = selectMetadataChange;
			}
			
			selectValuesMeta.setMeta(metadata);
		}
		
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		SelectValuesMeta selectValuesMeta = (SelectValuesMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		JSONArray jsonArray = new JSONArray();
		if(selectValuesMeta.getSelectName() != null) {
			for ( int i = 0; i < selectValuesMeta.getSelectName().length; i++ ) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", selectValuesMeta.getSelectName()[i]);
				jsonObject.put("rename", selectValuesMeta.getSelectRename()[i]);
				jsonObject.put("length", selectValuesMeta.getSelectLength()[i]);
				jsonObject.put("precision", selectValuesMeta.getSelectPrecision()[i]);
				jsonArray.add(jsonObject);
			}
		}
	    e.setAttribute("fields", jsonArray.toString());
	    
	    e.setAttribute("select_unspecified", selectValuesMeta.isSelectingAndSortingUnspecifiedFields() ? "Y" : "N");
	    
	    jsonArray = new JSONArray();
		if(selectValuesMeta.getDeleteName() != null) {
			for ( int i = 0; i < selectValuesMeta.getDeleteName().length; i++ ) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", selectValuesMeta.getDeleteName()[i]);
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("remove", jsonArray.toString());
	    
		jsonArray = new JSONArray();
		if(selectValuesMeta.getMeta() != null) {
			for ( int i = 0; i < selectValuesMeta.getMeta().length; i++ ) {
				JSONObject jsonObject = new JSONObject();
				SelectMetadataChange selectMetadataChange = selectValuesMeta.getMeta()[i];
				
				jsonObject.put("name", selectMetadataChange.getName());
				jsonObject.put("rename", selectMetadataChange.getRename());
				jsonObject.put("type", ValueMeta.getTypeDesc( selectMetadataChange.getType()));
				jsonObject.put("length", selectMetadataChange.getLength());
				jsonObject.put("precision", selectMetadataChange.getPrecision());
				jsonObject.put("storage_type", selectMetadataChange.getStorageType() == ValueMetaInterface.STORAGE_TYPE_NORMAL ? "Y" : "N");
				jsonObject.put("conversion_mask", selectMetadataChange.getConversionMask());
				
				jsonObject.put("date_format_lenient", selectMetadataChange.isDateFormatLenient() ? "Y" : "N");
				jsonObject.put("date_format_locale", selectMetadataChange.getDateFormatLocale());
				jsonObject.put("date_format_timezone", selectMetadataChange.getDateFormatTimeZone());
				
				jsonObject.put("lenient_string_to_number", selectMetadataChange.isLenientStringToNumber() ? "Y" : "N");
				
				jsonObject.put("encoding", selectMetadataChange.getEncoding());
				jsonObject.put("decimal_symbol", selectMetadataChange.getDecimalSymbol());
				jsonObject.put("grouping_symbol", selectMetadataChange.getGroupingSymbol());
				jsonObject.put("currency_symbol", selectMetadataChange.getCurrencySymbol());
				
				
				
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("meta", jsonArray.toString());
		
		return e;
	}

}
