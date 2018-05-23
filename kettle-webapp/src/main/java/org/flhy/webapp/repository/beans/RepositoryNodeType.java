package org.flhy.webapp.repository.beans;


public class RepositoryNodeType {

	private static final int LOAD_TRANS = 0x0001;
	private static final int LOAD_JOB = 0x0002;
	
	public static boolean includeTrans(int loadElement) {
		return (loadElement & LOAD_TRANS) > 0;
	}
	
	public static boolean includeJob(int loadElement) {
		return (loadElement & LOAD_JOB) > 0;
	}
	
}
