package org.flhy.webapp.utils;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import org.flhy.ext.App;
import org.pentaho.di.core.SQLStatement;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.job.JobMeta;

public class GetJobSQLProgress {

	private static Class<?> PKG = GetSQLProgress.class;

	private JobMeta jobMeta;
	
	public GetJobSQLProgress(JobMeta jobMeta) {
		this.jobMeta = jobMeta;
	}
	
	public  List<SQLStatement> run() throws InvocationTargetException, InterruptedException {
		try {
			return jobMeta.getSQLStatements( App.getInstance().getRepository(), null );
        } catch ( KettleException e ) {
        	throw new InvocationTargetException( e, BaseMessages.getString(PKG, "GetSQLProgressDialog.RuntimeError.UnableToGenerateSQL.Exception", e.getMessage() ) );
        }
	}
	
}
