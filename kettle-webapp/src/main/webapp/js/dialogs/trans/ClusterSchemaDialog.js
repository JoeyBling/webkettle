ClusterSchemaDialog = Ext.extend(Ext.Window, {
	title: '集群Schema对话框',
	width: 700,
	height: 500,
	modal: true,
	layout: 'border',
	iconCls: 'ClusterSchema',
	defaults: {border: false},
	initComponent: function() {
		var me = this;
		
		var wClusterSchemas =  new ListView({
			region: 'west',
			width: 200,
			valueField: 'name',
			store: getActiveGraph().getClusterSchemaStore(),
			columns: [{
				width: 1, dataIndex: 'name'
			}]
		});
		
		var wName = new Ext.form.TextField({fieldLabel: 'Schema名称', anchor: '-10'});
		var wPort = new Ext.form.TextField({fieldLabel: '端口', anchor: '-10'});
		var wBufferSize = new Ext.form.TextField({fieldLabel: 'Sockets缓存大小', anchor: '-10'});
		var wFlushInterval = new Ext.form.TextField({fieldLabel: 'Sockets刷新间隔(rows)', anchor: '-10'});
		var wCompressed = new Ext.form.Checkbox({fieldLabel: 'Sockets数据是否压缩'});
		var wDynamic = new Ext.form.Checkbox({fieldLabel: '动态集群'});
		
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name', '', 'hostname', 'port', 'webAppName', 'username', 'password', 'master']
		});
		
		var grid = new Ext.grid.GridPanel({
			title: '子服务器',
			region: 'center',
			tbar: [{
				text: '获取服务器', handler: function() {
					store.removeAll(true);
					store.loadData(getActiveGraph().getSlaveServerData());
				}
			},{
				text: '移除服务器', handler: function() {
					var sm = grid.getSelectionModel();
					if(sm.hasSelection() === true) {
						store.remove(sm.getSelected());
					}
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 150
			},{
				header: '服务URL', dataIndex: 'hostname', width: 120
			},{
				header: '是否主服务器', dataIndex: 'master', width: 100, renderer: function(v)
				{
					if(v == 'Y') 
						return '是'; 
					else if(v == 'N') 
						return '否';
					return v;
				}
			}],
			store: store
		});
		
		var initDefault = function() {
			wName.setValue('');
			wPort.setValue(40000);
			wBufferSize.setValue(2000);
			wFlushInterval.setValue(5000);
			wCompressed.setValue(true);
			wDynamic.setValue(false);
			
			store.loadData([]);
		};
		
		wClusterSchemas.on('selectionchange', function(v) {
			if(wClusterSchemas.getSelectedRecords().length > 0) {
				var rec = wClusterSchemas.getSelectedRecords()[0];
				
				wName.setValue(rec.get('name'));
				wPort.setValue(rec.get('base_port'));
				wBufferSize.setValue(rec.get('sockets_buffer_size'));
				wFlushInterval.setValue(rec.get('sockets_flush_interval'));
				wCompressed.setValue('Y' == rec.get('sockets_compressed'));
				wDynamic.setValue('Y' == rec.get('dynamic'));
				
				store.loadData(rec.get('slaveservers'));
			} else {
				initDefault();	
			}
		});
		
		var removeItem = new Ext.menu.Item({
			text: '移除', handler: function() {
				getActiveGraph().onClusterSchemaDel(wClusterSchemas.getValue());
			}
		});
		var shareItem = new Ext.menu.Item({
			text: 'Share'
		});

		var menu = new Ext.menu.Menu({
			items: [{
				text: '新增', scope: this, handler: initDefault
			}, removeItem, '-', shareItem]
		});		
		
		wClusterSchemas.on('contextmenu', function(v, index, node, e) {
			menu.showAt(e.getXY());
			e.preventDefault();
		});
		
		wClusterSchemas.on('containercontextmenu', function(v, e) {
			menu.showAt(e.getXY());
			e.preventDefault();
		});
		
		this.items = [{
			region: 'west',
			width: 150,
			layout: 'fit',
			items: wClusterSchemas
		}, {
			region: 'center',
			layout: 'border',
			defaults: {border: false},
			bbar: ['->', {
				text: '应用', scope: this, handler: function() {
					if(Ext.isEmpty(wName.getValue())) {
						alert('名称不能为空');
						return;
					}
					
					getActiveGraph().onClusterSchemaMerge({
						name: wName.getValue(),
						base_port: wPort.getValue(),
						sockets_buffer_size: wBufferSize.getValue(),
						sockets_flush_interval: wFlushInterval.getValue(),
						sockets_compressed: wCompressed.getValue() ? "Y" : "N",
						dynamic: wDynamic.getValue() ? "Y" : "N",
						slaveservers: store.toJson()
					});
				}
			}],
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 200,
				labelWidth: 150,
				items: [wName,wPort, wBufferSize, wFlushInterval, wCompressed, wDynamic]
			}, grid]
		}];
		
		this.bbar = ['->', {
			text: '关闭', scope: this, handler: function() {
				this.close();
			}
		}, {
			text: '确定', scope: this, handler: function() {
				this.close();
			}
		}];
		
		initDefault();
		
		ClusterSchemaDialog.superclass.initComponent.call(this);
	}
});