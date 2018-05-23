TransLogRunningPanel = Ext.extend(Ext.Panel, {
	defaults: {border: false},
	layout: {
        type:'vbox',
        align:'stretch'
    },
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), root = graph.getDefaultParent();
		var performanceLogTable = Ext.decode(root.getAttribute('performanceLogTable'));
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px 15px',
			height: 150,
			defaultType: 'textfield',
			labelWidth: 130,
			items: [{
				fieldLabel: '日志数据库连接',
				anchor: '-10'
			},{
				fieldLabel: '日志表模式',
				anchor: '-10'
			},{
				fieldLabel: '日志表',
				anchor: '-10'
			},{
				fieldLabel: '日志记录间隔时间(秒)',
				anchor: '-10'
			},{
				fieldLabel: '日志记录过时时间(天)',
				anchor: '-10'
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '日志字段',
			flex: 1,
			autoExpandColumn: 'columnDesc',
			columns: [{
				header: '启用', dataIndex: 'enabled', width: 60
			},{
				header: '字段名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				id: 'columnDesc', header: '字段描述', dataIndex: 'description', width: 100, editor: new Ext.form.TextField(), renderer: function(v) {
					return decodeURIComponent(v);
				}
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'description', {name: 'enabled', type: 'boolean'}],
				data: performanceLogTable.fields
			})
		});
		
		this.items = [form, grid];
		
		TransLogRunningPanel.superclass.initComponent.call(this);
	}

});

Ext.reg('TransLogRunning', TransLogRunningPanel);