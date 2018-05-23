SQLStatementsDialog = Ext.extend(Ext.Window, {
	title: '生成SQL语句',
	width: 500,
	height: 300,
	closeAction: 'close',
	layout: 'fit',
	modal: true,
	initComponent: function() {
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'databaseName', 'sql', 'error'],
			proxy: new Ext.data.HttpProxy({
			    url: this.sqlUrl,
			    method: 'POST'
			})
		});
		store.baseParams.graphXml = getActiveGraph().toXml();
		
		var grid = new Ext.grid.GridPanel({
			border: false,
			columns: [new Ext.grid.RowNumberer(), {
				header: '步骤名称', dataIndex: 'name', width: 130
			},{
				header: '数据源', dataIndex: 'databaseName', width: 80
			},{
				header: 'SQL语句', dataIndex: 'sql', width: 240
			}],
			store: store
		});
		
		this.items = grid;
		
		SQLStatementsDialog.superclass.initComponent.call(this);
		
		this.on('show', function() {
			store.load();
		});
		
	}
});