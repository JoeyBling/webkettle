MergeRowsDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "MergeRowsDialog.Shell.Label"),
	width: 600,
	height: 400,
	initComponent: function() {
		var me = this;
		
		var wReference = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "MergeRowsDialog.Reference.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		
		var wCompare = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "MergeRowsDialog.Compare.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		
		var wFlagfield = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "MergeRowsDialog.FlagField.Label"), anchor: '-10'});
		
		var keyStore = new Ext.data.JsonStore({
			fields: ['key']
		});
		var valueStore = new Ext.data.JsonStore({
			fields: ['value']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			MergeRowsDialog.superclass.initData.apply(this, [cell]);
			
			wReference.setValue(cell.getAttribute('reference'));
			wCompare.setValue(cell.getAttribute('compare'));
			wFlagfield.setValue(cell.getAttribute('flag_field'));
			keyStore.loadData(Ext.decode(cell.getAttribute('keys')));
			valueStore.loadData(Ext.decode(cell.getAttribute('values')));
		};
		
		this.saveData = function(){
			var data = {};
			data.reference = wReference.getValue();
			data.compare = wCompare.getValue();
			data.flag_field = wFlagfield.getValue();
			data.keys = Ext.encode(keyStore.toJson());
			data.values = Ext.encode(valueStore.toJson());
			
			return data;
		};
		
		var keyGrid = new KettleEditorGrid({
			flex: 1,
			margins: '0 3 0 0',
			title: BaseMessages.getString(PKG, "MergeRowsDialog.Keys.Label"),
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "MergeRowsDialog.ColumnInfo.KeyField"), dataIndex: 'key', width: 100, editor: new Ext.form.TextField()
			}],
			store: keyStore
		});
		
		var valueGrid = new KettleEditorGrid({
			flex: 1,
			margins: '0 0 0 3',
			title: BaseMessages.getString(PKG, "MergeRowsDialog.ColumnInfo.ValueField"),
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "MergeRowsDialog.ColumnInfo.ValueField"), dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
			}],
			store: valueStore
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 100,
					xtype: 'KettleForm',
					margins: '0 0 6 0',
					items: [wReference, wCompare, wFlagfield]
				}, {
					region: 'center',
					layout:'hbox',
					layoutConfig: {
					    align : 'stretch',
					    pack  : 'start',
					},
					border: false,
					items: [keyGrid, valueGrid]
				}]
		};
		
		
		MergeRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('MergeRows', MergeRowsDialog);