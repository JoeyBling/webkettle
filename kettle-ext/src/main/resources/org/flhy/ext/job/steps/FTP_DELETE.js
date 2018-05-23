FTPdeleteDialog = Ext.extend(KettleTabDialog, {
	width: 500,
	height: 600,
	title: 'FTP删除',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		var wProtocol = new Ext.form.ComboBox({
			fieldLabel: '协议',
			flex: 1,
			anchor: '-10',
			displayField: 'text',
			valueField: 'text',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
            store: new Ext.data.JsonStore({
		        	fields: ['text'],
		        	data: [{ text: 'FTP'},
		        	       { text: 'FTPS'},
		        	       { text: 'SFTP'},
		        	       { text: 'SSH'}]
			    }), 
			    
            value: cell.getAttribute('protocol'),
            listeners:{
		    	'select':function(){
					if(wProtocol.getValue()=='FTPS')
				   {
						wftpscConnectionType.setDisabled(false);
					}else{
						wftpscConnectionType.setDisabled(true);
			        }
					if(wProtocol.getValue()=='SSH')
					   {
						wPublicpublickey.setDisabled(false);
						}else{
							wPublicpublickey.setDisabled(true);
				        }
			    }
			 }
		});
		var wServerName = new Ext.form.TextField({fieldLabel: 'FTP服务器名称/IP地址',anchor: '-10',flex: 1,value: cell.getAttribute('serverName')});
		var wServerport = new Ext.form.TextField({fieldLabel: '端口', flex: 1,anchor: '-10',value: cell.getAttribute('serverPort')});
		var wUsername = new Ext.form.TextField({fieldLabel: '用户名',flex: 1,anchor: '-10', value: cell.getAttribute('username')});
		var wPassword = new Ext.form.TextField({fieldLabel: '密码', flex: 1,anchor: '-10',value: cell.getAttribute('password')});
		var wftpscConnectionType = new Ext.form.ComboBox({
			fieldLabel: '连接类型',
			anchor: '-10',
			flex: 1,
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        disabled:true,
			value: cell.getAttribute('ftps_connection_type'),
			store: new Ext.data.JsonStore({
	        	fields: ['value', 'text'],
	        	data: [{value: '0', text: 'FTP_CONNECTION'},
	        	       {value: '1', text: 'IMPLICIT_SSL_FTP_CONNECTION'},
	        	       {value: '2', text: 'AUTH_SSL_FTP_CONNECTION'},
	        	       {value: '3', text: 'IMPLICIT_SSL_WITH_CRYPTED_DATA_FTP_CONNECTION'},
	        	       {value: '4', text: 'AUTH_TLS_FTP_CONNECTION'},
	        	       {value: '5', text: 'IMPLICIT_TLS_FTP_CONNECTION'},
	        	       {value: '6', text: 'IMPLICIT_TLS_WITH_CRYPTED_DATA_FTP_CONNECTION'}]
		    })
			});
		var wUseproxy = new Ext.form.Checkbox({
			fieldLabel: '使用代理',
			anchor: '-10', 
			flex: 1,
			checked: cell.getAttribute('useproxy') == 'Y',
		listeners:{
			'check':function(checked){
				if(checked.checked)
			   {
			        wProxyHost.setDisabled(false);
			        wProxyPort.setDisabled(false);
			        wProxyUsername.setDisabled(false);
			        wProxyPassword.setDisabled(false);
				}else{
					wProxyHost.setDisabled(true);
					wProxyPort.setDisabled(true);
					wProxyUsername.setDisabled(true);
					wProxyPassword.setDisabled(true);
		        }
		    }
		 }
		});

		var wProxyHost = new Ext.form.TextField({fieldLabel: '代理主机',disabled:true,flex: 1,anchor: '-10', value: cell.getAttribute('proxy_host')});
		var wProxyPort = new Ext.form.TextField({fieldLabel: '代理端口', disabled:true,flex: 1,anchor: '-10',value: cell.getAttribute('proxy_port')});
		var wProxyUsername = new Ext.form.TextField({fieldLabel: '代理用户名',disabled:true,flex: 1, anchor: '-10',value: cell.getAttribute('proxy_username')});
		var wProxyPassword = new Ext.form.TextField({fieldLabel: '代理密码', disabled:true,flex: 1, anchor: '-10',value: cell.getAttribute('proxy_password')});
		
		var wTimeout =new Ext.form.TextField({fieldLabel: '超时', flex: 1,anchor: '-10',value: cell.getAttribute('timeout')});
		var wActiveConnection = new Ext.form.Checkbox({fieldLabel: '使用活动的FTP链接', anchor: '-10',flex: 1,checked: cell.getAttribute('activeConnection') == 'Y'});
		
		var wKeyfilename = new Ext.form.TextField({fieldLabel: '公钥文件', disabled:true,flex: 1, anchor: '-10',value: cell.getAttribute('keyfilename')});
		var wKeyfilepass = new Ext.form.TextField({fieldLabel: '加密密钥', disabled:true,flex: 1, anchor: '-10',value: cell.getAttribute('keyfilepass')});
		var wfindbutton = new Ext.Button({
			text: '浏览...', 
			disabled:true,
			handler: function() {
			var dialog = new FileExplorerWindow();
			dialog.on('ok', function(path) {
				wKeyfilename.setValue(path);
				dialog.close();
			});
			dialog.show();
		}});
		var wPublicpublickey = new Ext.form.Checkbox({
			fieldLabel: '使用公钥秘密钥',
			anchor: '-10', flex: 1,
			disabled:true,
			checked: cell.getAttribute('publicpublickey') == 'Y',
			listeners:{
				'check':function(checked){
					if(checked.checked)
				   {
						wKeyfilename.setDisabled(false);
						wKeyfilepass.setDisabled(false);
						wfindbutton.setDisabled(false);

					}else{
						wKeyfilename.setDisabled(true);
						wKeyfilepass.setDisabled(true);
						wfindbutton.setDisabled(true);

			        }
			    }
			 }});
		
		var wWildcard= new Ext.form.TextField({fieldLabel: '通配符（正则表达式）', flex: 1,anchor: '-10',value: cell.getAttribute('wildcard')});
		var wRemoteDirectory = new Ext.form.TextField({fieldLabel: '远程目录',flex: 1, anchor: '-10',value: cell.getAttribute('ftpdirectory')});
		var wcheckbutton = new Ext.Button({xtype: 'button', text: '检查文件夹', handler: function() {
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
		});
		
		var wCopyprevious = new Ext.form.Checkbox({
			fieldLabel: '从上一步结果复制参数', 
			anchor: '-10',
			flex: 1,
			checked: cell.getAttribute('copyprevious') == 'Y',
			listeners:{
				'check':function(checked){
					if(checked.checked)
				   {
						wRemoteDirectory.setDisabled(true);
						wWildcard.setDisabled(true);
						wcheckbutton.setDisabled(true);

					}else{
						wRemoteDirectory.setDisabled(false);
						wWildcard.setDisabled(false);
						wcheckbutton.setDisabled(false);

			        }
			    }
			 }
			});
		var wSuccess_condition = new Ext.form.ComboBox({
			fieldLabel: '成功条件',
			flex: 1,
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			value: cell.getAttribute('success_condition'),
			store: new Ext.data.JsonStore({
	        	fields: ['value', 'text'],
	        	data: [{value: 'success_when_at_least', text: 'success_when_at_least'},
	        	       {value: 'success_if_errors_less', text: 'success_if_errors_less'},
	        	       {value: 'success_is_all_files_downloaded', text: 'success_is_all_files_downloaded'}]
		    }), 
		    listeners:{
		    	'select' :function(value){
					if(wSuccess_condition.getValue()=='success_when_at_least')
				   {
						wNr_limit_success.setDisabled(false);
					}else{
						wNr_limit_success.setDisabled(true);
			        }
			    }
			 }
			});
		var wNr_limit_success = new Ext.form.TextField({fieldLabel: '数量',flex: 1,disabled:true, anchor: '-10',value: cell.getAttribute('nr_limit_success')});
		
		var wSocksProxyHost = new Ext.form.TextField({fieldLabel: '主机',flex: 1, anchor: '-10', value: cell.getAttribute('socksproxy_host')});
		var wSocksProxyPort = new Ext.form.TextField({fieldLabel: '端口',flex: 1, anchor: '-10',value: cell.getAttribute('socksproxy_port')});
		var wSocksProxyUsername = new Ext.form.TextField({fieldLabel: '用户名', flex: 1,anchor: '-10',value: cell.getAttribute('socksproxy_username')});
		var wSocksProxyPassword = new Ext.form.TextField({fieldLabel: '密码', flex: 1,anchor: '-10',value: cell.getAttribute('socksproxy_password')});
		this.getValues = function(){
			return {
				protocol:wProtocol.getValue(),
				serverName: wServerName.getValue(),
				serverPort: wServerport.getValue(),
				username: wUsername.getValue(),
				password: wPassword.getValue(),
				ftps_connection_type: wftpscConnectionType.getValue(),
				useproxy:wUseproxy.getValue() ? "Y" : "N",
				timeout: wTimeout.getValue(),
				activeConnection: wActiveConnection.getValue() ? "Y" : "N",
				publicpublickey: wPublicpublickey.getValue() ? "Y" : "N",
				keyfilename:wKeyfilename.getValue(),
				keyfilepass:wKeyfilepass.getValue(),
				proxy_host: wProxyHost.getValue(),
				proxy_port: wProxyPort.getValue(),
				proxy_username: wProxyUsername.getValue(),
				proxy_password: wProxyPassword.getValue(),
				wildcard: wWildcard.getValue(),
				copyprevious: wCopyprevious.getValue() ? "Y" : "N",
				success_condition: wSuccess_condition.getValue(),
				nr_limit_success:wNr_limit_success.getValue(),
				ftpdirectory: wRemoteDirectory.getValue(),
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
				bodyStyle: 'padding: 10px 10px',
				title: '服务器设置',
				anchor: '-10',
				items: [wProtocol,wServerName,wServerport,wUsername,wPassword,wftpscConnectionType,wUseproxy,wProxyHost,wProxyPort,wProxyUsername,wProxyPassword,wPublicpublickey,
				        {xtype: 'compositefield',
					fieldLabel: '公钥文件',
					anchor: '-10',
					items: [wKeyfilename,wfindbutton]},wKeyfilepass,{
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
			}]
		},{
			xtype: 'KettleForm',
			title: '文件',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 150,
			items: [{
				xtype: 'fieldset',
				bodyStyle: 'padding: 10px 10px',
				title: '高级',
				anchor: '-10',
				items: [wTimeout,wActiveConnection]
			}, {
			xtype: 'fieldset',
			title: '远程',
			bodyStyle: 'padding: 10px 10px',
			anchor: '-10',
			items: [wCopyprevious,{
				xtype: 'compositefield',
				fieldLabel: '远程目录',
				anchor: '-10',
				items:[wRemoteDirectory, wcheckbutton]},wWildcard]},
					{
						xtype: 'fieldset',
						bodyStyle: 'padding: 10px 10px',
						title: '成功条件',
						anchor: '-10',
						items: [wSuccess_condition,wNr_limit_success]
					},
		]
		}, {
			xtype: 'KettleForm',
			title: 'Socks代理',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 90,
			items: [ {
				xtype: 'fieldset',
				title: '代理',
				bodyStyle: 'padding: 10px 10px',
				anchor: '-10',
				items: [wSocksProxyHost, wSocksProxyPort,wSocksProxyUsername,wSocksProxyPassword]
			}
		]
		}];
		FTPdeleteDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FTP_DELETE', FTPdeleteDialog);