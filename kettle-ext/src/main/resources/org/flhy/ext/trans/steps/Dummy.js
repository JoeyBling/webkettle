DummyDialog = Ext.extend(KettleDialog, {
	title: 'Dummy',
	width: 300,
	height: 120,
	initComponent: function() {
		this.fitItems = [];
		DummyDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Dummy', DummyDialog);