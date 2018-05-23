package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("FTP")
@Scope("prototype")
public class JobEntryFTP extends AbstractJobEntry{

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.ftp.JobEntryFTP jobEntryFTP = (org.pentaho.di.job.entries.ftp.JobEntryFTP) jobEntry;
		jobEntryFTP.setServerName(cell.getAttribute("serverName"));
		jobEntryFTP.setPort(cell.getAttribute("serverPort"));
		jobEntryFTP.setUserName(cell.getAttribute("username"));
		jobEntryFTP.setPassword(cell.getAttribute("password"));
		jobEntryFTP.setTargetDirectory(cell.getAttribute("targetdirectory"));
		jobEntryFTP.setWildcard(cell.getAttribute("wildcard"));
		jobEntryFTP.setRemove("Y".equalsIgnoreCase(cell.getAttribute("remove")));
		jobEntryFTP.setBinaryMode("Y".equalsIgnoreCase(cell.getAttribute("")));
	

		jobEntryFTP.setProxyHost(cell.getAttribute("proxyHost"));
		jobEntryFTP.setProxyPort(cell.getAttribute("proxyPort"));
		jobEntryFTP.setProxyUsername(cell.getAttribute("proxyUsername"));
		jobEntryFTP.setProxyPassword(cell.getAttribute("proxyPassword"));
		
		jobEntryFTP.setFtpDirectory(cell.getAttribute("ftpdirectory"));
		
		jobEntryFTP.setAddToResult("Y".equalsIgnoreCase(cell.getAttribute("isaddresult")));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);

		org.pentaho.di.job.entries.ftp.JobEntryFTP jobEntryFTP = (org.pentaho.di.job.entries.ftp.JobEntryFTP) jobEntry;
		
		e.setAttribute("serverName", jobEntryFTP.getServerName());
		e.setAttribute("serverPort", jobEntryFTP.getPort());
		e.setAttribute("username", jobEntryFTP.getUserName());
		e.setAttribute("password", jobEntryFTP.getPassword());
		e.setAttribute("binaryMode", jobEntryFTP.isBinaryMode()?"Y":"N");
		e.setAttribute("timeout", jobEntryFTP.getTimeout()+"");
		e.setAttribute("activeConnection", jobEntryFTP.isActiveConnection()?"Y":"N");
		e.setAttribute("control_encoding", jobEntryFTP.getControlEncoding());
		e.setAttribute("proxy_host", jobEntryFTP.getProxyHost());
		e.setAttribute("proxy_port", jobEntryFTP.getProxyPort());
		e.setAttribute("proxy_username", jobEntryFTP.getProxyUsername());
		e.setAttribute("proxy_password", jobEntryFTP.getProxyPassword());
		e.setAttribute("wildcard", jobEntryFTP.getWildcard());//通配符
		e.setAttribute("remove", jobEntryFTP.getRemove()?"Y":"N");
		e.setAttribute("ftpdirectory", jobEntryFTP.getFtpDirectory());
		e.setAttribute("targetdirectory", jobEntryFTP.getTargetDirectory());
		
		return e;
	}

}
