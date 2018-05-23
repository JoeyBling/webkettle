RowsToResultDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "RowsToResultDialog.Shell.Title"),
	width: 300,
	height: 120,
	initComponent: function() {
		this.fitItems = [];
		RowsToResultDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('RowsToResult', RowsToResultDialog);