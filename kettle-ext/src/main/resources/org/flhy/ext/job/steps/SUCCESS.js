JobEntrySuccessDialog = Ext.extend(KettleDialog, {
	title: 'SUCCESS',
	width: 300,
	height: 120,
	initComponent: function() {
		this.fitItems = [];
		JobEntrySuccessDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SUCCESS', JobEntrySuccessDialog);