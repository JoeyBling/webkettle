PoolPanel = Ext.extend(Ext.Panel, {
	layout: 'fit',
	defaults: {border: false},
	initComponent: function() {
		var poolingCheck = new Ext.form.Checkbox({ boxLabel: '使用连接池' });
		var poolSizeBox = new Ext.form.TextField({ flex: 1 });
		var maxPoolSizeBox = new Ext.form.TextField({ flex: 1 });
		
		var fieldset = new Ext.form.FieldSet({
			title: '连接池大小',
			anchor: '-1',
			disabled: true,
			items: [{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 24px',
            		text: '初始大小：'
            	}, poolSizeBox]
            },{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px',
            		text: '最大空闲空间：'
            	}, maxPoolSizeBox]
            }]
		});
		
		var textArea = new Ext.form.TextArea({
			emptyText: '参数描述',
			readOnly: true
		});
		
		var store = new Ext.data.JsonStore({
			fields: [{name: 'enabled', type: 'boolean'}, 'name', 'defValue', 'description'],
			data: []
		});
		
		this.initData = function(dbinfo) {
			poolingCheck.setValue('Y' == dbinfo.usingConnectionPool);
			poolSizeBox.setValue(dbinfo.initialPoolSize);
			maxPoolSizeBox.setValue(dbinfo.maximumPoolSize);
			store.loadData(dbinfo.pool_params);
		};
		
		this.getValue = function(dbinfo) {
			dbinfo.usingConnectionPool = poolingCheck.getValue() ? 'Y' : 'N';
			dbinfo.initialPoolSize = poolSizeBox.getValue();
			dbinfo.maximumPoolSize = maxPoolSizeBox.getValue();
				
			var pool_params = [];
			store.each(function(record) {
				if(record.get('enabled'))
					pool_params.push({
						enabled: true,
						name: record.get('name'), 
						defValue: record.get('defValue')
					});
			});
			if(pool_params.length > 0)
				dbinfo.pool_params = pool_params;
		};
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			region: 'center',
			disabled: true,
			autoExpandColumn: 'columnDesc',
			columns: [{
				header: '', xtype: 'checkcolumn', dataIndex: 'enabled', width: 40
			},{
				header: '参数名', dataIndex: 'name', width: 150
			},{
				id: 'columnDesc', header: '值', dataIndex: 'defValue', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		this.items = {
			defaults: {border: false},
			layout: 'fit',
			bodyStyle: 'padding: 5px',
			items: {
				layout: 'border',
				items: [{
					xtype: 'KettleForm',
					
					height: 120,
					labelWidth: 1,
					border: false,
					
					region: 'north',
					bodyStyle: 'padding-bottom: 5px',
					
					items: [poolingCheck, fieldset]
				}, grid, {
					xtype: 'KettleForm',
					
					height: 80,
					labelWidth: 1,
					border: false,
					region: 'south',
					bodyStyle: 'padding-top: 5px',
					layout: 'fit',
					items: textArea
					
				}]
			}
		};
		
		grid.on('cellclick', function(g, row) {
			var rec = grid.getStore().getAt(row);
			textArea.setValue(decodeURIComponent(rec.get('description')));
		});
		
		poolingCheck.on('check', function(s, checked) {
			if(checked == true) {
				grid.enable();
				fieldset.enable();
			} else {
				grid.disable();
				fieldset.disable();
			}
		});
		
		PoolPanel.superclass.initComponent.call(this);
	}
});