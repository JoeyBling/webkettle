package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.logging.LogLevel;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SHELL")
@Scope("prototype")
public class JobEntryShell extends AbstractJobEntry{

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell,
			List<DatabaseMeta> databases, IMetaStore metaStore)
			throws Exception {
		org.pentaho.di.job.entries.shell.JobEntryShell jobEntryShell = (org.pentaho.di.job.entries.shell.JobEntryShell) jobEntry;
		jobEntryShell.setFileName(cell.getAttribute("fileName"));
		jobEntryShell.setWorkDirectory(cell.getAttribute("work_directory"));
		jobEntryShell.argFromPrevious = "Y".equalsIgnoreCase(cell.getAttribute("arg_from_previous"));
		jobEntryShell.execPerRow = "Y".equalsIgnoreCase(cell.getAttribute("exec_per_row"));
		jobEntryShell.setLogfile = "Y".equalsIgnoreCase(cell.getAttribute("set_logfile"));
		jobEntryShell.setAppendLogfile="Y".equalsIgnoreCase(cell.getAttribute("set_append_logfile"));
		jobEntryShell.logfile = cell.getAttribute("logfile");
		jobEntryShell.logext = cell.getAttribute("logext");
		jobEntryShell.addDate ="Y".equalsIgnoreCase(cell.getAttribute("add_date"));
		jobEntryShell.addTime="Y".equalsIgnoreCase(cell.getAttribute("add_time"));
		jobEntryShell.insertScript = "Y".equalsIgnoreCase(cell.getAttribute("insertScript"));
		jobEntryShell.setScript(cell.getAttribute("script"));
		//日志级别？
		//jobEntryShell.logFileLevel = 
		//参数
		String args = cell.getAttribute("args");
		JSONArray jsonArray = JSONArray.fromObject(args);
		String[] argument = new String[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			argument[i] = jsonObject.optString("argument");
		}
		jobEntryShell.arguments=argument;
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		org.pentaho.di.job.entries.shell.JobEntryShell jobEntryShell = (org.pentaho.di.job.entries.shell.JobEntryShell) jobEntry;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		
		e.setAttribute("fileName", jobEntryShell.getFilename());
		e.setAttribute("work_directory", jobEntryShell.getWorkDirectory());
		e.setAttribute("arg_from_previous", jobEntryShell.argFromPrevious?"Y":"N");
		e.setAttribute("exec_per_row", jobEntryShell.execPerRow?"Y":"N");
		e.setAttribute("set_logfile", jobEntryShell.setLogfile?"Y":"N");
		e.setAttribute("logfile", jobEntryShell.logfile);
		e.setAttribute("set_append_logfile", jobEntryShell.setAppendLogfile?"Y":"N");
		e.setAttribute("logext", jobEntryShell.logext);
		e.setAttribute("add_date", jobEntryShell.addDate?"Y":"N");
		e.setAttribute("add_time", jobEntryShell.addTime?"Y":"N");
		e.setAttribute("insertScript", jobEntryShell.insertScript?"Y":"N");
		e.setAttribute("script", jobEntryShell.getScript());
		e.setAttribute("loglevel", ( jobEntryShell.logFileLevel == null ) ? null : jobEntryShell.logFileLevel.getCode());
		
		JSONArray jsonArray = new JSONArray();
		String[]  args = jobEntryShell.arguments;
		if(args!=null){
			for(int i=0;i<args.length;i++){
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("argument", args[i]);
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("args", jsonArray.toString());
		return e;
	}

}
