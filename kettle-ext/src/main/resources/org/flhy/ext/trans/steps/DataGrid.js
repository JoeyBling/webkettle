DataGridDialog = Ext.extend(KettleTabDialog, {
	title: BaseMessages.getString(PKG, "DataGridDialog.DialogTitle"),
	width: 700,
	height: 500,
	initComponent: function() {
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format', 'length', 'precision', 'currencyType', 'decimal', 'group', 'value', {name:'nullable', type:'boolean'}]
		});
		
		var wData = new KettleDynamicGrid({
			title: BaseMessages.getString(PKG, "DataGridDialog.Data.Label"),
			rowNumberer: true,
		});
		
		var initDataStore = function() {
			var columns = [];
			store.each(function(rec) {
				columns.push({header: rec.get('name'), dataIndex: rec.get('name'), width: 100, editor: new Ext.form.TextField()});
			});
			
			var records = [];
			wData.getStore().each(function(datarec) {
				var record = {};
				store.each(function(rec) {
					var field = rec.get('name');
					record[field] = datarec.get(field);
				});
				records.push(record);
			});
			
			wData.loadMetaAndValue({
				columns: columns, records: records
			});
		};
		
		this.initData = function() {
			var cell = this.getInitData();
			DataGridDialog.superclass.initData.apply(this, [cell]);
			
			store.loadData(Ext.decode(cell.getAttribute('fields')));
			var columns = [];
			store.each(function(rec) {
				columns.push({header: rec.get('name'), dataIndex: rec.get('name'), width: 100, editor: new Ext.form.TextField()});
			});
			wData.loadMetaAndValue({
				columns: columns, records: Ext.decode(cell.getAttribute('data'))
			})
		};
		
		this.saveData = function(){
			var data = {};
			data.fields = Ext.encode(store.toJson());
			data.data = Ext.encode(wData.getStore().toJson());
			return data;
		};
		
		wData.on('activate', initDataStore);
		
		this.tabItems =[{
			title: BaseMessages.getString(PKG, "DataGridDialog.Meta.Label"),
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "DataGridDialog.Name.Column"), dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Type.Column"), dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
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
				header: BaseMessages.getString(PKG, "DataGridDialog.Format.Column"), dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueFormatStore'),
			        displayField:'name',
			        valueField:'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Length.Column"), dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Precision.Column"), dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Currency.Column"), dataIndex: 'currencyType', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Decimal.Column"), dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Group.Column"), dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "DataGridDialog.Value.SetEmptyString"), dataIndex: 'nullable', xtype: 'checkcolumn', width: 80
			}],
			store: store
		}, wData];
		
		DataGridDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('DataGrid', DataGridDialog);