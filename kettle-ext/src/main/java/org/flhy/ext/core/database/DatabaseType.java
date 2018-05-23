package org.flhy.ext.core.database;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import org.pentaho.di.core.database.DatabaseInterface;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.logging.LogChannel;
import org.pentaho.di.core.plugins.DatabasePluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.PluginTypeListener;

public class DatabaseType implements PluginTypeListener {

	private static final DatabaseType instance = new DatabaseType();
	
	public SortedMap<String, DatabaseInterface> connectionMap = new TreeMap<String, DatabaseInterface>();	//key=pluginName, value=plugin
	public Map<String, String> connectionNametoID = new HashMap<String, String>();	// key=pluginName, value=pluginId
	
	private DatabaseType() {
		PluginRegistry registry = PluginRegistry.getInstance();
		List<PluginInterface> plugins = registry.getPlugins(DatabasePluginType.class);

		registry.addPluginListener(DatabasePluginType.class, this);
		for (PluginInterface plugin : plugins) {
			this.pluginAdded(plugin);
		}
	}
	
	public static DatabaseType instance() {
		return instance;
	}
	
	public List loadSupportedDatabaseTypes() {
		ArrayList list = new ArrayList();
		for ( String value : connectionMap.keySet() ) {
	    	LinkedHashMap jsonObject = new LinkedHashMap();
	    	jsonObject.put("value", connectionNametoID.get(value));
	    	jsonObject.put("text", value);
	    	list.add(jsonObject);
	    }
		return list;
	}
	
	public List loadSupportedDatabaseMethodsByTypeId(String typeId) {
		String name = null;
		ArrayList list = new ArrayList();
		Iterator<Map.Entry<String, String>> iter = connectionNametoID.entrySet().iterator();
		while(iter.hasNext()) {
			Map.Entry<String, String> entry = iter.next();
			if(typeId.equals(entry.getValue())) {
				name = entry.getKey();
				break;
			}
		}
		if(name == null)
			return list;
		
		DatabaseInterface database = connectionMap.get( name );
		int[] acc = database.getAccessTypeList();

	    for ( int value : acc ) {
	    	LinkedHashMap jsonObject = new LinkedHashMap();
	    	jsonObject.put("value", value);
	    	jsonObject.put("text", DatabaseMeta.getAccessTypeDescLong( value ));
	    	list.add(jsonObject);
	    }
	    
	    return list;
	}

	@Override
	public void pluginAdded(Object serviceObject) {
		PluginInterface plugin = (PluginInterface) serviceObject;
		String pluginName = plugin.getName();
		try {
			DatabaseInterface databaseInterface = (DatabaseInterface) PluginRegistry.getInstance().loadClass(plugin);
			databaseInterface.setPluginId(plugin.getIds()[0]);
			databaseInterface.setName(pluginName);
			
			connectionMap.put(pluginName, databaseInterface);
			connectionNametoID.put(pluginName, databaseInterface.getPluginId());
		} catch (KettleException e) {
			String message = "Could not create connection entry for " + pluginName + ".  " + e.getCause().getClass().getName();
			System.out.println(message);
			LogChannel.GENERAL.logError(message);
		}
	}

	@Override
	public void pluginChanged(Object serviceObject) {
		PluginInterface plugin = (PluginInterface) serviceObject;
		String pluginName = plugin.getName();
		
		connectionMap.remove(pluginName);
		connectionNametoID.remove(pluginName);
	}

	@Override
	public void pluginRemoved(Object serviceObject) {
		pluginRemoved(serviceObject);
		pluginAdded(serviceObject);
	}
	
	
}
