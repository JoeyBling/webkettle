JobEntryCheckDbConnectionsDialog = Ext.extend(KettleDialog, {
	title: '检查数据库连接',
	width: 400,
	height: 300,
	initComponent: function() {
		var me = this;
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'waitfor', 'waittime']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			JobEntryCheckDbConnectionsDialog.superclass.initData.apply(this, [cell]);
			store.loadData(Ext.decode(cell.getAttribute('connections')));
		};
		
		this.saveData = function(){
			var data = {};
			data.connections = Ext.encode(store.toJson());
			
			return data;
		};
		
		this.fitItems = new KettleEditorGrid({
			title: '要剪切的字段',
			xtype: 'KettleEditorGrid',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取连接', scope: this, handler: function() {
						var s = getActiveGraph().getDatabaseStore();
						store.merge(s, ['name', {name: 'waitfor', value: '0'}, {name: 'waittime', value: 'millisecond'}]);
					}
				});
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '连接', dataIndex: 'name', width: 120, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
					mode: 'remote',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().getDatabaseStoreAll()
			    })
			},{
				header: '等待', dataIndex: 'waitfor', width: 100, editor: new Ext.form.TextField()
			},{
				header: '时间单位', dataIndex: 'waittime', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'desc',
					valueField: 'code',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: Ext.StoreMgr.get('timeunitStore')
			    }), renderer: function(v) {
			    	var index = Ext.StoreMgr.get('timeunitStore').find('code', v);
			    	if(index != -1) {
			    		return Ext.StoreMgr.get('timeunitStore').getAt(index).get('desc');
			    	}
			    	return v;
			    }
			}],
			store: store
		});
		
		JobEntryCheckDbConnectionsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('CHECK_DB_CONNECTIONS', JobEntryCheckDbConnectionsDialog);