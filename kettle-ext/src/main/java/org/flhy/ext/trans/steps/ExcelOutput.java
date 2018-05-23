package org.flhy.ext.trans.steps;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.encryption.Encr;
import org.pentaho.di.core.row.value.ValueMetaFactory;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.exceloutput.ExcelField;
import org.pentaho.di.trans.steps.exceloutput.ExcelOutputMeta;
import org.pentaho.di.ui.trans.steps.exceloutput.ExcelOutputDialog;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import java.nio.charset.Charset;
import java.util.List;

/**
 * Created by cRAZY on 2017/5/24.
 */
@Component("ExcelOutput")
@Scope("prototype")
public class ExcelOutput extends AbstractStep{
    public static Integer getIndex(String[] sources,String target){
        Integer result=0;
        if(null==target || target.equals("")){
            result=0;
        }else{
            for(int i=0;i<sources.length;i++){
                if(target.equalsIgnoreCase(sources[i])){
                    result=i;
                    break;
                }
            }
        }
        return result;
    }

    @Override
    public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
        ExcelOutputMeta excel=(ExcelOutputMeta)stepMetaInterface;
        excel.setHeaderEnabled(cell.getAttribute("header").equalsIgnoreCase("Y"));
        excel.setFooterEnabled(cell.getAttribute("footer").equalsIgnoreCase("Y"));
        excel.setEncoding(cell.getAttribute("encoding"));
        excel.setAppend(cell.getAttribute("append").equalsIgnoreCase("Y"));
        String e=cell.getAttribute("add_to_result_filenames");
        if(Const.isEmpty(e)) {
            excel.setAddToResultFiles(true);
        } else {
            excel.setAddToResultFiles("Y".equalsIgnoreCase(e));
        }
        excel.setFileName(cell.getAttribute("name"));
        excel.setExtension(cell.getAttribute("extention"));
        excel.setDoNotOpenNewFileInit(cell.getAttribute("do_not_open_newfile_init").equalsIgnoreCase("Y"));
        excel.setCreateParentFolder(cell.getAttribute("create_parent_folder").equalsIgnoreCase("Y"));
        excel.setStepNrInFilename(cell.getAttribute("split").equalsIgnoreCase("Y"));
        excel.setDateInFilename(cell.getAttribute("add_date").equalsIgnoreCase("Y"));
        excel.setTimeInFilename(cell.getAttribute("add_time").equalsIgnoreCase("Y"));
        excel.setSpecifyFormat(cell.getAttribute("SpecifyFormat").equalsIgnoreCase("Y"));
        excel.setDateTimeFormat(cell.getAttribute("date_time_format"));
        excel.setUseTempFiles(cell.getAttribute("usetempfiles").equalsIgnoreCase("Y"));
        excel.setTempDirectory(cell.getAttribute("tempdirectory"));
        excel.setAutoSizeColums(cell.getAttribute("autosizecolums").equalsIgnoreCase("Y"));
        excel.setNullIsBlank(cell.getAttribute("nullisblank").equalsIgnoreCase("Y"));
        excel.setProtectSheet(cell.getAttribute("protect_sheet").equalsIgnoreCase("Y"));
        excel.setPassword(Encr.decryptPasswordOptionallyEncrypted(cell.getAttribute("password")));
        excel.setSplitEvery(Const.toInt(cell.getAttribute("splitevery"), 0));
        excel.setSheetname(cell.getAttribute("sheetname"));


        excel.setTemplateEnabled(cell.getAttribute("enabled").equalsIgnoreCase("Y"));
        excel.setTemplateAppend(cell.getAttribute("append").equalsIgnoreCase("Y"));
        excel.setTemplateFileName(cell.getAttribute("filename"));

        String fields=cell.getAttribute("fields");
        JSONArray jsonArray=JSONArray.fromObject(fields);
        if(jsonArray.size()>0){
            ExcelField[] efs=new ExcelField[jsonArray.size()];
            for(int i=0; i<jsonArray.size(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                ExcelField ef=new ExcelField();
                ef.setName(jsonObject.optString("name"));
                ef.setType(jsonObject.optString("type"));
                ef.setFormat(jsonObject.optString("format"));
                efs[i]=ef;
            }
            excel.setOutputFields(efs);
        }

        excel.setHeaderFontName(this.getIndex(excel.font_name_code,cell.getAttribute("header_font_name")));
        excel.setHeaderFontSize(Const.NVL(cell.getAttribute("header_font_size"), "10"));
        excel.setHeaderFontBold("Y".equalsIgnoreCase(cell.getAttribute("header_font_bold")));
        excel.setHeaderFontItalic("Y".equalsIgnoreCase(cell.getAttribute("header_font_italic")));
        excel.setHeaderFontUnderline(this.getIndex(excel.font_underline_code, cell.getAttribute("header_font_underline")));
        excel.setHeaderFontOrientation(this.getIndex(excel.font_orientation_code,cell.getAttribute("header_font_orientation")));
        excel.setHeaderFontColor(this.getIndex(excel.font_color_code,cell.getAttribute("header_font_color")));
        excel.setHeaderRowHeight(cell.getAttribute("header_row_height"));
        excel.setHeaderAlignment(this.getIndex(excel.font_alignment_code, cell.getAttribute("header_alignment")));
        excel.setHeaderImage(cell.getAttribute("header_image"));
        excel.setRowFontName(this.getIndex(excel.font_name_code,cell.getAttribute("row_font_name")));
        excel.setRowFontSize(Const.NVL(cell.getAttribute("row_font_size"), "10"));
        excel.setRowFontColor(this.getIndex(excel.font_color_code,cell.getAttribute("row_font_color")));
        excel.setRowBackGroundColor(this.getIndex(excel.font_color_code,cell.getAttribute("row_background_color")));
    }

    @Override
    public Element encode(StepMetaInterface stepMetaInterface) throws Exception {

        ExcelOutputMeta excel=(ExcelOutputMeta)stepMetaInterface;
        Document doc = mxUtils.createDocument();
        Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);

        e.setAttribute("header", excel.isHeaderEnabled() ? "Y" : "N");
        e.setAttribute("footer", excel.isFooterEnabled() ? "Y" : "N");
        e.setAttribute("encoding", excel.getEncoding());
        e.setAttribute("append", excel.isAppend() ? "Y" : "N");
        e.setAttribute("add_to_result_filenames", excel.isAddToResultFiles() ? "Y" : "N");


        e.setAttribute("name", excel.getFileName());
        e.setAttribute("extention", excel.getExtension());
        e.setAttribute("do_not_open_newfile_init", excel.isDoNotOpenNewFileInit() ? "Y" : "N");
        e.setAttribute("create_parent_folder", excel.isCreateParentFolder() ? "Y" : "N");
        e.setAttribute("split", excel.isStepNrInFilename() ? "Y" : "N");
        e.setAttribute("add_date", excel.isDateInFilename() ? "Y" : "N");
        e.setAttribute("add_time", excel.isTimeInFilename() ? "Y" : "N");
        e.setAttribute("SpecifyFormat", excel.isSpecifyFormat() ? "Y" : "N");
        e.setAttribute("date_time_format", excel.getDateTimeFormat());
        e.setAttribute("sheetname", excel.getSheetname());
        e.setAttribute("autosizecolums", excel.isAutoSizeColums() ? "Y" : "N");
        e.setAttribute("nullisblank", excel.isNullBlank() ? "Y" : "N");
        e.setAttribute("protect_sheet", excel.isSheetProtected() ? "Y" : "N");
        e.setAttribute("password", Encr.encryptPasswordIfNotUsingVariables(excel.getPassword()));
        e.setAttribute("splitevery", Integer.valueOf(excel.getSplitEvery()).toString());
        e.setAttribute("usetempfiles", excel.isUseTempFiles() ? "Y" : "N");
        e.setAttribute("tempdirectory", excel.getTempDirectory());

        e.setAttribute("enabled", excel.isTemplateEnabled() ? "Y" : "N");
        e.setAttribute("append", excel.isTemplateAppend() ? "Y" : "N");
        e.setAttribute("filename", excel.getTemplateFileName());

        JSONArray jsonArray = new JSONArray();
        ExcelField[] excelFields = excel.getOutputFields();
        for(int j=0; j<excelFields.length; j++) {
            JSONObject jsonObject = new JSONObject();
            ExcelField field = excelFields[j];
            jsonObject.put("name", field.getName());
            jsonObject.put("type", field.getTypeDesc());
            jsonObject.put("format",field.getFormat());
            jsonArray.add(jsonObject);
        }
        e.setAttribute("fields",jsonArray.toString());

        e.setAttribute("header_font_name", excel.getHeaderFontName() >= 0 && excel.getHeaderFontName() < excel.font_name_code.length ? excel.font_name_code[excel.getHeaderFontName()] : excel.font_name_code[0]);
        e.setAttribute("header_font_size", excel.getHeaderFontSize());
        e.setAttribute("header_font_bold", excel.isHeaderFontBold() ? "Y" : "N");
        e.setAttribute("header_font_italic", excel.isHeaderFontItalic() ? "Y" : "N");
        e.setAttribute("header_font_underline", excel.getHeaderFontUnderline() >= 0 && excel.getHeaderFontUnderline() < excel.font_underline_code.length ? excel.font_underline_code[excel.getHeaderFontUnderline()] : excel.font_underline_code[0]);
        e.setAttribute("header_font_orientation", excel.getHeaderFontOrientation() >= 0 && excel.getHeaderFontOrientation() < excel.font_orientation_code.length ? excel.font_orientation_code[excel.getHeaderFontOrientation()] : excel.font_orientation_code[0]);
        e.setAttribute("header_font_color", excel.getHeaderFontColor() >= 0 && excel.getHeaderFontColor() < excel.font_color_code.length ? excel.font_color_code[excel.getHeaderFontColor()] : excel.font_color_code[0]);
        e.setAttribute("header_background_color", excel.getHeaderBackGroundColor() >= 0 && excel.getHeaderBackGroundColor() < excel.font_color_code.length ? excel.font_color_code[excel.getHeaderBackGroundColor()] : excel.font_color_code[0]);
        e.setAttribute("header_row_height", excel.getHeaderRowHeight());
        e.setAttribute("header_alignment", excel.getHeaderAlignment() >= 0 && excel.getHeaderAlignment() < excel.font_alignment_code.length ? excel.font_alignment_code[excel.getHeaderAlignment()] : excel.font_alignment_code[0]);
        e.setAttribute("header_image", excel.getHeaderImage());
        e.setAttribute("row_font_name", excel.getRowFontName() >= 0 && excel.getRowFontName() < excel.font_name_code.length ? excel.font_name_code[excel.getRowFontName()] : excel.font_name_code[0]);
        e.setAttribute("row_font_size", excel.getRowFontSize());
        e.setAttribute("row_font_color", excel.getRowFontColor() >= 0 && excel.getRowFontColor() < excel.font_color_code.length ? excel.font_color_code[excel.getRowFontColor()] : excel.font_color_code[0]);
        e.setAttribute("row_background_color", excel.getRowBackGroundColor()>=0&&excel.getRowBackGroundColor()<excel.font_color_code.length?excel.font_color_code[excel.getRowBackGroundColor()]:excel.font_color_code[0]);
        return e;
    }
}
