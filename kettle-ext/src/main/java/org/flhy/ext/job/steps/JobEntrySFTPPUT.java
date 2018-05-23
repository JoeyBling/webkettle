package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.encryption.Encr;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("SFTPPUT")
@Scope("prototype")
public class JobEntrySFTPPUT extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.sftpput.JobEntrySFTPPUT jobEntrySFTPPUT = (org.pentaho.di.job.entries.sftpput.JobEntrySFTPPUT) jobEntry;
		
		jobEntrySFTPPUT.setServerName(cell.getAttribute("servername"));
		jobEntrySFTPPUT.setServerPort(cell.getAttribute("serverport"));
		jobEntrySFTPPUT.setUserName(cell.getAttribute("username"));
		jobEntrySFTPPUT.setPassword(Encr.decryptPasswordOptionallyEncrypted(cell.getAttribute("password")));
		jobEntrySFTPPUT.setUseKeyFile("Y".equalsIgnoreCase(cell.getAttribute("usekeyfilename")));
		jobEntrySFTPPUT.setKeyFilename(cell.getAttribute("keyfilename"));
		jobEntrySFTPPUT.setKeyPassPhrase(Encr.decryptPasswordOptionallyEncrypted(cell.getAttribute("keyfilepass")));
		
		jobEntrySFTPPUT.setProxyType(cell.getAttribute("proxyType"));
		jobEntrySFTPPUT.setProxyHost(cell.getAttribute("proxyHost"));
		jobEntrySFTPPUT.setProxyPort(cell.getAttribute("proxyPort"));
		jobEntrySFTPPUT.setProxyUsername(cell.getAttribute("proxyUsername"));
		jobEntrySFTPPUT.setProxyPassword(Encr.decryptPasswordOptionallyEncrypted(cell.getAttribute("proxyPassword")));
		
		jobEntrySFTPPUT.setCompression(cell.getAttribute("compression"));
		
		//next tab
		jobEntrySFTPPUT.setCopyPrevious("Y".equalsIgnoreCase(cell.getAttribute("copyprevious")));
		jobEntrySFTPPUT.setCopyPreviousFiles("Y".equalsIgnoreCase(cell.getAttribute("copypreviousfiles")));
		jobEntrySFTPPUT.setLocalDirectory(cell.getAttribute("localdirectory"));
		jobEntrySFTPPUT.setWildcard(cell.getAttribute("wildcard"));
		jobEntrySFTPPUT.setSuccessWhenNoFile("Y".equalsIgnoreCase(cell.getAttribute("successWhenNoFile")));
		jobEntrySFTPPUT.setAfterFTPS(jobEntrySFTPPUT.getAfterSFTPPutByCode( Const.NVL( cell.getAttribute( "aftersftpput" ), "" ) ));
		jobEntrySFTPPUT.setDestinationFolder(cell.getAttribute("destinationfolder"));
		jobEntrySFTPPUT.setCreateDestinationFolder("Y".equalsIgnoreCase(cell.getAttribute("createdestinationfolder")));
		jobEntrySFTPPUT.setAddFilenameResut("Y".equalsIgnoreCase(cell.getAttribute("addFilenameResut")));
		
		jobEntrySFTPPUT.setScpDirectory(cell.getAttribute("sftpdirectory"));
		jobEntrySFTPPUT.setCreateRemoteFolder("Y".equalsIgnoreCase(cell.getAttribute("createRemoteFolder")));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		org.pentaho.di.job.entries.sftpput.JobEntrySFTPPUT jobEntrySFTPPUT = (org.pentaho.di.job.entries.sftpput.JobEntrySFTPPUT) jobEntry;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		
		e.setAttribute("servername", jobEntrySFTPPUT.getServerName());
		e.setAttribute("serverport", jobEntrySFTPPUT.getServerPort());
		e.setAttribute("username", jobEntrySFTPPUT.getUserName());
		e.setAttribute("password", Encr.encryptPasswordIfNotUsingVariables( jobEntrySFTPPUT.getPassword() ));
		e.setAttribute("usekeyfilename", jobEntrySFTPPUT.isUseKeyFile() ? "Y" : "N");
		e.setAttribute("keyfilename", jobEntrySFTPPUT.getKeyFilename());
		e.setAttribute("keyfilepass", Encr.encryptPasswordIfNotUsingVariables( jobEntrySFTPPUT.getKeyPassPhrase()) );
		
		e.setAttribute("proxyType", jobEntrySFTPPUT.getProxyType());
		e.setAttribute("proxyHost", jobEntrySFTPPUT.getProxyHost());
		e.setAttribute("proxyPort", jobEntrySFTPPUT.getProxyPort());
		e.setAttribute("proxyUsername", jobEntrySFTPPUT.getProxyUsername());
		e.setAttribute("proxyPassword", Encr.encryptPasswordIfNotUsingVariables( jobEntrySFTPPUT.getProxyPassword() ));
		
		e.setAttribute("compression", jobEntrySFTPPUT.getCompression());
		
		// next tab
		e.setAttribute("copyprevious", jobEntrySFTPPUT.isCopyPrevious() ? "Y" : "N");
		e.setAttribute("copypreviousfiles", jobEntrySFTPPUT.isCopyPreviousFiles() ? "Y" : "N");
		e.setAttribute("localdirectory", jobEntrySFTPPUT.getLocalDirectory());
		e.setAttribute("wildcard", jobEntrySFTPPUT.getWildcard());
		e.setAttribute("successWhenNoFile", jobEntrySFTPPUT.isSuccessWhenNoFile() ? "Y" : "N");
		e.setAttribute("aftersftpput", jobEntrySFTPPUT.getAfterSFTPPutCode( jobEntrySFTPPUT.getAfterFTPS() ));
		e.setAttribute("destinationfolder", jobEntrySFTPPUT.getDestinationFolder());
		e.setAttribute("createdestinationfolder", jobEntrySFTPPUT.isCreateDestinationFolder() ? "Y" : "N");
		e.setAttribute("addFilenameResut", jobEntrySFTPPUT.isAddFilenameResut() ? "Y" : "N");
		
		e.setAttribute("sftpdirectory", jobEntrySFTPPUT.getScpDirectory());
		e.setAttribute("createRemoteFolder", jobEntrySFTPPUT.isCreateRemoteFolder() ? "Y" : "N");
		return e;
	}

}
