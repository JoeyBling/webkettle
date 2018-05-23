TextAreaDialog = Ext.extend(Ext.Window, {
	
	width: 1000,
	height: 500,
	layout: 'fit',
	closeAction: 'close',
	
	initComponent: function() {
		var textArea = this.items = new Ext.form.TextArea();
		this.initData = function(v) {
			textArea.setValue(v);
		};
		
		TextAreaDialog.superclass.initComponent.call(this);
	}
});