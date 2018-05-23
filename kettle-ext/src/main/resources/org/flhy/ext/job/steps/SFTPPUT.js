JobEntrySFTPPUTDialog = Ext.extend(KettleTabDialog, {
	width: 700,
	height: 550,
	title: 'SFTP上传',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		var wServerName = new Ext.form.TextField({fieldLabel: 'SFTP服务器名称/IP', anchor: '-10', value: cell.getAttribute('servername')});
		var wServerPort = new Ext.form.TextField({fieldLabel: '端口', anchor: '-10', value: cell.getAttribute('serverport')});
		var wUserName = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-10', value: cell.getAttribute('username')});
		var wPassword = new Ext.form.TextField({fieldLabel: '密码', anchor: '-10', value: cell.getAttribute('password')});
		var wusePublicKey = new Ext.form.Checkbox({fieldLabel: '使用私钥文件', checked: cell.getAttribute('usekeyfilename') == 'Y'});
		var wKeyFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('keyfilename')});
		var wkeyfilePass = new Ext.form.TextField({fieldLabel: '秘钥', anchor: '-10', value: cell.getAttribute('keyfilepass')});
		
		var wProxyType = new Ext.form.TextField({fieldLabel: '代理类型', anchor: '-10', value: cell.getAttribute('proxyType')});
		var wProxyHost = new Ext.form.TextField({fieldLabel: '代理主机', anchor: '-10', value: cell.getAttribute('proxyHost')});
		var wProxyPort = new Ext.form.TextField({fieldLabel: '代理端口', anchor: '-10', value: cell.getAttribute('proxyPort')});
		var wProxyUsername = new Ext.form.TextField({fieldLabel: '代理用户名', anchor: '-10', value: cell.getAttribute('proxyUsername')});
		var wProxyPassword = new Ext.form.TextField({flex: 1, value: cell.getAttribute('proxyPassword')});
		var wCompression = new Ext.form.TextField({fieldLabel: '压缩', anchor: '-20', value: cell.getAttribute('compression')});
		
		var wgetPrevious = new Ext.form.Checkbox({fieldLabel: '将上一作业的结果作为参数', checked: cell.getAttribute('copyprevious') == 'Y'});
		var wgetPreviousFiles = new Ext.form.Checkbox({fieldLabel: 'Copy previous result files to', checked: cell.getAttribute('copypreviousfiles') == 'Y'});
		var wLocalDirectory = new Ext.form.TextField({flex: 1, value: cell.getAttribute('localdirectory')});
		var wWildcard = new Ext.form.TextField({fieldLabel: '通配符(正则表达式)', anchor: '-10', value: cell.getAttribute('wildcard')});
		var wSuccessWhenNoFile = new Ext.form.Checkbox({fieldLabel: '当本地没有文件是运行成功', checked: cell.getAttribute('successWhenNoFile') == 'Y'});
		var wAfterFTPPut = new Ext.form.TextField({fieldLabel: 'SFTP上传后', anchor: '-10', value: cell.getAttribute('aftersftpput')});
		var wDestinationFolder = new Ext.form.TextField({flex: 1, value: cell.getAttribute('destinationfolder')});
		var wCreateDestinationFolder = new Ext.form.Checkbox({fieldLabel: '创建目标文件夹', checked: cell.getAttribute('createdestinationfolder') == 'Y'});
		var wAddFilenameToResult = new Ext.form.Checkbox({fieldLabel: '添加文件到结果文件列表', checked: cell.getAttribute('addFilenameResut') == 'Y'});
		
		var wScpDirectory = new Ext.form.TextField({flex: 1, value: cell.getAttribute('sftpdirectory')});
		var wCreateRemoteFolder = new Ext.form.Checkbox({fieldLabel: '创建文件夹', checked: cell.getAttribute('createRemoteFolder') == 'Y'});
		
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
				copypreviousfiles: wgetPreviousFiles.getValue() ? "Y" : "N",
				localdirectory: wLocalDirectory.getValue(),
				wildcard: wWildcard.getValue(),
				successWhenNoFile: wSuccessWhenNoFile.getValue() ? "Y" : "N",
				aftersftpput: wAfterFTPPut.getValue(),
				destinationfolder: wDestinationFolder.getValue(),		
				createdestinationfolder: wCreateDestinationFolder.getValue() ? "Y" : "N",
				addFilenameResut: wAddFilenameToResult.getValue() ? "Y" : "N",
								
				sftpdirectory: wScpDirectory.getValue(),
				createRemoteFolder: wCreateRemoteFolder.getValue() ? "Y" : "N"
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
				title: '源(本地)文件',
				items: [wgetPrevious, wgetPreviousFiles, {
					xtype: 'compositefield',
					fieldLabel: '本地目录',
					anchor: '-10',
					items: [wLocalDirectory, {
						xtype: 'button', text: '文件夹', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wLocalDirectory.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wWildcard, wSuccessWhenNoFile, wAfterFTPPut, {
					xtype: 'compositefield',
					fieldLabel: '目标文件夹',
					anchor: '-10',
					items: [wDestinationFolder, {
						xtype: 'button', text: '文件夹', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wDestinationFolder.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wCreateDestinationFolder, wAddFilenameToResult]
			}, {
				xtype: 'fieldset',
				title: '目标(远程)文件',
				items: [{
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
				}, wCreateRemoteFolder]
			}]
		}];
		JobEntrySFTPPUTDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SFTPPUT', JobEntrySFTPPUTDialog);