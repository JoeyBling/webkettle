JobEntryFTPSPUTDialog = Ext.extend(KettleTabDialog, {
	width: 600,
	height: 500,
	title: 'Put files via FTP',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		var wServerName = new Ext.form.TextField({fieldLabel: 'FTP服务器名称/IP地址', anchor: '-10', value: cell.getAttribute('servername')});
		var wServerPort = new Ext.form.TextField({fieldLabel: '端口', anchor: '-10', value: cell.getAttribute('serverport')});
		var wUserName = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-10', value: cell.getAttribute('username')});
		var wPassword = new Ext.form.TextField({fieldLabel: '密码', anchor: '-10', value: cell.getAttribute('password')});
		var wProxyserver = new Ext.form.TextField({fieldLabel: '代理主机',anchor: '-10', value: cell.getAttribute('proxyserver') });
		var wProxyserverport = new Ext.form.TextField({fieldLabel: '代理端口',anchor: '-10', value: cell.getAttribute('proxyserverport')});
		var wProxyserverusername = new Ext.form.TextField({fieldLabel: '代理用户名',anchor: '-10', value: cell.getAttribute('proxyserverusername')});
		var wProxyserverpwd = new Ext.form.TextField({fieldLabel: '代理密码',flex:1 , value: cell.getAttribute('proxyserverpwd')});
		var wConnectiontype = new Ext.form.ComboBox({
		fieldLabel: '连接类型',
		anchor: '-10',
		displayField: 'name',
		valueField: 'name',
		typeAhead: true,
        forceSelection: true,
        triggerAction: 'all',
        selectOnFocus:true,
		store: Ext.StoreMgr.get('connectiontypeStore'),
		value: cell.getAttribute('connectiontype')
	});
		
		// 测试连接  一个按钮
		var wBinaryMode = new Ext.form.Checkbox({fieldLabel: '二进制模式', checked: cell.getAttribute('binarymode') == 'Y'});
		var wTimeout = new Ext.form.TextField({fieldLabel: '超时',anchor: '-10', value: cell.getAttribute('timeout')});
		var wUsealiveftpconnection = new Ext.form.Checkbox({fieldLabel: '使用活动的FTP连接', checked: cell.getAttribute('usealiveftpconnection') == 'Y'});

		var wLocalDir = new Ext.form.TextField({fieldLabel: '本地目录',flex:1 , value: cell.getAttribute('localdir')});
		var wTongpeifu = new Ext.form.TextField({fieldLabel: '通配符', anchor: '-10', value: cell.getAttribute('tongpeifu')});
		var wDellocalfileAfterupload = new Ext.form.Checkbox({fieldLabel: '上传文件后删除本地文件', checked: cell.getAttribute('dellocalfilesafterupload')=='Y'  });
		var wNotcoverremotefiles= new Ext.form.Checkbox({fieldLabel: '不覆盖文件', checked: cell.getAttribute('notcoverremotefiles')=='Y'  });
		var wRemoteDir = new Ext.form.TextField({fieldLabel: '远程目录',flex:1 , value: cell.getAttribute('remotedir')});
		
		var wProxy2server = new Ext.form.TextField({fieldLabel: '主机', anchor: '-10', value: cell.getAttribute('proxy2server')});
		var wProxy2serverport = new Ext.form.TextField({fieldLabel: '端口', anchor: '-10', value: cell.getAttribute('proxy2serverport')});
		var wProxy2serverusername = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-10', value: cell.getAttribute('proxy2serverusername')});
		var wProxy2serverpwd = new Ext.form.TextField({fieldLabel: '密码', anchor: '-10', value: cell.getAttribute('proxy2serverpwd')});
		
		this.getValues = function(){
			return {
				servername : wServerName.getValue(),
				serverport : wServerPort.getValue(),
				username : wUserName.getValue(),
				password : wPassword.getValue(),
				proxyserver : wProxyserver.getValue() ,
				proxyserverport : wProxyserverport.getValue(),
				proxyserverusername : wProxyserverusername.getValue(),
				proxyserverpwd : wProxyserverpwd.getValue(),
				connectiontype : wConnectiontype.getValue(),
				
				binarymode : wBinaryMode.getValue()   ? "Y" : "N"   ,
				timeout : wTimeout.getValue(),
				useraliveftpconnection: wUsealiveftpconnection.getValue()   ? "Y" : "N" ,
//				controlencode: wControlEncode.getValue(),
				
				localdir:wLocalDir.getValue(),
				tongpeifu: wTongpeifu.getValue(),
				dellocalfileafterupload: wDellocalfileAfterupload.getValue()  ? "Y" : "N" ,
				notcoverremotefiles: wNotcoverremotefiles.getValue() ? "Y" : "N" ,
				remotedir: wRemoteDir.getValue(),
				
				proxy2server: wProxy2server.getValue(),
				proxy2serverport: wProxy2serverport.getValue(),
				proxy2serverusername: wProxy2serverusername.getValue(),
				proxy2serverpwd : wProxy2serverpwd.getValue()
			};
		};
		
		this.tabItems = [
		                 
		{
			xtype: 'KettleForm',
			title: '一般',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 130,
			items: [{
				xtype: 'fieldset',
				title: '服务器设置',
				items: [wServerName, wServerPort, wUserName, wPassword,wProxyserver, 
				        wProxyserverport,  wProxyserverusername,{
								xtype: 'compositefield',
								fieldLabel: '代理密码',
								anchor: '-10',
								items: [ wProxyserverpwd,{
									xtype: 'button', text: '测试连接', handler: function() {
											me.onSure(false);
											
											Ext.Ajax.request({
												url: GetUrl('job/ftptest.do'),
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
							},wConnectiontype
				]
			},{
				xtype: 'fieldset',
				title: '高级设置',
				items: [ wBinaryMode, wTimeout, wUsealiveftpconnection ]
			}]
		},
		
		
		
		
		{
			xtype: 'KettleForm',
			title: '文件',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 200,
			items: [{
				xtype: 'fieldset',
				title: '源(本地)文件',
				items: [{
					xtype: 'compositefield',
					fieldLabel: '本地目录',
					anchor: '-10',
					items: [wLocalDir,{
						xtype: 'button', text: '浏览...',handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wLocalDir.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wTongpeifu, wDellocalfileAfterupload, wNotcoverremotefiles ]
			}, 
			{
				xtype: 'fieldset',
				title: '目标(远程)文件',
				items: [{
					xtype: 'compositefield',
					fieldLabel: '远程目录',
					anchor: '-10',
					items: [wRemoteDir, {
						xtype: 'button', text: '测试目录',handler: function() {
							me.onSure(false);
							Ext.Ajax.request({
								url: GetUrl('job/ftpdirtest.do'),
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
					}
					]
				}]
			}
			]
		}
		
		
		
//		{
//			xtype: 'KettleForm',
//			title: 'Sockets代理',
//			bodyStyle: 'padding: 10px 10px',
//			labelWidth: 200,
//			items: [{
//				xtype: 'fieldset',
//				title: '代理',
//				items: [wProxy2server, wProxy2serverport, wProxy2serverusername,wProxy2serverpwd]
//			}
//			]
//		}
		
		
		];
		JobEntryFTPSPUTDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FTPS_PUT', JobEntryFTPSPUTDialog);