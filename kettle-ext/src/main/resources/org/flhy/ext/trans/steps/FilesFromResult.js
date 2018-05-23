FilesFromResultDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "FilesFromResultDialog.Shell.Title"),
	width: 300,
	height: 120,
	initComponent: function() {
		this.fitItems = [];
		FilesFromResultDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FilesFromResult', FilesFromResultDialog);