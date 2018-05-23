package org.flhy.ext.repository;

import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.RepositoryPluginType;
import org.pentaho.di.repository.RepositoriesMeta;
import org.pentaho.di.repository.RepositoryMeta;
import org.pentaho.di.repository.filerep.KettleFileRepositoryMeta;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;

public class RepositoryCodec {

	public static JSONObject encode(RepositoryMeta repositoryMeta) {
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("name", repositoryMeta.getName());
		jsonObject.put("description", repositoryMeta.getDescription());
		jsonObject.put("type", repositoryMeta.getId());
		
		if(repositoryMeta instanceof KettleDatabaseRepositoryMeta) {
			KettleDatabaseRepositoryMeta input = (KettleDatabaseRepositoryMeta) repositoryMeta;
			JSONObject extraOptions = new JSONObject();
			extraOptions.put("database", input.getConnection().getName());
			jsonObject.put("extraOptions", extraOptions);
		} else if(repositoryMeta instanceof KettleFileRepositoryMeta) {
			KettleFileRepositoryMeta input = (KettleFileRepositoryMeta) repositoryMeta;
			
			JSONObject extraOptions = new JSONObject();
			extraOptions.put("basedir", input.getBaseDirectory());
			extraOptions.put("hidingHidden", input.isHidingHiddenFiles() ? "Y" : "N");
			extraOptions.put("readOnly", input.isReadOnly() ? "Y" : "N");
			jsonObject.put("extraOptions", extraOptions);
		}
		
		return jsonObject;
	}
	
	public static RepositoryMeta decode(JSONObject jsonObject) throws KettleException {
		String id = jsonObject.optString("type");
		RepositoryMeta repositoryMeta = PluginRegistry.getInstance().loadClass( RepositoryPluginType.class, id, RepositoryMeta.class );
		repositoryMeta.setName(jsonObject.optString("name"));
		repositoryMeta.setDescription(jsonObject.optString("description"));
		
		if(repositoryMeta instanceof KettleDatabaseRepositoryMeta) {
			KettleDatabaseRepositoryMeta kettleDatabaseRepositoryMeta = (KettleDatabaseRepositoryMeta) repositoryMeta;
			
			RepositoriesMeta input = new RepositoriesMeta();
			if (input.readData()) {
				DatabaseMeta connection = input.searchDatabase(jsonObject.optJSONObject("extraOptions").optString("database"));
				kettleDatabaseRepositoryMeta.setConnection(connection);
			}
		} else if(repositoryMeta instanceof KettleFileRepositoryMeta) {
			KettleFileRepositoryMeta input = (KettleFileRepositoryMeta) repositoryMeta;
			
			JSONObject extraOptions = jsonObject.optJSONObject("extraOptions");
			input.setBaseDirectory(extraOptions.optString("basedir"));
			input.setReadOnly("Y".equalsIgnoreCase(extraOptions.optString("readOnly")));
			input.setHidingHiddenFiles("Y".equalsIgnoreCase(extraOptions.optString("hidingHidden")));
		}
		
		return repositoryMeta;
	}
}
