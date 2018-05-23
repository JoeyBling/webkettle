package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.jsoninput.JsonInputField;
import org.pentaho.di.trans.steps.jsoninput.JsonInputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("JsonInput")
@Scope("prototype")
public class JsonInput extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		JsonInputMeta jsonInputMeta = (JsonInputMeta) stepMetaInterface;
		
		jsonInputMeta.setIncludeFilename( "Y".equalsIgnoreCase( cell.getAttribute( "include" )) );
		jsonInputMeta.setFilenameField( cell.getAttribute( "include_field" ) );
		jsonInputMeta.setAddResultFile( "Y".equalsIgnoreCase( cell.getAttribute( "addresultfile" )) );
		jsonInputMeta.setReadUrl( "Y".equalsIgnoreCase( cell.getAttribute( "readurl" )) );
		jsonInputMeta.setIgnoreEmptyFile( "Y".equalsIgnoreCase( cell.getAttribute( "IsIgnoreEmptyFile" )) );
		jsonInputMeta.setIgnoreMissingPath( "Y".equalsIgnoreCase( cell.getAttribute( "ignoreMissingPath" )) );
		
		jsonInputMeta.setdoNotFailIfNoFile( "Y".equalsIgnoreCase( cell.getAttribute( "doNotFailIfNoFile" )) );
		jsonInputMeta.setIncludeRowNumber( "Y".equalsIgnoreCase( cell.getAttribute( "rownum" )) );
		jsonInputMeta.setRowNumberField( cell.getAttribute( "rownum_field" ) );
		
		String file = cell.getAttribute("file");
		String fields = cell.getAttribute("fields");
		JSONArray fileArray = StringUtils.hasText(file) ? JSONArray.fromObject(file) : new JSONArray();
		JSONArray fieldsArray = StringUtils.hasText(fields) ? JSONArray.fromObject(fields) : new JSONArray();
		jsonInputMeta.allocate(fileArray.size(), fieldsArray.size());
			
		String[] fileName = new String[fileArray.size()];
		String[] fileMask = new String[fileArray.size()];
		String[] excludeFileMask = new String[fileArray.size()];
		String[] fileRequired = new String[fileArray.size()];
		String[] includeSubFolders = new String[fileArray.size()];
		for(int i=0; i<fileArray.size(); i++) {
			JSONObject jsonObject = fileArray.getJSONObject(i);
			
			fileName[i] = jsonObject.optString( "name" );
	        fileMask[i] = jsonObject.optString( "filemask" );
	        excludeFileMask[i] = jsonObject.optString( "exclude_filemask" );
	        fileRequired[i] = "Y".equalsIgnoreCase(jsonObject.optString( "file_required" )) ? JsonInputMeta.RequiredFilesDesc[1] : JsonInputMeta.RequiredFilesDesc[0];
	        includeSubFolders[i] = "Y".equalsIgnoreCase(jsonObject.optString( "include_subfolders" )) ? JsonInputMeta.RequiredFilesDesc[1] : JsonInputMeta.RequiredFilesDesc[0];
		}
		
		jsonInputMeta.setFileName(fileName);
		jsonInputMeta.setFileMask(fileMask);
		jsonInputMeta.setExcludeFileMask(excludeFileMask);
		jsonInputMeta.setFileRequired(fileRequired);
		jsonInputMeta.setIncludeSubFolders(includeSubFolders);
		
		JsonInputField[] inputFields = new JsonInputField[fieldsArray.size()];
		for(int i=0; i<fieldsArray.size(); i++) {
			JSONObject jsonObject = fieldsArray.getJSONObject(i);
			
			JsonInputField jsonInputField = new JsonInputField();
			jsonInputField.setName( jsonObject.optString( "name" ) );
			jsonInputField.setPath( jsonObject.optString( "path" ) );
			jsonInputField.setType( ValueMeta.getType( jsonObject.optString( "type" ) ) );
			jsonInputField.setFormat( jsonObject.optString( "format" ) );
			jsonInputField.setCurrencySymbol( jsonObject.optString( "currency" ) );
			jsonInputField.setDecimalSymbol( jsonObject.optString( "decimal" ) );
			jsonInputField.setGroupSymbol( jsonObject.optString( "group" ) );
			jsonInputField.setLength( Const.toInt( jsonObject.optString( "length" ), -1 ) );
			jsonInputField.setPrecision( Const.toInt( jsonObject.optString( "precision" ), -1 ) );
			jsonInputField.setTrimType( JsonInputField.getTrimTypeByCode( jsonObject.optString( "trim_type" ) ) );
			jsonInputField.setRepeated( !"N".equalsIgnoreCase( jsonObject.optString( "repeat" ) ) );
			
			inputFields[i] = jsonInputField;
		}
		jsonInputMeta.setInputFields(inputFields);

	    jsonInputMeta.setRowLimit(Const.toLong( cell.getAttribute( "limit" ), 0L ));

	    jsonInputMeta.setInFields( "Y".equalsIgnoreCase(cell.getAttribute("IsInFields")) );
	    jsonInputMeta.setIsAFile( "Y".equalsIgnoreCase(cell.getAttribute("IsAFile")) );
	    jsonInputMeta.setFieldValue( cell.getAttribute("valueField") );
	    jsonInputMeta.setShortFileNameField( cell.getAttribute("shortFileFieldName") );
	    jsonInputMeta.setPathField( cell.getAttribute("pathFieldName") );
	    jsonInputMeta.setIsHiddenField( cell.getAttribute("hiddenFieldName") );
	    jsonInputMeta.setLastModificationDateField( cell.getAttribute("lastModificationTimeFieldName") );
	    jsonInputMeta.setUriField( cell.getAttribute("uriNameFieldName") );
	    jsonInputMeta.setRootUriField( cell.getAttribute("rootUriNameFieldName") );
	    jsonInputMeta.setExtensionField( cell.getAttribute("extensionFieldName") );
	    jsonInputMeta.setSizeField( cell.getAttribute("sizeFieldName") );
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		JsonInputMeta jsonInputMeta = (JsonInputMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("include", jsonInputMeta.includeFilename() ? "Y" : "N");
		e.setAttribute("include_field", jsonInputMeta.getFilenameField());
		e.setAttribute("rownum", jsonInputMeta.includeRowNumber() ? "Y" : "N");
		e.setAttribute("addresultfile", jsonInputMeta.addResultFile() ? "Y" : "N");
		e.setAttribute("readurl", jsonInputMeta.isReadUrl() ? "Y" : "N");
		
		e.setAttribute("IsIgnoreEmptyFile", jsonInputMeta.isIgnoreEmptyFile() ? "Y" : "N");
		e.setAttribute("doNotFailIfNoFile", jsonInputMeta.isdoNotFailIfNoFile() ? "Y" : "N");
		e.setAttribute("ignoreMissingPath", jsonInputMeta.isIgnoreMissingPath() ? "Y" : "N");
		e.setAttribute("rownum_field", jsonInputMeta.getRowNumberField());
		
		JSONArray jsonArray = new JSONArray();
		if(jsonInputMeta.getFileName() != null) {
			for ( int i = 0; i < jsonInputMeta.getFileName().length; i++ ) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jsonInputMeta.getFileName()[i]);
				jsonObject.put("filemask", jsonInputMeta.getFileMask()[i]);
				jsonObject.put("exclude_filemask", jsonInputMeta.getExludeFileMask()[i]);
				jsonObject.put("file_required", jsonInputMeta.getFileRequired()[i]);
				jsonObject.put("include_subfolders", jsonInputMeta.getIncludeSubFolders()[i]);
				jsonArray.add(jsonObject);
			}
		}
	    e.setAttribute("file", jsonArray.toString());
	    
	    jsonArray = new JSONArray();
		if(jsonInputMeta.getInputFields() != null) {
			for ( int i = 0; i < jsonInputMeta.getInputFields().length; i++ ) {
				JSONObject jsonObject = new JSONObject();
				JsonInputField jsonInputField = jsonInputMeta.getInputFields()[i];
				
				jsonObject.put("name", jsonInputField.getName());
				jsonObject.put("path", jsonInputField.getPath());
				jsonObject.put("type", jsonInputField.getTypeDesc());
				jsonObject.put("format", jsonInputField.getFormat());
				jsonObject.put("currency", jsonInputField.getCurrencySymbol());
				jsonObject.put("decimal", jsonInputField.getDecimalSymbol());
				jsonObject.put("group", jsonInputField.getGroupSymbol());
				jsonObject.put("length", jsonInputField.getLength());
				jsonObject.put("precision", jsonInputField.getPrecision());
				jsonObject.put("trim_type", jsonInputField.getTrimTypeCode());
				jsonObject.put("repeat", jsonInputField.isRepeated() ? "Y" : "N");
				
				jsonArray.add(jsonObject);
			}
		}
	    e.setAttribute("fields", jsonArray.toString());
	    
	    
	    e.setAttribute("limit", String.valueOf(jsonInputMeta.getRowLimit()));
		e.setAttribute("IsInFields", jsonInputMeta.isInFields() ? "Y" : "N");
		e.setAttribute("IsAFile", jsonInputMeta.getIsAFile() ? "Y" : "N");
		e.setAttribute("valueField", jsonInputMeta.getFieldValue());

		e.setAttribute("shortFileFieldName", jsonInputMeta.getShortFileNameField());
		e.setAttribute("pathFieldName", jsonInputMeta.getPathField());
		e.setAttribute("hiddenFieldName", jsonInputMeta.isHiddenField());
		e.setAttribute("lastModificationTimeFieldName", jsonInputMeta.getLastModificationDateField());
		
		e.setAttribute("uriNameFieldName", jsonInputMeta.getUriField());
		e.setAttribute("rootUriNameFieldName", jsonInputMeta.getRootUriField());
		e.setAttribute("extensionFieldName", jsonInputMeta.getExtensionField());
		e.setAttribute("sizeFieldName", jsonInputMeta.getSizeField());

		return e;
	}

}
