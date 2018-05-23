package org.flhy.webapp.bean;

import java.util.UUID;

public class Ext3Node {

	private String id;
	private String text;
	private String iconCls = "imageFolder";
	private boolean expanded = false;
	private boolean leaf = false;
	
	public Ext3Node(String text) {
		this(UUID.randomUUID().toString().replaceAll("-", ""), text);
	}

	public Ext3Node(String id, String text) {
		this.id = id;
		this.text = text;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getId() {
		return id;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getText() {
		return text;
	}

	public String getIconCls() {
		return iconCls;
	}

	public void setIconCls(String iconCls) {
		this.iconCls = iconCls;
	}
	
	public boolean getExpanded() {
		return expanded;
	}

	public void setExpanded(boolean expanded) {
		this.expanded = expanded;
	}

	public boolean getLeaf() {
		return leaf;
	}

	public void setLeaf(boolean leaf) {
		this.leaf = leaf;
	}

	public static Ext3Node initNode(String id, String text) {
		return initNode(id, text, null, false);
	}
	
	public static Ext3Node initNode(String id, String text, boolean leaf) {
		return initNode(id, text, null, true);
	}
	
	public static Ext3Node initNode(String id, String text, String iconCls, boolean leaf) {
		Ext3Node fn = new Ext3Node(id, text);
		if(iconCls == null && !leaf)
			fn.setIconCls("imageFolder");
		else
			fn.setIconCls(iconCls);
		fn.setLeaf(leaf);
		
		return fn;
	}
	
}
