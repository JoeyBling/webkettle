package org.flhy.webapp;

import org.flhy.ext.App;
import org.flhy.ext.core.PropsUI;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;

public class RepositoryTest {

	@Before
	public void getDatabaseRepository() throws KettleException {
		KettleEnvironment.init();
		PropsUI.init( "KettleWebConsole", Props.TYPE_PROPERTIES_KITCHEN );
		
		DatabaseMeta dbMeta = new DatabaseMeta();
		dbMeta.setName("defaultDatabase");
		dbMeta.setDBName("kettle");
		dbMeta.setDatabaseType("MySQL");
		dbMeta.setAccessType(0);
		dbMeta.setHostname("localhost");
		dbMeta.setServername("localhost");
		dbMeta.setDBPort("3306");
		
		dbMeta.setUsername("root");
		dbMeta.setPassword("root");
		
		
		KettleDatabaseRepositoryMeta meta = new KettleDatabaseRepositoryMeta();
		meta.setName("defaultRepository");
		meta.setId("defaultRepository");
		meta.setConnection(dbMeta);
		
		KettleDatabaseRepository repository = new KettleDatabaseRepository();
		repository.init(meta);
		repository.connect("admin", "admin");
		
		App.getInstance().selectRepository(repository);
	}
	
	@Test
	public void getRootNode() throws KettleException {
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface path = repository.findDirectory("");
		RepositoryDirectoryInterface newdir = repository.createRepositoryDirectory(path, "测试");
		
		
	}
	
}
