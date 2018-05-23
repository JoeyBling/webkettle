package org.flhy.webapp.utils;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import org.pentaho.di.core.SQLStatement;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.trans.TransMeta;

public class GetSQLProgress {
	
	private static Class<?> PKG = GetSQLProgress.class;

	private TransMeta transMeta;
	
	public GetSQLProgress(TransMeta transMeta) {
		this.transMeta = transMeta;
	}
	
	public  List<SQLStatement> run() throws InvocationTargetException, InterruptedException {
		try {
			return transMeta.getSQLStatements( null );
        } catch ( KettleException e ) {
        	throw new InvocationTargetException( e, BaseMessages.getString(PKG, "GetSQLProgressDialog.RuntimeError.UnableToGenerateSQL.Exception", e.getMessage() ) );
        }
	}
	
}
