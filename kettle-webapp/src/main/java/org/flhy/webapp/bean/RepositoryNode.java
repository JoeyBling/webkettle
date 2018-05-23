package org.flhy.webapp.bean;

import org.pentaho.di.repository.RepositoryObjectType;

public class RepositoryNode extends Ext3Node {

	public RepositoryNode(String text) {
		super(text);
	}
	
	private String path;

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}
	
	private String type;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	public static RepositoryNode initNode(String text, String path) {
		return initNode(text, path, null, false, false, null);
	}
	
	public static RepositoryNode initNode(String text, String path, RepositoryObjectType type) {
		if(RepositoryObjectType.TRANSFORMATION.equals(type))
			return initNode(text, path, "trans", true, false, type.getTypeDescription());
		else if(RepositoryObjectType.JOB.equals(type))
			return initNode(text, path, "job", true, false, type.getTypeDescription());
		return null;
	}
	
	public static RepositoryNode initNode(String text, String path, String iconCls, boolean leaf, boolean expanded, String type) {
		RepositoryNode node = new RepositoryNode(text);
		node.setPath(path);
		if(iconCls == null && !leaf)
			node.setIconCls("imageFolder");
		else
			node.setIconCls(iconCls);
		node.setLeaf(leaf);
		node.setExpanded(expanded);
		node.setType(type);
		return node;
	}
	
}
