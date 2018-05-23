ClusterPanel = Ext.extend(Ext.Panel, {
	layout: 'fit',
	defaults: {border: false},
	initComponent: function() {
		var clusteringCheck = new Ext.form.Checkbox({ boxLabel: '使用集群' });
		
		var store = new Ext.data.JsonStore({
			fields: ['partitionId', 'hostname', 'port', 'databaseName', 'username', 'password'],
			data: []
		});
		
		this.initData = function(dbinfo) {
			clusteringCheck.setValue(dbinfo.partitioned == 'Y');
			store.loadData(dbinfo.partitionInfo);
		};
		
		this.getValue = function(dbinfo) {
			dbinfo.partitioned = clusteringCheck.getValue() ? 'Y' : 'N';
			dbinfo.partitionInfo = store.toJson();
		};
		
		var grid = new KettleEditorGrid({
			title: '命名参数',
			region: 'center',
			disabled: true,
			columns: [{
				header: '分区ID', dataIndex: 'partitionId', width: 100, editor: new Ext.form.TextField()
			},{
				header: '主机名称', dataIndex: 'hostname', width: 100, editor: new Ext.form.TextField()
			},{
				header: '端口', dataIndex: 'port', width: 60, editor: new Ext.form.TextField()
			},{
				header: '数据库名称', dataIndex: 'databaseName', width: 100, editor: new Ext.form.TextField()
			},{
				header: '用户名', dataIndex: 'username', width: 80, editor: new Ext.form.TextField()
			},{
				header: '密码', dataIndex: 'password', width: 80, editor: new Ext.form.TextField()
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
						height: 30,
						labelWidth: 1,
						border: false,
						
						region: 'north',
						margins: '0 0 0 0',
						
						items: [clusteringCheck]
					}, grid]
				}
			};
		
		clusteringCheck.on('check', function(s, checked) {
			if(checked == true) {
				grid.enable();
			} else {
				grid.disable();
			}
		});
		
		ClusterPanel.superclass.initComponent.call(this);
	}
	
	
});