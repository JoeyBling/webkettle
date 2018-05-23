FTPDialog = Ext.extend(KettleTabDialog, {
	width: 450,
	height: 700,
	title: 'FTP下载',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		var wServerName = new Ext.form.TextField({fieldLabel: 'FTP服务器名称/IP地址',anchor: '-10',flex: 1,value: cell.getAttribute('serverName')});
		var wServerport = new Ext.form.TextField({fieldLabel: '端口', flex: 1,anchor: '-10',value: cell.getAttribute('serverPort')});
		var wUsername = new Ext.form.TextField({fieldLabel: '用户名',flex: 1,anchor: '-10', value: cell.getAttribute('username')});
		var wPassword = new Ext.form.TextField({fieldLabel: '密码', flex: 1,anchor: '-10',value: cell.getAttribute('password')});
		var wBinaryMode = new Ext.form.Checkbox({fieldLabel: '二进制模式',anchor: '-10', flex: 1,checked: cell.getAttribute('binaryMode') == 'Y'});
		var wTimeout =new Ext.form.TextField({fieldLabel: '超时', flex: 1,anchor: '-10',value: cell.getAttribute('timeout')});
		var wActiveConnection = new Ext.form.Checkbox({fieldLabel: '使用活动的FTP链接', anchor: '-10',flex: 1,checked: cell.getAttribute('activeConnection') == 'Y'});
		var wControlEncoding = new Ext.form.TextField({fieldLabel: '控制编码', anchor: '-10',flex: 1,value: cell.getAttribute('control_encoding')});
		var wProxyHost = new Ext.form.TextField({fieldLabel: '代理主机',flex: 1,anchor: '-10', value: cell.getAttribute('proxy_host')});
		var wProxyPort = new Ext.form.TextField({fieldLabel: '代理端口', flex: 1,anchor: '-10',value: cell.getAttribute('proxy_port')});
		var wProxyUsername = new Ext.form.TextField({fieldLabel: '代理用户名',flex: 1, anchor: '-10',value: cell.getAttribute('proxy_username')});
		var wProxyPassword = new Ext.form.TextField({fieldLabel: '代理密码', flex: 1, anchor: '-10',value: cell.getAttribute('proxy_password')});
		var wTargetDirectory = new Ext.form.TextField({fieldLabel: '，目标目录', flex: 1,anchor: '-10',value: cell.getAttribute('targetdirectory')});
		var wWildcard= new Ext.form.TextField({fieldLabel: '通配符（正则表达式）', flex: 1,anchor: '-10',value: cell.getAttribute('wildcard')});
		var wRemove = new Ext.form.Checkbox({fieldLabel: '上传文件后删除本地文',flex: 1,anchor: '-10', checked: cell.getAttribute('remove') == 'Y'});
		var wOnlyPuttingNewFiles = new Ext.form.Checkbox({fieldLabel: '不覆盖文件',flex: 1,anchor: '-10', checked: cell.getAttribute('only_new') == 'Y'});	
		var wFtpDirectory = new Ext.form.TextField({fieldLabel: '远程目录',flex: 1, anchor: '-10',value: cell.getAttribute('ftpdirectory')});
		var wSocksProxyHost = new Ext.form.TextField({fieldLabel: '主机',flex: 1, anchor: '-10', value: cell.getAttribute('socksproxy_host')});
		var wSocksProxyPort = new Ext.form.TextField({fieldLabel: '端口',flex: 1, anchor: '-10',value: cell.getAttribute('socksproxy_port')});
		var wSocksProxyUsername = new Ext.form.TextField({fieldLabel: '用户名', flex: 1,anchor: '-10',value: cell.getAttribute('socksproxy_username')});
		var wSocksProxyPassword = new Ext.form.TextField({fieldLabel: '密码', flex: 1,anchor: '-10',value: cell.getAttribute('socksproxy_password')});
		this.getValues = function(){
			return {
				serverName: wServerName.getValue(),
				serverPort: wServerport.getValue(),
				username: wUsername.getValue(),
				password: wPassword.getValue(),
				binaryMode: wBinaryMode.getValue() ? "Y" : "N",
				timeout: wTimeout.getValue(),
				activeConnection: wActiveConnection.getValue() ? "Y" : "N",
				control_encoding: wControlEncoding.getValue(),
				proxy_host: wProxyHost.getValue(),
				proxy_port: wProxyPort.getValue(),
				proxy_username: wProxyUsername.getValue(),
				proxy_password: wProxyPassword.getValue(),
				targetdirectory: wTargetDirectory.getValue(),
				wildcard: wWildcard.getValue(),
				remove: wRemove.getValue() ? "Y" : "N",
				only_new: wOnlyPuttingNewFiles.getValue() ? "Y" : "N",
				ftpdirectory: wFtpDirectory.getValue(),
				socksproxy_host: wSocksProxyHost.getValue(),
				socksproxy_port: wSocksProxyPort.getValue(),
				socksproxy_username: wSocksProxyUsername.getValue(),
				socksproxy_password: wSocksProxyPassword.getValue()
			};
		};
		
		this.tabItems = [{ 
			xtype: 'KettleForm',
			title: '一般',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 110,
			items: [{
				xtype: 'fieldset',
				title: '服务器设置',
				anchor: '-10',
				items: [wServerName,wServerport,wUsername,wPassword,wProxyHost,wProxyPort,wProxyUsername,wProxyPassword,{
					xtype: 'button', text: '测试连接', handler: function() {
						me.onSure(false);
						Ext.Ajax.request({
							url: GetUrl('job/ftpDownlond.do'),
							method: 'POST',
							params: {graphXml: getActiveGraph().toXml(), stepName: cell.getAttribute('label')},
							success: function(response) {
								decodeResponse(response, function(resObj) {
									Ext.Msg.alert(resObj.title, resObj.message);
								});
							},
							failure: failureResponse
						});
					}
				}]
			},{
				xtype: 'fieldset',
				bodyStyle: 'padding: 10px 10px',
				title: '高级设置',
				anchor: '-10',
				items: [wBinaryMode,wTimeout,wActiveConnection,wControlEncoding]
			}]
		},{
			xtype: 'KettleForm',
			title: '文件',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 150,
			items: [ {
				xtype: 'fieldset',
				title: 'Remote',
				anchor: '-10',
				items: [
						{xtype: 'compositefield',
						fieldLabel: '远程目录',
						anchor: '-10',
						items:[wFtpDirectory,
								{xtype: 'button', text: '测试目录', handler: function() {
									me.onSure(false);
									
									Ext.Ajax.request({
										url: GetUrl('job/ftpputdirtest.do'),
										method: 'POST',
										params: {graphXml: getActiveGraph().toXml(), stepName: cell.getAttribute('label')},
										success: function(response) {
											decodeResponse(response, function(resObj) {
												Ext.Msg.alert(resObj.title, resObj.message);
											});
										},
										failure: failureResponse
									});
								}
								}] }, wWildcard,wRemove,wOnlyPuttingNewFiles]
			},{
			xtype: 'fieldset',
			title: 'Local',
			bodyStyle: 'padding: 10px 10px',
			anchor: '-10',
			items:[wTargetDirectory, {
				xtype: 'button', text: '浏览...', handler: function() {
					var dialog = new FileExplorerWindow();
					dialog.on('ok', function(path) {
						wTargetDirectory.setValue(path);
						dialog.close();
					});
					dialog.show();
				}
			}] }
		]
		}];
		FTPDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FTP', FTPDialog);