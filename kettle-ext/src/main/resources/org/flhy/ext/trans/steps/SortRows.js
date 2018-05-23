SortRowsDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "SortRowsDialog.DialogTitle"),
	width: 500,
	height: 500,
	initComponent: function() {
		var me = this;
		
		var wSortDir = new Ext.form.TextField({flex: 1});
		var wPrefix = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "SortRowsDialog.Prefix.Label"), anchor: '-10'});
		var wSortSize = new Ext.form.NumberField({fieldLabel: BaseMessages.getString(PKG, "SortRowsDialog.SortSize.Label"), anchor: '-10', emptyText: '内存里存放的记录数'});
		var wFreeMemory = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "SortRowsDialog.FreeMemory.Label"), anchor: '-10'});
		var wCompress = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "SortRowsDialog.Compress.Label")});
		var wUniqueRows = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "SortRowsDialog.UniqueRows.Label")});
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'ascending', 'case_sensitive', 'presorted']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			SortRowsDialog.superclass.initData.apply(this, [cell]);
			
			wSortDir.setValue(cell.getAttribute('directory'));
			wPrefix.setValue(cell.getAttribute('prefix'));
			wSortSize.setValue(cell.getAttribute('sort_size'));
			wFreeMemory.setValue(cell.getAttribute('free_memory'));
			wCompress.setValue('Y' == cell.getAttribute('compress'));
			wUniqueRows.setValue('Y' == cell.getAttribute('unique_rows'));
			
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.directory = wSortDir.getValue();
			data.prefix = wPrefix.getValue();
			data.sort_size = wSortSize.getValue();
			data.free_memory = wFreeMemory.getValue();
			data.compress = wCompress.getValue() ? 'Y' : 'N';
			data.unique_rows = wUniqueRows.getValue() ? 'Y' : 'N';
			data.fields = Ext.encode(store.toJson());
			return data;
		};
		
		this.fitItems = {
			layout: 'border',
			border: false,
			items: [{
				region: 'north',
				height: 170,
				xtype: 'KettleForm',
				bodyStyle: 'padding: 5px',
				labelWidth: 140,
				margins: '0 0 5 0',
				items: [{
					xtype: 'compositefield',
					fieldLabel: BaseMessages.getString(PKG, "SortRowsDialog.SortDir.Label"),
					anchor: '-10',
					items: [wSortDir, {
						xtype: 'button', text: '浏览..', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wSortDir.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wPrefix, wSortSize, wFreeMemory, wCompress, wUniqueRows]
			}, {
				title: '排序字段',
				xtype: 'KettleEditorGrid',
				region: 'center',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: '获取字段', scope: this, handler: function() {
							me.onSure(false);
							getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(s) {
								store.merge(s, ['name', {name: 'ascending', value: 'Y'}, {name: 'case_sensitive', value: 'N'}, {name: 'presorted', value: 'N'}]);
							});
						}
					});
					
					menu.insert(1, '-');
				},
				getDefaultValue: function() {
					return {name: '', ascending:'Y', case_sensitive: 'N', presorted: 'N'};
				},
				columns: [new Ext.grid.RowNumberer(), {
					header: BaseMessages.getString(PKG, "SortRowsDialog.Fieldname.Column"), dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputFields(cell.getAttribute('label'))
					})
				},{
					header: '升序', dataIndex: 'ascending', width: 100, renderer: function(v)
					{
						if(v == 'N') 
							return '否'; 
						else if(v == 'Y') 
							return '是';
						return v;
					}, editor: new Ext.form.ComboBox({
				        store: new Ext.data.JsonStore({
				        	fields: ['value', 'text'],
				        	data: [{value: 'Y', text: '是'},
				        	       {value: 'N', text: '否'}]
				        }),
				        displayField: 'text',
				        valueField: 'value',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				},{
					header: BaseMessages.getString(PKG, "SortRowsDialog.CaseInsensitive.Column"), dataIndex: 'case_sensitive', width: 100, renderer: function(v)
					{
						if(v == 'N') 
							return '否'; 
						else if(v == 'Y') 
							return '是';
						return v;
					}, editor: new Ext.form.ComboBox({
				        store: new Ext.data.JsonStore({
				        	fields: ['value', 'text'],
				        	data: [{value: 'Y', text: '是'},
				        	       {value: 'N', text: '否'}]
				        }),
				        displayField: 'text',
				        valueField: 'value',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				}, {
					header: 'Presorted', dataIndex: 'presorted', width: 100, renderer: function(v)
					{
						if(v == 'N') 
							return '否'; 
						else if(v == 'Y') 
							return '是';
						return v;
					}, editor: new Ext.form.ComboBox({
				        store: new Ext.data.JsonStore({
				        	fields: ['value', 'text'],
				        	data: [{value: 'Y', text: '是'},
				        	       {value: 'N', text: '否'}]
				        }),
				        displayField: 'text',
				        valueField: 'value',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				}],
				store: store
			}]
		}
		
		SortRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SortRows', SortRowsDialog);