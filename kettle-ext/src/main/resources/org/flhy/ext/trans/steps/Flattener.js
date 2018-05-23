FlattenerDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "FlattenerDialog.Shell.Title"),
	width: 400,
	height: 350,
	initComponent: function() {
		var me = this;
		
		var wField = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "FlattenerDialog.FlattenField.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label'))
	    });
		
		var store = new Ext.data.JsonStore({
			fields: ['name']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			FlattenerDialog.superclass.initData.apply(this, [cell]);
			
			wField.setValue(cell.getAttribute('field_name'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.field_name = wField.getValue();
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		var grid = new KettleEditorGrid({
			title: BaseMessages.getString(PKG, "FlattenerDialog.TargetField.Label"),
			region: 'center',
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "FlattenerDialog.ColumnInfo.TargetField"), dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 40,
					xtype: 'KettleForm',
					margins: '0 0 5 0',
					items: [wField]
				}, grid]
		};
		
		
		FlattenerDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Flattener', FlattenerDialog);