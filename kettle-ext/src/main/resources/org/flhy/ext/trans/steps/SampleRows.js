SampleRowsDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "SampleRowsDialog.Shell.Title"),
	width: 300,
	height: 190,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();

		var wLinesRange = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "SampleRowsDialog.LinesRange.Label"), anchor: '-10', value: cell.getAttribute('linesrange')});
		var wLineNumberField = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "SampleRowsDialog.LineNumberField.Label"), anchor: '-10', value: cell.getAttribute('linenumfield')});
		
		this.fitItem = new KettleForm({
			labelWidth: 80,
			items: [wLinesRange, wLineNumberField]
		});
		
		this.getValues = function(){
			return {
				linesrange: wLinesRange.getValue(),
				linenumfield: wLineNumberField.getValue()
			};
		};
		
		SampleRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SampleRows', SampleRowsDialog);