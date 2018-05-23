RepositoryManageDialog = Ext.extend(Ext.Window, {
	title: '资源库管理',
	width: 600,
	height: 400,
	modal: true,
	layout: 'fit',
	plain: true,
	
	initComponent: function() {
		
		var connectionStore = new Ext.data.JsonStore({
			fields: ['name', 'type', 'changedDate']
		});
		
		var slaveStore = new Ext.data.JsonStore({
			fields: ['name', 'hostname', 'port', 'master']
		});
		
		this.initData = function() {
			Ext.Ajax.request({
				url: GetUrl('repository/load.do'),
				method: 'POST',
				scope: this,
				success: function(response) {
					var resObj = Ext.decode(response.responseText);
					connectionStore.loadData(resObj.databases);
					slaveStore.loadData(resObj.slaves);
				},
				failure: failureResponse
			});
		};
		
		this.items = new Ext.TabPanel({
			activeTab: 0,
			items: [{
				title: '数据库连接',
				xtype: 'grid',
				columns: [{
					header: '名称', dataIndex: 'name', width: 150
				}, {
					header: '类型', dataIndex: 'type', width: 150
				}, {
					header: '修改时间', dataIndex: 'changedDate', width: 150
				}],
				store: connectionStore
			}, {
				title: '子服务器',
				xtype: 'grid',
				columns: [{
					header: '名称', dataIndex: 'name', width: 150
				}, {
					header: '主机', dataIndex: 'hostname', width: 120
				}, {
					header: '端口', dataIndex: 'port', width: 120
				}, {
					header: 'Master', dataIndex: 'master', width: 120
				}],
				store: slaveStore
			}]
		});
		
		RepositoryManageDialog.superclass.initComponent.call(this);
	}
});

