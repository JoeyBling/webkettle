package org.flhy.webapp.bean;

import java.util.ArrayList;
import java.util.List;

public class Ext3CheckableNode extends Ext3Node {
	
	private boolean checked = false;
	private List children = new ArrayList(0);

	public Ext3CheckableNode(String text) {
		super(text);
	}

	public Ext3CheckableNode(String id, String text) {
		super(id, text);
	}

	public boolean getChecked() {
		return checked;
	}

	public void setChecked(boolean checked) {
		this.checked = checked;
	}
	
	public List getChildren() {
		return children;
	}

	public void setChildren(List children) {
		this.children = children;
	}
	
}
