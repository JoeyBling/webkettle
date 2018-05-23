EnterTextDialog = Ext.extend(Ext.Window, {
	width: 600,
	height: 400,
	layout: 'fit',
	modal: true,
	title: '数据库连接测试',
	initComponent: function() {
		var me = this;
		
		var textArea = this.textArea = new Ext.form.TextArea({
			readOnly: true
		});
		
		this.items = textArea;
		
		if(!this.bbar) {
			var bOk = new Ext.Button({
				text: '确定', handler: function() {
					me.close();
				}
			});
			
			this.bbar = ['->', bOk];
		}
		
		EnterTextDialog.superclass.initComponent.call(this);
		this.addEvents('sure');
	}, 
	
	setText: function(text) {
		this.textArea.setValue(text);
	}
});