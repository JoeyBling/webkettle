SystemInfoDialog = Ext.extend(KettleDialog, {
	title: '获取系统信息',
	width: 600,
	height: 400,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var grid = this.fitItems = new KettleEditorGrid({
			title: '字段',
			region :'center',
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 200, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '类型', dataIndex: 'type', width: 200, renderer: function(v)
				{
					var store = Ext.StoreMgr.get('systemDataTypesStore');
					var n = store.find('code', v);
					if(n == -1) return v;
					return store.getAt(n).get('descrp');
				}
			}],
			store: store
		});
		
		grid.on('cellclick', function(g, row, col) {
			if(col == 2) {
				var listBox = new ListBox({
					height: 80,
					displayField: 'descrp',
					valueField: 'code',
					store: Ext.StoreMgr.get('systemDataTypesStore')
				});
				
				var win = new Ext.Window({
					width: 250,
					height: 500,
					modal: true,
					title: '选择信息类型',
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
		
		SystemInfoDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SystemInfo', SystemInfoDialog);