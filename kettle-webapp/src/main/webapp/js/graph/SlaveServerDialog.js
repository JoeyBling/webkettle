
SlaveServerDialog = Ext.extend(Ext.Window, {
	title: '子服务器对话框',
	width: 600,
	height: 350,
	modal: true,
	layout: 'fit',
	iconCls: 'SlaveServer',
	initComponent: function() {
		
		var wName = new Ext.form.TextField({fieldLabel: '服务器名称', anchor: '-20'});
		var wHostname = new Ext.form.TextField({fieldLabel: '主机名称或IP地址', anchor: '-20'});
		var wPort = new Ext.form.TextField({fieldLabel: '端口号(如果不写就是80端口)', anchor: '-20'});
		var wWebAppName = new Ext.form.TextField({fieldLabel: 'Web App Name(required for DI Server)', anchor: '-20'});
		var wUsername = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-20'});
		var wPassword = new Ext.form.TextField({fieldLabel: '密码', inputType:'password', anchor: '-20'});
		var wMaster = new Ext.form.Checkbox({fieldLabel: '是否主服务器'});
		
		var wProxyHost = new Ext.form.TextField({fieldLabel: '代理服务器主机名', anchor: '-20'});
		var wProxyPort = new Ext.form.TextField({fieldLabel: '代理服务器端口', anchor: '-20'});
		var wNonProxyHosts = new Ext.form.TextField({fieldLabel: 'Ignore proxy for hosts: regexp | separated', anchor: '-20'});
		
		this.items = {
			border: false,
			bodyStyle: 'padding: 5px',
			layout: 'fit',
			items: {
				xtype: 'tabpanel',
				activeTab: 0,
				items: [{
					title: '服务',
					xtype: 'KettleForm',
					labelWidth: 200,
					items: [wName, wHostname, wPort, wWebAppName, wUsername, wPassword, wMaster]
				},{
					title: '代理',
					xtype: 'KettleForm',
					labelWidth: 250,
					items: [wProxyHost, wProxyPort, wNonProxyHosts]
				}]
			}
		};
		
		this.initData = function(data) {
			wName.setValue(data.name);
			wHostname.setValue(data.hostname);
			wPort.setValue(data.port);
			wWebAppName.setValue(data.webAppName);
			wUsername.setValue(data.username);
			wPassword.setValue(data.password);
			wMaster.setValue(data.master == 'Y');
			
			wProxyHost.setValue(data.proxy_hostname);
			wProxyPort.setValue(data.proxy_port);
			wNonProxyHosts.setValue(data.non_proxy_hosts);
		};
		
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {this.close();}
		}, {
			text: '确定', scope: this, handler: function() {
				var data = {
						name: wName.getValue(),
						hostname: wHostname.getValue(),
						port: wPort.getValue(),
						webAppName: wWebAppName.getValue(),
						username: wUsername.getValue(),
						password: wPassword.getValue(),
						master: wMaster.getValue() ? 'Y' : 'N',
						sslMode: 'N',
						proxy_hostname: wProxyHost.getValue(),
						proxy_port: wProxyPort.getValue(),
						non_proxy_hosts: wNonProxyHosts.getValue()
					};
				getActiveGraph().onSlaveServerMerge(data);
				this.fireEvent('ok', data);
				this.close();
			}
		}];
		
		SlaveServerDialog.superclass.initComponent.call(this);
		this.addEvents('ok');
	}
});

SlaveServersDialog = Ext.extend(Ext.Window, {
	title: '子服务器信息',
	width: 450,
	height: 350,
	modal: true,
	layout: 'fit',
	iconCls: 'SlaveServer',
	initComponent: function() {
		/*var slaveServerStore = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['id','name', 'hostname', 'port', 'webAppName', 'username', 'password', 'master'],
			proxy: new Ext.data.HttpProxy({
				url: '/slave/allSlaveToSlaveServer.do'
			})
		});
		slaveServerStore.load();*/

		var grid = this.items = new Ext.grid.GridPanel({
			border: false,
			tbar: [{
				text: '新增服务器', handler: function() {
					var dialog = new SlaveServerDialog();
					dialog.show();
				}
			},{
				text: '修改服务器', handler: function() {
					var sm = grid.getSelectionModel();
					if(sm.hasSelection() === true) {
						var dialog = new SlaveServerDialog();
						dialog.show(null, function() {
							dialog.initData(sm.getSelected().json)
						});
					}
				}
			},{
				text: '删除服务器', handler: function() {
					var sm = grid.getSelectionModel();
					if(sm.hasSelection() === true) {
						getActiveGraph().onSlaveServerDel(sm.getSelected().get('name'));
					}
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 150
			},{
				header: 'IP或主机地址', dataIndex: 'hostname', width: 120
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
			store:getActiveGraph.getSlaveServerStore()
		});
		SlaveServersDialog.superclass.initComponent.call(this);
	}
});