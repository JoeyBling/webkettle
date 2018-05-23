JobEntrySFTPDialog = Ext.extend(KettleTabDialog, {
	width: 700,
	height: 550,
	title: 'SFTP下载',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		var wServerName = new Ext.form.TextField({fieldLabel: 'SFTP服务器名称/IP', anchor: '-10', value: cell.getAttribute('servername')});
		var wServerPort = new Ext.form.TextField({fieldLabel: '端口', anchor: '-10', value: cell.getAttribute('serverport')});
		var wUserName = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-10', value: cell.getAttribute('username')});
		var wPassword = new Ext.form.TextField({fieldLabel: '密码', anchor: '-10', value: cell.getAttribute('password')});
		var wusePublicKey = new Ext.form.Checkbox({fieldLabel: '使用私钥文件', checked: cell.getAttribute('usekeyfilename') == 'Y'});
		var wKeyFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('keyfilename')});
		var wkeyfilePass = new Ext.form.TextField({fieldLabel: '秘钥', anchor: '-10', value: cell.getAttribute('keyfilepass')});
		
		var wProxyType = new Ext.form.ComboBox({
			fieldLabel: '代理类型',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('proxyTypeStore'),
			value: cell.getAttribute('proxyType')
		});
		var wProxyHost = new Ext.form.TextField({fieldLabel: '代理主机', anchor: '-10', value: cell.getAttribute('proxyHost')});
		var wProxyPort = new Ext.form.TextField({fieldLabel: '代理端口', anchor: '-10', value: cell.getAttribute('proxyPort')});
		var wProxyUsername = new Ext.form.TextField({fieldLabel: '代理用户名', anchor: '-10', value: cell.getAttribute('proxyUsername')});
		var wProxyPassword = new Ext.form.TextField({flex: 1, value: cell.getAttribute('proxyPassword')});
		var wCompression = new Ext.form.ComboBox({
			fieldLabel: '压缩',
			anchor: '-20',
			displayField: 'name',
			valueField: 'name',
			mode: 'local',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: new Ext.data.JsonStore({
				fields: ['name'],
				data:[{name: 'none'}, {name: 'zlib'}]
			}),
			value: cell.getAttribute('compression')
		});
		
		var wgetPrevious = new Ext.form.Checkbox({fieldLabel: '复制上一个作业项的结果作为参数', checked: cell.getAttribute('copyprevious') == 'Y'});
		var wScpDirectory = new Ext.form.TextField({flex: 1, value: cell.getAttribute('sftpdirectory')});
		var wWildcard = new Ext.form.TextField({fieldLabel: '通配符(正则表达式)', anchor: '-10', value: cell.getAttribute('wildcard')});
		var wRemove = new Ext.form.Checkbox({fieldLabel: '获取后删除服务器文件', checked: cell.getAttribute('remove') == 'Y'});
		
		var wTargetDirectory = new Ext.form.TextField({flex: 1, value: cell.getAttribute('targetdirectory')});
		var wCreateTargetFolder = new Ext.form.Checkbox({fieldLabel: '创建目标文件', checked: cell.getAttribute('createtargetfolder') == 'Y'});
		var wAddFilenameToResult = new Ext.form.Checkbox({fieldLabel: '添加文件名到结果', checked: cell.getAttribute('isaddresult') == 'Y'});
		
		this.getValues = function(){
			return {
				servername: wServerName.getValue(),
				serverport: wServerPort.getValue(),
				username: wUserName.getValue(),
				password: wPassword.getValue(),
				usekeyfilename: wusePublicKey.getValue() ? "Y" : "N",
				keyfilename: wKeyFilename.getValue(),
				keyfilepass: wkeyfilePass.getValue(),
				
				proxyType: wProxyType.getValue(),
				proxyHost: wProxyHost.getValue(),
				proxyPort: wProxyPort.getValue(),
				proxyUsername: wProxyUsername.getValue(),
				proxyPassword: wProxyPassword.getValue(),
				compression: wCompression.getValue(),
				
				copyprevious: wgetPrevious.getValue() ? "Y" : "N",
				sftpdirectory: wScpDirectory.getValue(),
				wildcard: wWildcard.getValue(),
				remove: wRemove.getValue() ? "Y" : "N",
				targetdirectory: wTargetDirectory.getValue(),
				createtargetfolder: wCreateTargetFolder.getValue() ? "Y" : "N",
				isaddresult: wAddFilenameToResult.getValue() ? "Y" : "N"
			};
		};
		
		this.tabItems = [{
			xtype: 'KettleForm',
			title: '一般',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 130,
			items: [{
				xtype: 'fieldset',
				title: '服务器设置',
				items: [wServerName, wServerPort, wUserName, wPassword, wusePublicKey, {
					xtype: 'compositefield',
					fieldLabel: '私钥文件',
					anchor: '-10',
					items: [wKeyFilename, {
						xtype: 'button', text: '浏览...', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wKeyFilename.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wkeyfilePass, wProxyType, wProxyHost, wProxyPort, wProxyUsername, {
					xtype: 'compositefield',
					fieldLabel: '代理密码',
					anchor: '-10',
					items: [wProxyPassword, {
						xtype: 'button', text: '测试连接', handler: function() {
							me.onSure(false);
							
							Ext.Ajax.request({
								url: GetUrl('sftp/test.do'),
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
				}]
			},wCompression]
		},{
			xtype: 'KettleForm',
			title: '文件',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 200,
			items: [{
				xtype: 'fieldset',
				title: '源文件',
				items: [wgetPrevious, {
					xtype: 'compositefield',
					fieldLabel: '远程目录',
					anchor: '-10',
					items: [wScpDirectory, {
						xtype: 'button', text: '测试文件夹', handler: function() {
							me.onSure(false);
							
							Ext.Ajax.request({
								url: GetUrl('sftp/testdir.do'),
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
				}, wWildcard, wRemove]
			}, {
				xtype: 'fieldset',
				title: '目标文件',
				items: [{
					xtype: 'compositefield',
					fieldLabel: '目标目录',
					anchor: '-10',
					items: [wTargetDirectory, {
						xtype: 'button', text: '浏览...', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wTargetDirectory.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wCreateTargetFolder, wAddFilenameToResult]
			}]
		}];
		JobEntrySFTPDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SFTP', JobEntrySFTPDialog);