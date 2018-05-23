package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.encryption.Encr;
import org.pentaho.di.job.entries.ftpdelete.JobEntryFTPDelete;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("FTP_DELETE")
@Scope("prototype")
public class JobEntryFTPDELETE extends AbstractJobEntry{
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		JobEntryFTPDelete jobEntryFTPDELTE = (JobEntryFTPDelete) jobEntry;
		  jobEntryFTPDELTE.setProtocol(cell.getAttribute("protocol"));

	  jobEntryFTPDELTE.setServerName(cell.getAttribute("serverName"));
	  jobEntryFTPDELTE.setPort(cell.getAttribute("serverPort"));
		jobEntryFTPDELTE.setUserName(cell.getAttribute("username"));
		jobEntryFTPDELTE.setPassword(cell.getAttribute("password"));
		jobEntryFTPDELTE.setFTPSConnectionType(Const.toInt(cell.getAttribute("ftps_connection_type"),0));

		jobEntryFTPDELTE.setUseProxy("Y".equalsIgnoreCase(cell.getAttribute("useproxy")));
		jobEntryFTPDELTE.setProxyHost(cell.getAttribute("proxy_host"));
		jobEntryFTPDELTE.setProxyPort(cell.getAttribute("proxy_port"));
		jobEntryFTPDELTE.setProxyUsername(cell.getAttribute("proxy_username"));
		jobEntryFTPDELTE.setProxyPassword(cell.getAttribute("proxy_password"));
		jobEntryFTPDELTE.setUsePublicKey("Y".equalsIgnoreCase(cell.getAttribute("publicpublickey")));
		jobEntryFTPDELTE.setKeyFilename(cell.getAttribute("keyfilename"));
		jobEntryFTPDELTE.setKeyFilePass(cell.getAttribute("keyfilepass"));

		jobEntryFTPDELTE.setTimeout(Const.toInt(cell.getAttribute("timeout"),0));
		jobEntryFTPDELTE.setActiveConnection("Y".equalsIgnoreCase(cell.getAttribute("active")));

		jobEntryFTPDELTE.setCopyPrevious("Y".equalsIgnoreCase(cell.getAttribute("copyprevious")));
		jobEntryFTPDELTE.setFtpDirectory(cell.getAttribute("ftpdirectory"));
		jobEntryFTPDELTE.setWildcard(cell.getAttribute("wildcard"));
		
		
		jobEntryFTPDELTE.setSuccessCondition(cell.getAttribute("success_condition"));
		jobEntryFTPDELTE.setLimitSuccess(cell.getAttribute("nr_limit_success"));
		
		jobEntryFTPDELTE.setSocksProxyHost(cell.getAttribute("socksproxy_host"));
		jobEntryFTPDELTE.setSocksProxyPort(cell.getAttribute("socksproxy_port"));
		jobEntryFTPDELTE.setSocksProxyUsername(cell.getAttribute("socksproxy_username"));
		jobEntryFTPDELTE.setSocksProxyPassword(cell.getAttribute("socksproxy_password"));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		JobEntryFTPDelete jobEntryFTPDELTE = (JobEntryFTPDelete) jobEntry;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		e.setAttribute("protocol",jobEntryFTPDELTE.getProtocol());

		e.setAttribute("serverName", jobEntryFTPDELTE.getServerName());
		e.setAttribute("serverPort", jobEntryFTPDELTE.getPort());
		e.setAttribute("username", jobEntryFTPDELTE.getUserName());
		e.setAttribute("password", jobEntryFTPDELTE.getPassword() );
		e.setAttribute("ftps_connection_type", jobEntryFTPDELTE.getFTPSConnectionType()+ "");

		e.setAttribute("useproxy", jobEntryFTPDELTE.isUseProxy()? "Y" : "N");
		e.setAttribute("proxy_host", jobEntryFTPDELTE.getProxyHost());
		e.setAttribute("proxy_port", jobEntryFTPDELTE.getProxyPort());
		e.setAttribute("proxy_username", jobEntryFTPDELTE.getProxyUsername());
		e.setAttribute("proxy_password", jobEntryFTPDELTE.getProxyPassword());
		
		e.setAttribute("publicpublickey", jobEntryFTPDELTE.isUsePublicKey()? "Y" : "N");
		e.setAttribute("keyfilename", jobEntryFTPDELTE.getKeyFilename());
		e.setAttribute("keyfilepass", jobEntryFTPDELTE.getKeyFilePass());

		e.setAttribute("timeout", jobEntryFTPDELTE.getTimeout()+ "");
		e.setAttribute("active", jobEntryFTPDELTE.isActiveConnection()? "Y" : "N");
		
		e.setAttribute("ftpdirectory", jobEntryFTPDELTE.getFtpDirectory());
		e.setAttribute("copyprevious", jobEntryFTPDELTE.isCopyPrevious()? "Y" : "N" );
		e.setAttribute("wildcard", jobEntryFTPDELTE.getWildcard());
		
		e.setAttribute("success_condition", jobEntryFTPDELTE.getSuccessCondition());
		e.setAttribute("nr_limit_success", jobEntryFTPDELTE.getLimitSuccess());

		e.setAttribute("socksproxy_host", jobEntryFTPDELTE.getSocksProxyHost());
		e.setAttribute("socksproxy_port", jobEntryFTPDELTE.getSocksProxyPort());
		e.setAttribute("socksproxy_username", jobEntryFTPDELTE.getSocksProxyUsername());
		e.setAttribute("socksproxy_password", jobEntryFTPDELTE.getSocksProxyPassword());
		return e;
	}

}
