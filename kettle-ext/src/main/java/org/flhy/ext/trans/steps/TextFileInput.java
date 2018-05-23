package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.util.EnvUtil;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.fileinput.text.TextFileFilter;
import org.pentaho.di.trans.steps.fileinput.text.TextFileInputMeta;
import org.pentaho.di.trans.steps.fileinput.BaseFileInputField;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;


@Component("TextFileInput")
@Scope("prototype")
public class TextFileInput  extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		TextFileInputMeta textFileInputMeta = (TextFileInputMeta) stepMetaInterface;
		
		String fileName = cell.getAttribute("fileName");
		JSONArray jsonArray = JSONArray.fromObject(fileName);
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			textFileInputMeta.inputFiles.fileName[i] = jsonObject.optString("fileName" );
			textFileInputMeta.inputFiles.fileMask[i] = jsonObject.optString("filemask") ;
			textFileInputMeta.inputFiles.excludeFileMask[i] = jsonObject.optString("excludeFileMask") ;
			textFileInputMeta.inputFiles.fileRequired[i] = jsonObject.optString("fileRequired") ;
			textFileInputMeta.inputFiles.includeSubFolders[i] = jsonObject.optString("includeSubFolders"  );
		}
		
		String filter = cell.getAttribute("filter");
		JSONArray filterjsonArray = JSONArray.fromObject(filter);
		TextFileFilter[] filterFields = new TextFileFilter[filterjsonArray.size()];
		for(int i=0; i<filterjsonArray.size(); i++) {
			JSONObject jsonObject = filterjsonArray.getJSONObject(i);
			TextFileFilter filterField = new TextFileFilter();
			filterField.setFilterString( jsonObject.optString("filterString" ) );
			filterField.setFilterPosition( Const.toInt(jsonObject.optString("filterPosition" ),0) );
			filterField.setFilterLastLine("Y".equalsIgnoreCase( jsonObject.optString("filterLastLine" ) ));
			filterField.setFilterPositive( "Y".equalsIgnoreCase(jsonObject.optString("filterPositive" ) ));
	        filterFields[i] = filterField;
		}
		textFileInputMeta.setFilter(filterFields);
		
		String fields = cell.getAttribute("inputFields");
        JSONArray fieldsjsonArray = JSONArray.fromObject(fields);
        BaseFileInputField[] filefields = new BaseFileInputField[fieldsjsonArray.size()];
		for(int i=0; i<fieldsjsonArray.size(); i++) {
			JSONObject jsonObject = fieldsjsonArray.getJSONObject(i);
			BaseFileInputField field = new BaseFileInputField();

			field.setName( jsonObject.optString("name" ) );
			field.setType( Const.toInt(jsonObject.optString("type" ),0) );
			field.setFormat( jsonObject.optString("format" ) );
			field.setPosition( Const.toInt(jsonObject.optString("position" ),0) );
			field.setLength( Const.toInt(jsonObject.optString("length" ),-1) );
			field.setPrecision( Const.toInt(jsonObject.optString("precision" ),-1) );
			field.setCurrencySymbol( jsonObject.optString("currency" ));
			field.setDecimalSymbol( jsonObject.optString("decimal" ) );
			field.setGroupSymbol( jsonObject.optString("group" ));
			field.setTrimType( Const.toInt(jsonObject.optString("trim_type" ),0) );
			field.setNullString( jsonObject.optString("nullif" ));
			field.setIfNullValue( jsonObject.optString("ifnull" ));
			field.setRepeated( "Y".equalsIgnoreCase(jsonObject.optString("repeat" ) ));
			filefields[i] = field;
		}
		textFileInputMeta.inputFiles.inputFields=filefields;
		textFileInputMeta.content.fileType=cell.getAttribute("fileType");
		textFileInputMeta.content.separator=cell.getAttribute("separator");
		textFileInputMeta.content.enclosure=cell.getAttribute("enclosure;");
		textFileInputMeta.content.escapeCharacter=cell.getAttribute("escapeCharacter");
		textFileInputMeta.content.breakInEnclosureAllowed=("Y".equalsIgnoreCase(cell.getAttribute("breakInEnclosureAllowed")));
		textFileInputMeta.content.header=("Y".equalsIgnoreCase(cell.getAttribute("header")));
		textFileInputMeta.content.nrHeaderLines=Const.toInt(cell.getAttribute("nrHeaderLines"), 1);
		textFileInputMeta.content.footer=("Y".equalsIgnoreCase(cell.getAttribute("footer")));
		textFileInputMeta.content.nrFooterLines=Const.toInt(cell.getAttribute("nrFooterLines"), 1);
		textFileInputMeta.content.lineWrapped=("Y".equalsIgnoreCase(cell.getAttribute("lineWrapped")));
		textFileInputMeta.content.layoutPaged=("Y".equalsIgnoreCase(cell.getAttribute("layoutPaged")));

		textFileInputMeta.content.nrWraps=Const.toInt(cell.getAttribute("nrWraps"), 1);
		textFileInputMeta.content.nrLinesDocHeader=Const.toInt(cell.getAttribute("nrLinesDocHeader"), 1);
		textFileInputMeta.content.nrLinesPerPage=Const.toInt(cell.getAttribute("nrLinesPerPage"), 1);
		textFileInputMeta.content.fileCompression=(cell.getAttribute("fileCompression"));
		textFileInputMeta.content.noEmptyLines=("Y".equalsIgnoreCase(cell.getAttribute("noEmptyLines")));
		textFileInputMeta.content.includeFilename=("Y".equalsIgnoreCase(cell.getAttribute("includeFilename")));
		textFileInputMeta.content.filenameField=(cell.getAttribute("filenameField"));
		textFileInputMeta.content.includeRowNumber=("Y".equalsIgnoreCase(cell.getAttribute("includeRowNumber;")));
		textFileInputMeta.content.rowNumberByFile=("Y".equalsIgnoreCase(cell.getAttribute("rowNumberByFile")));
		textFileInputMeta.content.rowNumberField=(cell.getAttribute("rowNumberField"));
		textFileInputMeta.content.fileFormat=(cell.getAttribute("fileFormat"));
		textFileInputMeta.content.rowLimit=(Const.toInt(cell.getAttribute("rowLimit"),0));

	
		textFileInputMeta.content.encoding=cell.getAttribute("encoding");
		textFileInputMeta.errorHandling.errorIgnored=("Y".equalsIgnoreCase(cell.getAttribute("errorIgnored")));
		textFileInputMeta.setErrorCountField(cell.getAttribute("errorCountField"));
		textFileInputMeta.setErrorFieldsField(cell.getAttribute("errorFieldsField"));
		textFileInputMeta.setErrorTextField(cell.getAttribute("errorTextField;"));
		textFileInputMeta.errorHandling.warningFilesDestinationDirectory=(cell.getAttribute("warningFilesDestinationDirectory"));
		textFileInputMeta.errorHandling.warningFilesExtension=(cell.getAttribute("warningFilesExtension"));
		textFileInputMeta.errorHandling.errorFilesDestinationDirectory=(cell.getAttribute("errorFilesDestinationDirectory"));
		textFileInputMeta.errorHandling.errorFilesExtension=(cell.getAttribute("errorFilesExtension"));
		textFileInputMeta.errorHandling.lineNumberFilesExtension=(cell.getAttribute("lineNumberFilesExtension;"));
		textFileInputMeta.content.dateFormatLenient=("Y".equalsIgnoreCase(cell.getAttribute("dateFormatLenient")));
		textFileInputMeta.content.dateFormatLocale=( EnvUtil.createLocale(cell.getAttribute("dateFormatLocale")));
		textFileInputMeta.setErrorLineSkipped("Y".equalsIgnoreCase(cell.getAttribute("errorLineSkipped")));
		textFileInputMeta.inputFiles.acceptingFilenames=("Y".equalsIgnoreCase(cell.getAttribute("acceptingFilenames")));
		textFileInputMeta.inputFiles.passingThruFields=("Y".equalsIgnoreCase(cell.getAttribute("passingThruFields;")));
		textFileInputMeta.inputFiles.acceptingField=(cell.getAttribute("acceptingField"));
		textFileInputMeta.inputFiles.acceptingStepName=(cell.getAttribute("acceptingStepName"));
		textFileInputMeta.inputFiles.isaddresult=("Y".equalsIgnoreCase(cell.getAttribute("isaddresult")));
		textFileInputMeta.additionalOutputFields.shortFilenameField=(cell.getAttribute("shortFileFieldName;"));
		textFileInputMeta.additionalOutputFields.pathField=(cell.getAttribute("pathFieldName"));
		textFileInputMeta.additionalOutputFields.hiddenField=(cell.getAttribute("hiddenFieldName"));
		textFileInputMeta.additionalOutputFields.lastModificationField=(cell.getAttribute("lastModificationTimeFieldName"));
		textFileInputMeta.additionalOutputFields.uriField=(cell.getAttribute("uriNameFieldName"));
		textFileInputMeta.additionalOutputFields.rootUriField=(cell.getAttribute("rootUriNameFieldName"));
		textFileInputMeta.additionalOutputFields.extensionField=((cell.getAttribute("extensionFieldName")));
		textFileInputMeta.additionalOutputFields.sizeField=(cell.getAttribute("sizeFieldName"));
		textFileInputMeta.errorHandling.skipBadFiles=("Y".equalsIgnoreCase(cell.getAttribute("skipBadFiles")));
		textFileInputMeta.errorHandling.fileErrorField=(cell.getAttribute("fileErrorField"));
		textFileInputMeta.errorHandling.fileErrorMessageField=(cell.getAttribute("fileErrorMessageField"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		TextFileInputMeta textFileInputMeta = (TextFileInputMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
//		e.setAttribute("fileName", textFileInputMeta.inputFiles.fileName.toString());
//		e.setAttribute("filemask", textFileInputMeta.inputFiles.fileMask.toString());
//		e.setAttribute("excludeFileMask", textFileInputMeta.inputFiles.excludeFileMask.toString());
//		e.setAttribute("fileRequired", textFileInputMeta.inputFiles.fileRequired.toString());
//		e.setAttribute("includeSubFolders", textFileInputMeta.inputFiles.includeSubFolders.toString());
		e.setAttribute("fileType", 	textFileInputMeta.content.fileType );
		e.setAttribute("separator", textFileInputMeta.content.separator);
		e.setAttribute("enclosure", textFileInputMeta.content.enclosure);
		e.setAttribute("escapeCharacter",textFileInputMeta.content.escapeCharacter);
		e.setAttribute("breakInEnclosureAllowed", textFileInputMeta.content.breakInEnclosureAllowed ? "Y" : "N");
		e.setAttribute("header", textFileInputMeta.content.header ? "Y" : "N");
		e.setAttribute("nrHeaderLines",textFileInputMeta.content.nrHeaderLines +"");
		e.setAttribute("footer", textFileInputMeta.content.footer ? "Y" : "N");
		e.setAttribute("nrFooterLines", textFileInputMeta.content.nrFooterLines + "" );
		e.setAttribute("lineWrapped", textFileInputMeta.content.lineWrapped  ? "Y" : "N");
		e.setAttribute("nrWraps", textFileInputMeta.content.lineWrapped ? "Y" : "N");
		
		e.setAttribute("layoutPaged", textFileInputMeta.content.layoutPaged ? "Y" : "N");
		e.setAttribute("nrLinesDocHeader", textFileInputMeta.content.nrLinesDocHeader +"");
		e.setAttribute("nrLinesPerPage", textFileInputMeta.content.nrLinesPerPage + "");
		e.setAttribute("fileCompression", textFileInputMeta.content.fileCompression );
		e.setAttribute("noEmptyLines", textFileInputMeta.content.noEmptyLines ? "Y" : "N");
		e.setAttribute("includeFilename", textFileInputMeta.content.includeFilename ? "Y" : "N");
		e.setAttribute("filenameField", textFileInputMeta.content.filenameField );
		e.setAttribute("includeRowNumber", textFileInputMeta.content.includeRowNumber ? "Y" : "N");
		e.setAttribute("rowNumberByFile", textFileInputMeta.content.rowNumberByFile ? "Y" : "N");
		e.setAttribute("rowNumberField", textFileInputMeta.content.rowNumberByFile ? "Y" : "N");
		e.setAttribute("fileFormat", textFileInputMeta.content.fileFormat );
		e.setAttribute("rowLimit", textFileInputMeta.content.rowLimit +"");
//		e.setAttribute("TextFileInputField", textFileInputMeta.gette() + "");
		
//		e.setAttribute("filter", textFileInputMeta.getFilter() ? "Y" : "N");
		e.setAttribute("encoding", textFileInputMeta.getEncoding());
		e.setAttribute("errorIgnored", textFileInputMeta.errorHandling.errorIgnored ? "Y" : "N");
		e.setAttribute("errorCountField", textFileInputMeta.getErrorCountField());
		e.setAttribute("errorTextField", textFileInputMeta.getErrorTextField());
		e.setAttribute("warningFilesDestinationDirectory", textFileInputMeta.errorHandling.warningFilesDestinationDirectory );
		e.setAttribute("warningFilesExtension", textFileInputMeta.errorHandling.warningFilesExtension);
		e.setAttribute("errorFilesDestinationDirectory", textFileInputMeta.errorHandling.errorFilesDestinationDirectory);
		e.setAttribute("errorFilesExtension", textFileInputMeta.errorHandling.errorFilesExtension);
		e.setAttribute("lineNumberFilesDestinationDirectory", textFileInputMeta.errorHandling.lineNumberFilesDestinationDirectory);
		e.setAttribute("lineNumberFilesExtension", textFileInputMeta.errorHandling.lineNumberFilesExtension);
		e.setAttribute("dateFormatLenient", textFileInputMeta.content.dateFormatLenient ? "Y" : "N");
		e.setAttribute("dateFormatLocale", textFileInputMeta.content.dateFormatLocale.toString());
		e.setAttribute("errorLineSkipped", textFileInputMeta.isErrorLineSkipped() ? "Y" : "N");
		
		
		e.setAttribute("acceptingFilenames", textFileInputMeta.inputFiles.acceptingFilenames  ? "Y" : "N");
		e.setAttribute("passingThruFields", textFileInputMeta.inputFiles.passingThruFields  ? "Y" : "N");
		e.setAttribute("acceptingField", textFileInputMeta.inputFiles.acceptingField);
		e.setAttribute("acceptingStepName", textFileInputMeta.inputFiles.acceptingStepName);
		e.setAttribute("acceptingStep", textFileInputMeta.inputFiles.acceptingStepName );
		e.setAttribute("isaddresult", textFileInputMeta.inputFiles.isaddresult  ? "Y" : "N");
		e.setAttribute("shortFileFieldName", textFileInputMeta.additionalOutputFields.shortFilenameField);
		e.setAttribute("pathFieldName", textFileInputMeta.additionalOutputFields.pathField);
		
		e.setAttribute("hiddenFieldName", textFileInputMeta.additionalOutputFields.hiddenField);
		e.setAttribute("lastModificationTimeFieldName", textFileInputMeta.additionalOutputFields.lastModificationField);
		e.setAttribute("uriNameFieldName", textFileInputMeta.additionalOutputFields.uriField);
		e.setAttribute("rootUriNameFieldName", textFileInputMeta.additionalOutputFields.rootUriField);
		e.setAttribute("extensionFieldName", textFileInputMeta.additionalOutputFields.extensionField);
		
		
		
		
		TextFileFilter[] filters = textFileInputMeta.getFilter();
		if(filters != null) {
			JSONArray filterjsonArray = new JSONArray();
			for(TextFileFilter filter : filters) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("filterString", filter.getFilterString());
				jsonObject.put("filterPosition", filter.getFilterPosition());
				jsonObject.put("filterLastLine", filter.isFilterLastLine());
				jsonObject.put("filterPositive", filter.isFilterPositive());
				
				filterjsonArray.add(jsonObject);
			}
			e.setAttribute("filter", filterjsonArray.toString());
		};

		BaseFileInputField[] inputFields = textFileInputMeta.inputFiles.inputFields;
		if(inputFields != null) {
			JSONArray inputFieldsjsonArray = new JSONArray();
			for(BaseFileInputField inputField : inputFields) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", inputField.getName());
				jsonObject.put("position", inputField.getPosition());
				jsonObject.put("type", inputField.getTypeDesc());
				jsonObject.put("format", inputField.getFormat());
				jsonObject.put("currencySymbol", inputField.getCurrencySymbol());
				jsonObject.put("decimalSymbol", inputField.getDecimalSymbol());
				jsonObject.put("groupSymbol", inputField.getGroupSymbol());
				jsonObject.put("nullString", inputField.getNullString());
				jsonObject.put("ifNullValue", inputField.getIfNullValue());
				jsonObject.put("trimtype", inputField.getTrimTypeDesc());
				jsonObject.put("repeat", inputField.isRepeated());
				if(inputField.getLength() != -1)
					jsonObject.put("length", inputField.getLength());
				if(inputField.getPrecision() != -1)
					jsonObject.put("precision", inputField.getPrecision());
				
				inputFieldsjsonArray.add(jsonObject);
			}
			e.setAttribute("inputFields", inputFieldsjsonArray.toString());
		}
		
		return e;
	}

}
