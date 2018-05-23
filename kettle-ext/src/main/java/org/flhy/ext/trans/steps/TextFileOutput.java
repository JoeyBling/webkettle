package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.textfileoutput.TextFileField;
import org.pentaho.di.trans.steps.textfileoutput.TextFileOutputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("TextFileOutput")
@Scope("prototype")
public class TextFileOutput extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		TextFileOutputMeta textFileOutputMeta = (TextFileOutputMeta) stepMetaInterface;
		
		textFileOutputMeta.setFilename(cell.getAttribute("file_name"));
		textFileOutputMeta.setFileAsCommand("Y".equalsIgnoreCase(cell.getAttribute("is_command")));
		textFileOutputMeta.setServletOutput("Y".equalsIgnoreCase(cell.getAttribute("servlet_output")));
		textFileOutputMeta.setCreateParentFolder("Y".equalsIgnoreCase(cell.getAttribute("create_parent_folder")));
		textFileOutputMeta.setDoNotOpenNewFileInit("Y".equalsIgnoreCase(cell.getAttribute("do_not_open_new_file_init")));
		textFileOutputMeta.setFileNameInField("Y".equalsIgnoreCase(cell.getAttribute("fileNameInField")));
		textFileOutputMeta.setFileNameField(cell.getAttribute("fileNameField"));
		textFileOutputMeta.setExtension(cell.getAttribute("extention"));
		textFileOutputMeta.setStepNrInFilename("Y".equalsIgnoreCase(cell.getAttribute("split")));
		textFileOutputMeta.setPartNrInFilename("Y".equalsIgnoreCase(cell.getAttribute("haspartno")));
		textFileOutputMeta.setDateInFilename("Y".equalsIgnoreCase(cell.getAttribute("add_date")));
		textFileOutputMeta.setTimeInFilename("Y".equalsIgnoreCase(cell.getAttribute("add_time")));
		textFileOutputMeta.setSpecifyingFormat("Y".equalsIgnoreCase(cell.getAttribute("SpecifyFormat")));
		textFileOutputMeta.setDateTimeFormat(cell.getAttribute("date_time_format"));
		textFileOutputMeta.setAddToResultFiles("Y".equalsIgnoreCase(cell.getAttribute("add_to_result_filenames")));
		
		textFileOutputMeta.setFileAppended("Y".equalsIgnoreCase(cell.getAttribute("append")));
		textFileOutputMeta.setSeparator(cell.getAttribute("separator"));
		textFileOutputMeta.setEnclosure(cell.getAttribute("enclosure"));
		textFileOutputMeta.setEnclosureForced("Y".equalsIgnoreCase(cell.getAttribute("enclosure_forced")));
		textFileOutputMeta.setEnclosureFixDisabled("Y".equalsIgnoreCase(cell.getAttribute("enclosure_fix_disabled")));
		textFileOutputMeta.setHeaderEnabled("Y".equalsIgnoreCase(cell.getAttribute("header")));
		textFileOutputMeta.setFooterEnabled("Y".equalsIgnoreCase(cell.getAttribute("footer")));
		textFileOutputMeta.setFileFormat(cell.getAttribute("format"));
		textFileOutputMeta.setFileCompression(cell.getAttribute("compression"));
		textFileOutputMeta.setEncoding(cell.getAttribute("encoding"));
		textFileOutputMeta.setPadded("Y".equalsIgnoreCase(cell.getAttribute("pad")));
		textFileOutputMeta.setFastDump("Y".equalsIgnoreCase(cell.getAttribute("fast_dump")));
		textFileOutputMeta.setSplitEvery(Const.toInt(cell.getAttribute("splitevery"), 0));
		textFileOutputMeta.setEndedLine(cell.getAttribute("endedLine"));
		textFileOutputMeta.setNewline(textFileOutputMeta.getNewLine(cell.getAttribute("format")));
		
		String fields = cell.getAttribute("fields");
		JSONArray jsonArray = JSONArray.fromObject(fields);
		TextFileField[] outputFields = new TextFileField[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			TextFileField field = new TextFileField();
	        field.setName( jsonObject.optString("name" ) );
	        field.setType( jsonObject.optString("type" ) );
	        field.setFormat( jsonObject.optString("format" ) );
	        field.setCurrencySymbol( jsonObject.optString("currency" ) );
	        field.setDecimalSymbol( jsonObject.optString("decimal" ) );
	        field.setGroupingSymbol( jsonObject.optString("group" ) );
	        field.setTrimType( ValueMeta.getTrimTypeByCode( jsonObject.optString("trim_type" ) ) );
	        field.setNullString( jsonObject.optString("nullif" ) );
	        field.setLength( Const.toInt( jsonObject.optString("length" ), -1 ) );
	        field.setPrecision( Const.toInt( jsonObject.optString("precision" ), -1 ) );
	        
	        outputFields[i] = field;
		}
		textFileOutputMeta.setOutputFields(outputFields);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		TextFileOutputMeta textFileOutputMeta = (TextFileOutputMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		e.setAttribute("file_name", textFileOutputMeta.getFileName());
		e.setAttribute("is_command", textFileOutputMeta.isFileAsCommand() ? "Y" : "N");
		e.setAttribute("servlet_output", textFileOutputMeta.isServletOutput() ? "Y" : "N");
		e.setAttribute("create_parent_folder", textFileOutputMeta.isCreateParentFolder() ? "Y" : "N");
		e.setAttribute("do_not_open_new_file_init", textFileOutputMeta.isDoNotOpenNewFileInit() ? "Y" : "N");
		e.setAttribute("fileNameInField", textFileOutputMeta.isFileNameInField() ? "Y" : "N");
		e.setAttribute("fileNameField", textFileOutputMeta.getFileNameField());
		e.setAttribute("extention", textFileOutputMeta.getExtension());
		e.setAttribute("split", textFileOutputMeta.isStepNrInFilename() ? "Y" : "N");
		e.setAttribute("haspartno", textFileOutputMeta.isPartNrInFilename() ? "Y" : "N");
		e.setAttribute("add_date", textFileOutputMeta.isDateInFilename() ? "Y" : "N");
		e.setAttribute("add_time", textFileOutputMeta.isTimeInFilename() ? "Y" : "N");
		e.setAttribute("SpecifyFormat", textFileOutputMeta.isSpecifyingFormat() ? "Y" : "N");
		e.setAttribute("date_time_format", textFileOutputMeta.getDateTimeFormat());
		e.setAttribute("add_to_result_filenames", textFileOutputMeta.isAddToResultFiles() ? "Y" : "N");
		
		e.setAttribute("append", textFileOutputMeta.isFileAppended() ? "Y" : "N");
		e.setAttribute("separator", textFileOutputMeta.getSeparator());
		e.setAttribute("enclosure", textFileOutputMeta.getEnclosure());
		e.setAttribute("enclosure_forced", textFileOutputMeta.isEnclosureForced() ? "Y" : "N");
		e.setAttribute("enclosure_fix_disabled", textFileOutputMeta.isEnclosureFixDisabled() ? "Y" : "N");
		e.setAttribute("header", textFileOutputMeta.isHeaderEnabled() ? "Y" : "N");
		e.setAttribute("footer", textFileOutputMeta.isFooterEnabled() ? "Y" : "N");
		e.setAttribute("format", textFileOutputMeta.getFileFormat());
		e.setAttribute("compression", textFileOutputMeta.getFileCompression());
		e.setAttribute("encoding", textFileOutputMeta.getEncoding());
		e.setAttribute("pad", textFileOutputMeta.isPadded() ? "Y" : "N");
		e.setAttribute("fast_dump", textFileOutputMeta.isFastDump() ? "Y" : "N");
		e.setAttribute("splitevery", textFileOutputMeta.getSplitEvery() + "");
		e.setAttribute("endedLine", textFileOutputMeta.getEndedLine());
		
		TextFileField[] outputFields = textFileOutputMeta.getOutputFields();
		if(outputFields != null) {
			JSONArray jsonArray = new JSONArray();
			for(TextFileField field : outputFields) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", field.getName());
				jsonObject.put("type", field.getTypeDesc());
				jsonObject.put("format", field.getFormat());
				jsonObject.put("currencyType", field.getCurrencySymbol());
				jsonObject.put("decimal", field.getDecimalSymbol());
				jsonObject.put("group", field.getGroupingSymbol());
				jsonObject.put("nullif", field.getNullString());
				jsonObject.put("trim_type", field.getTrimTypeDesc());
				if(field.getLength() != -1)
					jsonObject.put("length", field.getLength());
				if(field.getPrecision() != -1)
					jsonObject.put("precision", field.getPrecision());
				
				jsonArray.add(jsonObject);
			}
			e.setAttribute("fields", jsonArray.toString());
		}
		
		return e;
	}

}