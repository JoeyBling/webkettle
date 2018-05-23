package org.flhy.ext.job.steps;

import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SIMPLE_EVAL")
@Scope("prototype")
public class JobEntrySimpleEval extends AbstractJobEntry{

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell,
			List<DatabaseMeta> databases, IMetaStore metaStore)
			throws Exception {
		org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval jobEntrySimpleEval = (org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval) jobEntry;

		jobEntrySimpleEval.valuetype = "variable".equals(cell.getAttribute("valuetype"))?1:0;
		jobEntrySimpleEval.setFieldName(cell.getAttribute("fieldname"));
		jobEntrySimpleEval.setVariableName(cell.getAttribute("variablename"));
		//jobEntrySimpleEval.fieldtype =cell.getAttribute("fieldtype");
		jobEntrySimpleEval.fieldtype=org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval.getFieldTypeByDesc(cell.getAttribute("fieldtype"));
//		for(int i=0;i<jobEntrySimpleEval.fieldTypeCode.length;i++){
//			if(jobEntrySimpleEval.fieldTypeCode[i].equals(cell.getAttribute("fieldtype"))){
//				jobEntrySimpleEval.fieldtype=i;
//			}
//		}
		jobEntrySimpleEval.setMask(cell.getAttribute("mask"));
		jobEntrySimpleEval.setCompareValue(cell.getAttribute("comparevalue"));
		jobEntrySimpleEval.setMinValue(cell.getAttribute("minvalue"));
		jobEntrySimpleEval.setMaxValue(cell.getAttribute("maxvalue"));
		//jobEntrySimpleEval.successcondition = Integer.parseInt(cell.getAttribute("successcondition"));
//		for(int i=0;i<jobEntrySimpleEval.successConditionCode.length;i++){
//			if(jobEntrySimpleEval.successConditionCode[i].equals(cell.getAttribute("successcondition"))){
//				jobEntrySimpleEval.successcondition=i;
//			}
//		}
		//jobEntrySimpleEval.successnumbercondition =Const.toInt(cell.getAttribute("ftps_connection_type"),0);
		if( StringUtils.isEmpty( cell.getAttribute("successnumbercondition"))==false )
		jobEntrySimpleEval.successnumbercondition= org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval.
				getSuccessNumberConditionByDesc(cell.getAttribute("successnumbercondition"));
		else {
			
		}
//		for(int i=0;i<jobEntrySimpleEval.successNumberConditionCode.length;i++){
//			if(jobEntrySimpleEval.successNumberConditionCode[i].equals(cell.getAttribute("successcondition"))){
//				jobEntrySimpleEval.successnumbercondition=i;
//			}
//		}
		//jobEntrySimpleEval.successbooleancondition = Const.toInt(cell.getAttribute("successbooleancondition"),0);
//		String successbooleanconditionString=cell.getAttribute("successbooleancondition");
//		if( successbooleanconditionString!=null )
//		if( successbooleanconditionString.equals("true") )
//		{
//			jobEntrySimpleEval.successbooleancondition=jobEntrySimpleEval.SUCCESS_BOOLEAN_CONDITION_TRUE;
//		}
//		else {
//			jobEntrySimpleEval.successbooleancondition=jobEntrySimpleEval.SUCCESS_BOOLEAN_CONDITION_FALSE;
//		}
//		jobEntrySimpleEval.setSuccessWhenVarSet(cell.getAttribute("successWhenVarSet")=="Y");;
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval jobEntrySimpleEval = (org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval) jobEntry;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		
		
		e.setAttribute("valuetype", jobEntrySimpleEval.valueTypeCode[ jobEntrySimpleEval.valuetype]  );
//				jobEntrySimpleEval.valueTypeCode[jobEntrySimpleEval.valuetype]);
		if( jobEntrySimpleEval.valuetype==0 )
			e.setAttribute("fieldname", jobEntrySimpleEval.getFieldName());
		else if( jobEntrySimpleEval.valuetype==1 )
			e.setAttribute("variablename", jobEntrySimpleEval.getVariableName());
		
		e.setAttribute("fieldtype", jobEntrySimpleEval.fieldTypeCode[jobEntrySimpleEval.fieldtype]);
		e.setAttribute("mask", jobEntrySimpleEval.getMask());
		e.setAttribute("comparevalue", jobEntrySimpleEval.getCompareValue());
 
		e.setAttribute("minvalue", jobEntrySimpleEval.getMinValue());
		e.setAttribute("maxvalue", jobEntrySimpleEval.getMaxValue());
		e.setAttribute("successcondition", jobEntrySimpleEval.successConditionCode[jobEntrySimpleEval.successcondition]);
		e.setAttribute("successnumbercondition",  jobEntrySimpleEval.successNumberConditionCode[ jobEntrySimpleEval.successnumbercondition ] );
				
//				jobEntrySimpleEval.successNumberConditionCode[jobEntrySimpleEval.successnumbercondition]);
		e.setAttribute("successbooleancondition", jobEntrySimpleEval.successBooleanConditionCode[jobEntrySimpleEval.successbooleancondition]);
		e.setAttribute("successwhenvarset", jobEntrySimpleEval.isSuccessWhenVarSet()+"");
		return e;
	}

}
