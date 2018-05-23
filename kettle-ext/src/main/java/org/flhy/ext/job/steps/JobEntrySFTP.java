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

@Component("SFTP")
@Scope("prototype")
public class JobEntrySFTP extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.sftp.JobEntrySFTP jobEntrySFTP = (org.pentaho.di.job.entries.sftp.JobEntrySFTP) jobEntry;
		
		jobEntrySFTP.setServerName(cell.getAttribute("servername"));
		jobEntrySFTP.setServerPort(cell.getAttribute("serverport"));
		jobEntrySFTP.setUserName(cell.getAttribute("username"));
		jobEntrySFTP.setPassword(cell.getAttribute("password"));
		jobEntrySFTP.setUseKeyFile("Y".equalsIgnoreCase(cell.getAttribute("usekeyfilename")));
		jobEntrySFTP.setKeyFilename(cell.getAttribute("keyfilename"));
		jobEntrySFTP.setKeyPassPhrase(cell.getAttribute("keyfilepass"));
		
		jobEntrySFTP.setProxyType(cell.getAttribute("proxyType"));
		jobEntrySFTP.setProxyHost(cell.getAttribute("proxyHost"));
		jobEntrySFTP.setProxyPort(cell.getAttribute("proxyPort"));
		jobEntrySFTP.setProxyUsername(cell.getAttribute("proxyUsername"));
		jobEntrySFTP.setProxyPassword(cell.getAttribute("proxyPassword"));
		
		jobEntrySFTP.setCompression(cell.getAttribute("compression"));
		
		//next tab
		jobEntrySFTP.setCopyPrevious("Y".equalsIgnoreCase(cell.getAttribute("copyprevious")));
		jobEntrySFTP.setScpDirectory(cell.getAttribute("sftpdirectory"));
		jobEntrySFTP.setWildcard(cell.getAttribute("wildcard"));
		jobEntrySFTP.setRemove("Y".equalsIgnoreCase(cell.getAttribute("remove")));
		
		jobEntrySFTP.setTargetDirectory(cell.getAttribute("targetdirectory"));
		jobEntrySFTP.setcreateTargetFolder("Y".equalsIgnoreCase(cell.getAttribute("createtargetfolder")));
		jobEntrySFTP.setAddToResult("Y".equalsIgnoreCase(cell.getAttribute("isaddresult")));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		org.pentaho.di.job.entries.sftp.JobEntrySFTP jobEntrySFTP = (org.pentaho.di.job.entries.sftp.JobEntrySFTP) jobEntry;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		
		e.setAttribute("servername", jobEntrySFTP.getServerName());
		e.setAttribute("serverport", jobEntrySFTP.getServerPort());
		e.setAttribute("username", jobEntrySFTP.getUserName());
		e.setAttribute("password", jobEntrySFTP.getPassword() );
		e.setAttribute("usekeyfilename", jobEntrySFTP.isUseKeyFile() ? "Y" : "N");
		e.setAttribute("keyfilename", jobEntrySFTP.getKeyFilename());
		e.setAttribute("keyfilepass", jobEntrySFTP.getKeyPassPhrase() );
		
		e.setAttribute("proxyType", jobEntrySFTP.getProxyType());
		e.setAttribute("proxyHost", jobEntrySFTP.getProxyHost());
		e.setAttribute("proxyPort", jobEntrySFTP.getProxyPort());
		e.setAttribute("proxyUsername", jobEntrySFTP.getProxyUsername());
		e.setAttribute("proxyPassword", jobEntrySFTP.getProxyPassword() );
		
		e.setAttribute("compression", jobEntrySFTP.getCompression());
		
		// next tab
		e.setAttribute("copyprevious", jobEntrySFTP.isCopyPrevious() ? "Y" : "N");
		e.setAttribute("sftpdirectory", jobEntrySFTP.getScpDirectory());
		e.setAttribute("wildcard", jobEntrySFTP.getWildcard());
		e.setAttribute("remove", jobEntrySFTP.getRemove() ? "Y" : "N");
		
		e.setAttribute("targetdirectory", jobEntrySFTP.getTargetDirectory());
		e.setAttribute("createtargetfolder", jobEntrySFTP.iscreateTargetFolder() ? "Y" : "N");
		e.setAttribute("isaddresult", jobEntrySFTP.isAddToResult() ? "Y" : "N");
		return e;
	}

}
