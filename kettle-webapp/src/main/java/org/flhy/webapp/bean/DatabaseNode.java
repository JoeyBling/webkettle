package org.flhy.webapp.bean;

public class DatabaseNode extends Ext3Node {

	public DatabaseNode(String text) {
		super(text);
	}
	
	private String nodeId;

	public String getNodeId() {
		return nodeId;
	}

	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}
	
	private String schema;
	
	public String getSchema() {
		return schema;
	}

	public void setSchema(String schema) {
		this.schema = schema;
	}

	public static DatabaseNode initNode(String text, String nodeId) {
		return initNode(text, nodeId, false);
	}
	
	public static DatabaseNode initNode(String text, String nodeId, String iconCls) {
		return initNode(text, iconCls, nodeId, true);
	}
	
	public static DatabaseNode initNode(String text, String nodeId, String iconCls, boolean leaf) {
		return initNode(text, iconCls, nodeId, leaf, false);
	}
	
	public static DatabaseNode initNode(String text, String nodeId, boolean expanded) {
		return initNode(text, null, nodeId, false, expanded);
	}
	
	public static DatabaseNode initNode(String text, String iconCls, String nodeId, boolean leaf, boolean expanded) {
		DatabaseNode node = new DatabaseNode(text);
		node.setLeaf(leaf);
		if(iconCls == null && !leaf)
			node.setIconCls("imageFolder");
		else
			node.setIconCls(iconCls);
		node.setExpanded(expanded);
		node.setNodeId(nodeId);
		return node;
	}
	
}
