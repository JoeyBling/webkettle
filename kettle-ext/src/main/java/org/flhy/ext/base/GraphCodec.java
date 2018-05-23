package org.flhy.ext.base;

import org.pentaho.di.base.AbstractMeta;

public interface GraphCodec {

	public String encode(AbstractMeta meta) throws Exception;
	public AbstractMeta decode(String graphXml) throws Exception;
	
	public static final String TRANS_CODEC = "TransGraph";
	public static final String JOB_CODEC = "JobGraph";
	
}
