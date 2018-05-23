RandomValueDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "RandomValueDialog.DialogTitle"),
	width: 500,
	height: 300,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var wFields = this.fitItems = new Ext.grid.EditorGridPanel({
			title: BaseMessages.getString(PKG, "RandomValueDialog.Fields.Label"),
			region :'center',
			tbar: [{
				iconCls: 'add', text: '添加字段', handler: function() {
	                var record = new store.recordType({ name: '',  type: '' });
	                wFields.stopEditing();
	                wFields.getStore().insert(0, record);
	                wFields.startEditing(0, 0);
				}
			},{
				iconCls: 'delete', text: '删除字段'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "RandomValueDialog.NameColumn.Column"), dataIndex: 'name', width: 200, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: BaseMessages.getString(PKG, "RandomValueDialog.TypeColumn.Column"), dataIndex: 'type', width: 200, renderer: function(v)
				{
					var store = Ext.StoreMgr.get('randomValueFuncStore');
					var n = store.find('type', v);
					if(n == -1) return v;
					return store.getAt(n).get('descrp');
				}
			}],
			store: store
		});
		
		wFields.on('cellclick', function(g, row, col) {
			if(col == 2) {
				var listBox = new ListBox({
					displayField: 'descrp',
					valueField: 'type',
					store: Ext.StoreMgr.get('randomValueFuncStore')
				});
				
				var win = new Ext.Window({
					width: 350,
					height: 300,
					modal: true,
					title: BaseMessages.getString(PKG, "RandomValueDialog.SelectInfoType.DialogTitle"),
					closeAction: 'close',
					layout: 'fit',
					items: listBox,
					bbar: ['->',{
						text: '确定', handler: function() {
							if(listBox.getValue()) {
								var rec = store.getAt(row);
								rec.set('type', listBox.getValue());
								win.close();
							}
						}
					}]
				});
				
				win.show();
			}
		});
		
		this.getValues = function(){
			return {
				fields: Ext.encode(store.toJson())
			};
		};
		
		RandomValueDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('RandomValue', RandomValueDialog);