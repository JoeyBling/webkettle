package org.flhy.webapp.job.entries.sftp;

import java.net.InetAddress;

import org.flhy.ext.PluginFactory;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.utils.JsonUtils;
import org.pentaho.di.core.Const;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entries.sftp.JobEntrySFTP;
import org.pentaho.di.job.entries.sftp.SFTPClient;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/sftp")
public class SftpController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/test")
	protected void sftptest(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.JOB_CODEC);
		JobMeta jobMeta = (JobMeta) codec.decode(graphXml);
		
		JobEntryCopy jobEntryCopy = jobMeta.findJobEntry(stepName);
		JobEntrySFTP sftp = (JobEntrySFTP) jobEntryCopy.getEntry();
		 
		String info = "";
		SFTPClient sftpclient = null;
		try {
			String servername = jobMeta.environmentSubstitute(sftp.getServerName());
			String serverport = jobMeta.environmentSubstitute(sftp.getServerPort());
			String username = jobMeta.environmentSubstitute(sftp.getUserName());
			String password = jobMeta.environmentSubstitute(sftp.getPassword());
			String keyFilename = jobMeta.environmentSubstitute(sftp.getKeyFilename());
			String keyFilePass = jobMeta.environmentSubstitute(sftp.getKeyPassPhrase());

			sftpclient = new SFTPClient(InetAddress.getByName(servername), Const.toInt(serverport, 22), username, keyFilename, keyFilePass);
			String proxyHost = jobMeta.environmentSubstitute(sftp.getProxyHost());
			String proxyPort = jobMeta.environmentSubstitute(sftp.getProxyPort());
			String proxyUsername = jobMeta.environmentSubstitute(sftp.getProxyUsername());
			String proxyPass = jobMeta.environmentSubstitute(sftp.getProxyPassword());
			String proxyType = jobMeta.environmentSubstitute(sftp.getProxyType());
			if (!Const.isEmpty(proxyHost)) {
				sftpclient.setProxy(proxyHost, proxyPort, proxyUsername, proxyPass, proxyType);
			}
			sftpclient.login(password);

			JsonUtils.success(BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.Connected.Title.Ok" ), 
					BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.Connected.OK", sftp.getServerName() ) + Const.CR);
			return;
		} catch (Exception e) {
			if (sftpclient != null) {
				try {
					sftpclient.disconnect();
				} catch (Exception ignored) {
				}
				sftpclient = null;
			}
			info = e.getMessage();
		}
		
		JsonUtils.fail(BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.ErrorConnect.Title.Bad" ), 
				 BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.ErrorConnect.NOK", sftp.getServerName(), info) + Const.CR);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/testdir")
	protected void sftpdirtest(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.JOB_CODEC);
		JobMeta jobMeta = (JobMeta) codec.decode(graphXml);
		
		JobEntryCopy jobEntryCopy = jobMeta.findJobEntry(stepName);
		JobEntrySFTP sftp = (JobEntrySFTP) jobEntryCopy.getEntry();
		 
		String info = "";
		SFTPClient sftpclient = null;
		try {
			String servername = jobMeta.environmentSubstitute(sftp.getServerName());
			String serverport = jobMeta.environmentSubstitute(sftp.getServerPort());
			String username = jobMeta.environmentSubstitute(sftp.getUserName());
			String password = jobMeta.environmentSubstitute(sftp.getPassword());
			String keyFilename = jobMeta.environmentSubstitute(sftp.getKeyFilename());
			String keyFilePass = jobMeta.environmentSubstitute(sftp.getKeyPassPhrase());

			sftpclient = new SFTPClient(InetAddress.getByName(servername), Const.toInt(serverport, 22), username, keyFilename, keyFilePass);
			String proxyHost = jobMeta.environmentSubstitute(sftp.getProxyHost());
			String proxyPort = jobMeta.environmentSubstitute(sftp.getProxyPort());
			String proxyUsername = jobMeta.environmentSubstitute(sftp.getProxyUsername());
			String proxyPass = jobMeta.environmentSubstitute(sftp.getProxyPassword());
			String proxyType = jobMeta.environmentSubstitute(sftp.getProxyType());
			if (!Const.isEmpty(proxyHost)) {
				sftpclient.setProxy(proxyHost, proxyPort, proxyUsername, proxyPass, proxyType);
			}
			sftpclient.login(password);

			if(sftpclient.folderExists(sftp.getScpDirectory())) {
				JsonUtils.success(BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.FolderExists.Title.Ok" ), 
						BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.FolderExists.OK", sftp.getScpDirectory() ) + Const.CR);
				return;
			}
		} catch (Exception e) {
			if (sftpclient != null) {
				try {
					sftpclient.disconnect();
				} catch (Exception ignored) {
				}
				sftpclient = null;
			}
			info = e.getMessage();
		}
		
		JsonUtils.fail(BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.ErrorConnect.Title.Bad" ), 
				 BaseMessages.getString( JobEntrySFTP.class, "JobSFTP.ErrorConnect.NOK", sftp.getServerName(), info) + Const.CR);
	}
	
}
