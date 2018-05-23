package org.flhy.ext.trans.steps;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.big.data.kettle.plugins.hdfs.trans.HadoopFileInputMeta;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.annotations.Step;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.util.EnvUtil;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.fileinput.BaseFileInputField;
import org.pentaho.di.trans.steps.fileinput.text.TextFileFilter;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import java.lang.annotation.Annotation;
import java.util.List;

/**
 * Created by cRAZY on 2017/6/9.
 */
@Component("HadoopFileInput")
@Scope("prototype")
public class HadoopFileInput extends AbstractStep {

    @Override
    public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
        HadoopFileInputMeta hadoop=(HadoopFileInputMeta)stepMetaInterface;
        //file
        hadoop.inputFiles.acceptingFilenames="Y".equalsIgnoreCase(cell.getAttribute("acceptingFilenames"));
        hadoop.inputFiles.passingThruFields="Y".equalsIgnoreCase(cell.getAttribute("passingThruFields"));
        hadoop.inputFiles.acceptingField=cell.getAttribute("acceptingField");
        hadoop.inputFiles.acceptingStepName=cell.getAttribute("acceptingStepName");
        JSONArray fileArray=JSONArray.fromObject(cell.getAttribute("file"));
        hadoop.inputFiles.fileName=new String[fileArray.size()];
        hadoop.inputFiles.fileMask= new String[fileArray.size()];
        hadoop.inputFiles.excludeFileMask= new String[fileArray.size()];
        hadoop.inputFiles.fileRequired = new String[fileArray.size()];
        hadoop.inputFiles.includeSubFolders= new String[fileArray.size()];
        for(int i=0;i<fileArray.size();i++){
            JSONObject fileJson=fileArray.getJSONObject(i);
            hadoop.inputFiles.fileName[i] = fileJson.optString("fileName" );
            hadoop.inputFiles.fileMask[i] = fileJson.optString("filemask") ;
            hadoop.inputFiles.excludeFileMask[i] = fileJson.optString("excludeFileMask") ;
            hadoop.inputFiles.fileRequired[i] = fileJson.optString("fileRequired") ;
            hadoop.inputFiles.includeSubFolders[i] = fileJson.optString("includeSubFolders"  );
        }

        //Content
        hadoop.content.fileType=cell.getAttribute("fileType");
        hadoop.content.separator=cell.getAttribute("separator");
        hadoop.content.enclosure=cell.getAttribute("enclosure;");
        hadoop.content.escapeCharacter=cell.getAttribute("escapeCharacter");
        hadoop.content.breakInEnclosureAllowed=("Y".equalsIgnoreCase(cell.getAttribute("breakInEnclosureAllowed")));
        hadoop.content.header=("Y".equalsIgnoreCase(cell.getAttribute("header")));
        hadoop.content.nrHeaderLines= Const.toInt(cell.getAttribute("nrHeaderLines"), 1);
        hadoop.content.footer=("Y".equalsIgnoreCase(cell.getAttribute("footer")));
        hadoop.content.nrFooterLines=Const.toInt(cell.getAttribute("nrFooterLines"), 1);
        hadoop.content.lineWrapped=("Y".equalsIgnoreCase(cell.getAttribute("lineWrapped")));
        hadoop.content.layoutPaged=("Y".equalsIgnoreCase(cell.getAttribute("layoutPaged")));
        hadoop.content.nrWraps=Const.toInt(cell.getAttribute("nrWraps"), 1);
        hadoop.content.nrLinesDocHeader=Const.toInt(cell.getAttribute("nrLinesDocHeader"), 1);
        hadoop.content.nrLinesPerPage=Const.toInt(cell.getAttribute("nrLinesPerPage"), 1);
        hadoop.content.fileCompression=(cell.getAttribute("fileCompression"));
        hadoop.content.noEmptyLines=("Y".equalsIgnoreCase(cell.getAttribute("noEmptyLines")));
        hadoop.content.includeFilename=("Y".equalsIgnoreCase(cell.getAttribute("includeFilename")));
        hadoop.content.filenameField=(cell.getAttribute("filenameField"));
        hadoop.content.includeRowNumber=("Y".equalsIgnoreCase(cell.getAttribute("includeRowNumber;")));
        hadoop.content.rowNumberByFile=("Y".equalsIgnoreCase(cell.getAttribute("rowNumberByFile")));
        hadoop.content.rowNumberField=(cell.getAttribute("rowNumberField"));
        hadoop.content.fileFormat=(cell.getAttribute("fileFormat"));
        hadoop.content.rowLimit=(Const.toInt(cell.getAttribute("rowLimit"), 0));
        hadoop.content.encoding=cell.getAttribute("encoding");
        hadoop.content.dateFormatLenient=("Y".equalsIgnoreCase(cell.getAttribute("dateFormatLenient")));
        hadoop.content.dateFormatLocale=( EnvUtil.createLocale(cell.getAttribute("dateFormatLocale")));
        hadoop.inputFiles.isaddresult=("Y".equalsIgnoreCase(cell.getAttribute("addresult")));

        //Error Handling
        hadoop.errorHandling.errorIgnored="Y".equalsIgnoreCase(cell.getAttribute("errorIgnored"));
        hadoop.setErrorLineSkipped("Y".equalsIgnoreCase(cell.getAttribute("errorLineSkipped")));
        hadoop.setErrorCountField(cell.getAttribute("errorCountField"));
        hadoop.setErrorFieldsField(cell.getAttribute("errorFieldsField"));
        hadoop.setErrorTextField(cell.getAttribute("errorTextField;"));
        hadoop.errorHandling.warningFilesDestinationDirectory=cell.getAttribute("warningFilesDestinationDirectory");
        hadoop.errorHandling.warningFilesExtension=cell.getAttribute("warningFilesExtension");
        hadoop.errorHandling.errorFilesDestinationDirectory=cell.getAttribute("errorFilesDestinationDirectory");
        hadoop.errorHandling.errorFilesExtension=cell.getAttribute("errorFilesExtension");
        hadoop.errorHandling.lineNumberFilesDestinationDirectory=cell.getAttribute("lineNumberFilesDestinationDirectory");
        hadoop.errorHandling.lineNumberFilesExtension=cell.getAttribute("lineNumberFilesExtension");

        //Filters
        JSONArray filterArray=JSONArray.fromObject(cell.getAttribute("filter"));
        if(filterArray != null) {
            TextFileFilter[] filterFields = new TextFileFilter[filterArray.size()];
            for(int i=0;i<filterArray.size();i++) {
                JSONObject filterJson=filterArray.getJSONObject(i);
                TextFileFilter filterField = new TextFileFilter();
                filterField.setFilterString( filterJson.optString("filterString" ) );
                filterField.setFilterPosition( Const.toInt(filterJson.optString("filterPosition" ),0) );
                filterField.setFilterLastLine("Y".equalsIgnoreCase( filterJson.optString("filterLastLine" ) ));
                filterField.setFilterPositive( "Y".equalsIgnoreCase(filterJson.optString("filterPositive" ) ));
                filterFields[i] = filterField;
            }
            hadoop.setFilter(filterFields);
        };

        //fields
        JSONArray fieldsArray=JSONArray.fromObject(cell.getAttribute("fields"));
        BaseFileInputField[] filefields = new BaseFileInputField[fieldsArray.size()];
        for(int i=0; i<fieldsArray.size(); i++) {
            JSONObject jsonObject = fieldsArray.getJSONObject(i);
            BaseFileInputField field = new BaseFileInputField();
            field.setName( jsonObject.optString("name" ) );
            field.setType( Const.toInt(jsonObject.optString("type" ),0) );
            field.setFormat( jsonObject.optString("format" ) );
            field.setPosition( Const.toInt(jsonObject.optString("position" ),0) );
            field.setLength( Const.toInt(jsonObject.optString("length" ),-1) );
            field.setPrecision( Const.toInt(jsonObject.optString("precision" ),-1) );
            field.setCurrencySymbol( jsonObject.optString("currencySymbol" ));
            field.setDecimalSymbol( jsonObject.optString("decimalSymbol" ) );
            field.setGroupSymbol( jsonObject.optString("groupSymbol" ));
            field.setTrimType( Const.toInt(jsonObject.optString("trimtype" ),0) );
            field.setNullString( jsonObject.optString("nullif" ));
            field.setIfNullValue( jsonObject.optString("ifnull" ));
            field.setRepeated( "Y".equalsIgnoreCase(jsonObject.optString("repeat" ) ));
            filefields[i] = field;
        }
        hadoop.inputFiles.inputFields=filefields;

    }

    @Override
    public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
        HadoopFileInputMeta hadoop=(HadoopFileInputMeta)stepMetaInterface;
        Document doc = mxUtils.createDocument();
        Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
        //file
        e.setAttribute("acceptingFilenames",hadoop.inputFiles.acceptingFilenames?"Y":"N");
        e.setAttribute("passingThruFields", hadoop.inputFiles.passingThruFields ? "Y" : "N");
        e.setAttribute("acceptingField", hadoop.inputFiles.acceptingField);
        e.setAttribute("acceptingStepName", hadoop.getAcceptingStep() != null ? hadoop.getAcceptingStep().getName() : "");
        JSONArray fileArray=new JSONArray();
        for(int i=0;i<hadoop.inputFiles.fileName.length;i++){
            JSONObject json=new JSONObject();
            json.put("filename",hadoop.inputFiles.fileName[i]);
            json.put("filemask",hadoop.inputFiles.fileMask);
            json.put("excludeFileMask",hadoop.inputFiles.excludeFileMask[i]);
            json.put("fileRequired",hadoop.inputFiles.fileRequired[i]);
            json.put("includeSubFolders",hadoop.inputFiles.includeSubFolders[i]);
            fileArray.add(json);
        }
        e.setAttribute("file",fileArray.toString());

        //Content
        e.setAttribute("fileType", hadoop.content.fileType);
        e.setAttribute("separator", hadoop.content.separator);
        e.setAttribute("enclosure", hadoop.content.enclosure);
        e.setAttribute("breakInEnclosureAllowed", hadoop.content.breakInEnclosureAllowed ? "Y" : "N");
        e.setAttribute("escapeCharacter", hadoop.content.escapeCharacter);
        e.setAttribute("header", hadoop.content.header ?"Y":"N");
        e.setAttribute("nrHeaderLines", String.valueOf(hadoop.content.nrHeaderLines));
        e.setAttribute("footer", hadoop.content.footer?"Y":"N");
        e.setAttribute("nrFooterLines", String.valueOf(hadoop.content.nrFooterLines));
        e.setAttribute("lineWrapped", hadoop.content.lineWrapped?"Y":"N");
        e.setAttribute("nrWraps", String.valueOf(hadoop.content.nrWraps));
        e.setAttribute("layoutPaged", hadoop.content.layoutPaged?"Y":"N");
        e.setAttribute("nrLinesPerPage", String.valueOf(hadoop.content.nrLinesPerPage));
        e.setAttribute("nrLinesDocHeader", String.valueOf(hadoop.content.nrLinesDocHeader));
        e.setAttribute("fileCompression", hadoop.content.fileCompression == null ? "None" : hadoop.content.fileCompression);
        e.setAttribute("noEmptyLines", hadoop.content.noEmptyLines?"Y":"N");
        e.setAttribute("includeFilename", hadoop.content.includeFilename?"Y":"N");
        e.setAttribute("filenameField", hadoop.content.filenameField);
        e.setAttribute("includeRowNumber", hadoop.content.includeRowNumber?"Y":"N");
        e.setAttribute("rowNumberByFile", hadoop.content.rowNumberByFile?"Y":"N");
        e.setAttribute("rowNumberField", hadoop.content.rowNumberField);
        e.setAttribute("fileFormat", hadoop.content.fileFormat);
        e.setAttribute("encoding", hadoop.content.encoding);
        e.setAttribute("rowLimit", String.valueOf(hadoop.content.rowLimit));
        e.setAttribute("dateFormatLenient", hadoop.content.dateFormatLenient?"Y":"N");
        e.setAttribute("dateFormatLocale", hadoop.content.dateFormatLocale != null ? hadoop.content.dateFormatLocale.toString():null);
        e.setAttribute("addresult", hadoop.inputFiles.isaddresult?"Y":"N");

        //Error Handling
        e.setAttribute("errorIgnored", hadoop.errorHandling.errorIgnored ? "Y" : "N");
        e.setAttribute("errorLineSkipped", hadoop.isErrorLineSkipped() ? "Y" : "N");
        e.setAttribute("errorCountField", hadoop.getErrorCountField());
        e.setAttribute("errorFieldsField",hadoop.getErrorFieldsField());
        e.setAttribute("errorTextField", hadoop.getErrorTextField());
        e.setAttribute("warningFilesDestinationDirectory", hadoop.errorHandling.warningFilesDestinationDirectory );
        e.setAttribute("warningFilesExtension", hadoop.errorHandling.warningFilesExtension);
        e.setAttribute("errorFilesDestinationDirectory", hadoop.errorHandling.errorFilesDestinationDirectory);
        e.setAttribute("errorFilesExtension", hadoop.errorHandling.errorFilesExtension);
        e.setAttribute("lineNumberFilesDestinationDirectory", hadoop.errorHandling.lineNumberFilesDestinationDirectory);
        e.setAttribute("lineNumberFilesExtension", hadoop.errorHandling.lineNumberFilesExtension);

        //Filters
        TextFileFilter[] filters = hadoop.getFilter();
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

        //fields
        BaseFileInputField[] inputFields = hadoop.inputFiles.inputFields;
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
                jsonObject.put("nullif", inputField.getNullString());
                jsonObject.put("ifnull", inputField.getIfNullValue());
                jsonObject.put("trimtype", inputField.getTrimTypeDesc());
                jsonObject.put("repeat", inputField.isRepeated());
                if(inputField.getLength() != -1)
                    jsonObject.put("length", inputField.getLength());
                if(inputField.getPrecision() != -1)
                    jsonObject.put("precision", inputField.getPrecision());

                inputFieldsjsonArray.add(jsonObject);
            }
            e.setAttribute("fields", inputFieldsjsonArray.toString());
        }
        return e;
    }
}
