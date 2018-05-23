RowsFromResultDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "RowsFromResultDialog.Shell.Title"),
	width: 500,
	height: 400,
	initComponent: function() {
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'length', 'precision']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			RowsFromResultDialog.superclass.initData.apply(this, [cell]);
			
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		this.fitItems = {
			title: BaseMessages.getString(PKG, "RowsFromResultDialog.Fields.Label"),
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "RowsFromResultDialog.ColumnInfo.Fieldname"), dataIndex: 'name', width: 130, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: BaseMessages.getString(PKG, "RowsFromResultDialog.ColumnInfo.Type"), dataIndex: 'type', width: 120, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueMetaStore'),
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: BaseMessages.getString(PKG, "RowsFromResultDialog.ColumnInfo.Length"), dataIndex: 'length', width: 80, editor: new Ext.form.NumberField()
			},{
				header: BaseMessages.getString(PKG, "RowsFromResultDialog.ColumnInfo.Precision"), dataIndex: 'precision', width: 80, editor: new Ext.form.TextField()
			}],
			store: store
		};
		
		RowsFromResultDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('RowsFromResult', RowsFromResultDialog);