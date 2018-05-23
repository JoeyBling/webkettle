package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entries.ftpsget.FTPSConnection;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.trans.steps.textfileoutput.TextFileOutputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;



import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("FTPS_PUT")
@Scope("prototype")
public class JobEntryFTPS_PUT extends AbstractJobEntry{
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.ftpsput.JobEntryFTPSPUT jobEntryFTPSPUT = (org.pentaho.di.job.entries.ftpsput.JobEntryFTPSPUT) jobEntry;
		//一般---服务器设置
		jobEntryFTPSPUT.setUserName(cell.getAttribute("username"));
		jobEntryFTPSPUT.setServerPort(cell.getAttribute("serverport"));
		jobEntryFTPSPUT.setPassword(cell.getAttribute("password"));
		jobEntryFTPSPUT.setServerName(cell.getAttribute("servername"));
		jobEntryFTPSPUT.setProxyHost(cell.getAttribute("proxyserver"));
		jobEntryFTPSPUT.setProxyPort(cell.getAttribute("proxyserverport"));
		jobEntryFTPSPUT.setProxyUsername(cell.getAttribute("proxyserverusername"));
		jobEntryFTPSPUT.setProxyPassword(cell.getAttribute("proxyserverpwd"));
		int connectiontype=0;
		try {
			connectiontype=Integer.parseInt( FTPSConnection.getConnectionTypeCode(cell.getAttribute("connectiontype")) );
		} catch (Exception e) {	}
		jobEntryFTPSPUT.setConnectionType( connectiontype );

		
		//一般---高级设置
		jobEntryFTPSPUT.setBinaryMode("Y".equals(cell.getAttribute("binarymode") ));
		String timeoutString = cell.getAttribute("timeout");
		if( !StringUtils.isEmpty(timeoutString) ){
			boolean isDigital=false;
			try{ Integer.parseInt( timeoutString ) ;isDigital=true;}catch(Exception e){}
			 if( isDigital )
				 jobEntryFTPSPUT.setTimeout( Integer.parseInt( timeoutString ) );
		}
		jobEntryFTPSPUT.setActiveConnection("Y".equals(cell.getAttribute("useraliveftpconnection")));
//		jobEntryFTPSPUT.setControlEncoding(cell.getAttribute("controlencode"));
		
		//文件---源（本地）文件
		jobEntryFTPSPUT.setLocalDirectory(cell.getAttribute("localdir"));
		jobEntryFTPSPUT.setWildcard(cell.getAttribute("tongpeifu"));
		jobEntryFTPSPUT.setRemove("Y".equals(cell.getAttribute("dellocalfileafterupload")));
		jobEntryFTPSPUT.setOnlyPuttingNewFiles("Y".equals(cell.getAttribute("notcoverremotefiles")));
		
		//文件---目标（远程）文件
		jobEntryFTPSPUT.setRemoteDirectory(cell.getAttribute("remotedir"));
		
		//Sockets代理 ---代理
//		jobEntryFTPSPUT.setProxyHost(cell.getAttribute("wProxy2server"));
//		jobEntryFTPSPUT.setProxyPort(cell.getAttribute("wProxy2serverport"));
//		jobEntryFTPSPUT.setProxyUsername(cell.getAttribute("proxy2serverusername"));
//		jobEntryFTPSPUT.setProxyPassword(cell.getAttribute("proxy2serverpwd"));

	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		org.pentaho.di.job.entries.ftpsput.JobEntryFTPSPUT jobEntryFTPSPUT = (org.pentaho.di.job.entries.ftpsput.JobEntryFTPSPUT) jobEntry;

		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		//一般---服务器设置
		e.setAttribute("servername", jobEntryFTPSPUT.getServerName());
		e.setAttribute("serverport", jobEntryFTPSPUT.getServerPort());
		e.setAttribute("username", jobEntryFTPSPUT.getUserName());
		e.setAttribute("password", jobEntryFTPSPUT.getPassword());
		e.setAttribute("proxyserver", jobEntryFTPSPUT.getProxyHost());
		e.setAttribute("proxyserverport", jobEntryFTPSPUT.getProxyPort());
		e.setAttribute("proxyserverusername", jobEntryFTPSPUT.getProxyUsername());
		e.setAttribute("proxyserverpwd", jobEntryFTPSPUT.getProxyPassword());
		e.setAttribute("connectiontype", FTPSConnection.getConnectionTypeDesc(jobEntryFTPSPUT.getConnectionType()));
//		System.out.println( "得到的FTP描述 信息：：：：：\n"+FTPSConnection.getConnectionTypeDesc(jobEntryFTPSPUT.getConnectionType()));
//		jobEntryFTPSPUT.getc

		//一般----高级设置
		e.setAttribute("binarymode", jobEntryFTPSPUT.isBinaryMode() ?"Y":"N");
		e.setAttribute("timeout", jobEntryFTPSPUT.getTimeout()+"");
		e.setAttribute("usealiveftpconnection",  jobEntryFTPSPUT.isActiveConnection() ?"Y":"N");
//		e.setAttribute("contrlEncode",jobEntryFTPSPUT.getControlEncoding() );

		//文件---源（本地）文件
		e.setAttribute("localdir", jobEntryFTPSPUT.getLocalDirectory());
		e.setAttribute("tongpeifu", jobEntryFTPSPUT.getWildcard());
		e.setAttribute("dellocalfilesafterupload", jobEntryFTPSPUT.getRemove()?"Y":"N");
		e.setAttribute("notcoverremotefiles", jobEntryFTPSPUT.isOnlyPuttingNewFiles()?"Y":"N");
		
		//文件---目标（远程）文件
		e.setAttribute("remotedir", jobEntryFTPSPUT.getRemoteDirectory());
		
		//Sockets代理---代理
//		e.setAttribute("proxy2server", jobEntryFTPSPUT.getProxyHost());
//		e.setAttribute("proxy2serverport", jobEntryFTPSPUT.getProxyPort());
//		e.setAttribute("proxy2serverusername", jobEntryFTPSPUT.getProxyUsername());
//		e.setAttribute("proxy2serverpwd", jobEntryFTPSPUT.getProxyPassword());
		
		return e;
	}

}
