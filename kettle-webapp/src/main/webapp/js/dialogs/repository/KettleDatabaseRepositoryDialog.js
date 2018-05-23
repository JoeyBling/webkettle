KettleDatabaseRepositoryDialog = Ext.extend(Ext.Window, {
	width: 400,
	height: 160,
	modal: true,
	title: '资源库信息',
	layout: 'fit',
	plain: true,
	initComponent: function() {
		var me = this;
		this.addFlag = true;
		
		var store = new Ext.data.JsonStore({
			fields: ['name'],
			url: GetUrl('database/listNames.do')
		});
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: store
		});
		
		var wId = new Ext.form.TextField({ fieldLabel: '资源库标识', anchor: '-10' });
		var wName = new Ext.form.TextField({ fieldLabel: '资源库名称', anchor: '-10'});
		
		this.initData = function(meta) {
			this.addFlag = false;
			wConnection.setValue(meta.extraOptions.database);
			wId.setValue(meta.name);
			wName.setValue(meta.description);
		};
		
		this.getValue = function() {
			var data = {};
			data.name = wId.getValue();
			data.description = wName.getValue();
			data.type = 'KettleDatabaseRepository';
			data.extraOptions = {database: wConnection.getValue()};
			
			return data;
		};
		
		var onDatabaseCreate = function(dialog) {
			Ext.Ajax.request({
				url: GetUrl('database/create.do'),
				method: 'POST',
				params: {databaseInfo: Ext.encode(dialog.getValue())},
				success: function(response) {
					var json = Ext.decode(response.responseText);
					if(!json.success) {
						Ext.Msg.alert('系统提示', json.message);
					} else {
						dialog.close();
						store.load();
						wConnection.setValue(json.message);
					}
				}
			});
		};
		
		wConnection.on('beforequery', function() {
		    delete wConnection.lastQuery; 
		});
		
		this.items = new KettleForm({
			labelWidth: 90,
			border: false,
			items: [{
            	xtype: 'compositefield',
            	fieldLabel: '选择数据库连接',
            	anchor: '-10',
            	items: [wConnection, {
					xtype: 'button', text: '编辑...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initReposityDatabase(wConnection.getValue());
						});
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initReposityDatabase(null);
						});
					}
				}, {
					xtype: 'button', text: '删除', handler: function() {
						if(!Ext.isEmpty(wConnection.getValue())) {
							Ext.Ajax.request({
								url: GetUrl('database/remove.do'),
								method: 'POST',
								params: {databaseName: wConnection.getValue()},
								success: function(response) {
									var json = Ext.decode(response.responseText);
									if(!json.success) {
										Ext.Msg.alert('系统提示', json.message);
									} else {
										store.load();
										wConnection.setValue('');
									}
								},
								failure: function() {
									Ext.Msg.alert('连接服务器失败！');
								}
							});
						}
					}
    			}]
	        }, wId, wName]
		});
		
		this.bbar = ['->', {
			text: '确定', scope: this, handler: function() {
				Ext.Ajax.request({
					url: GetUrl('repository/add.do'),
					method: 'POST',
					params: {reposityInfo: Ext.encode(me.getValue()), add: this.addFlag},
					success: function(response) {
						var reply = Ext.decode(response.responseText);
						if(reply.success) {
							me.fireEvent('create', me);
						} else {
							Ext.Msg.alert(reply.title, reply.message);
						}
					}
			   });
			}
		}, {
			text: '创建或更新', scope: this, handler: function() {
				if(!Ext.isEmpty(wConnection.getValue()))
					this.checkInit(wConnection.getValue());
			}
		}, {
			text: '删除', handler: function() {
				Ext.Msg.show({
					   title:'系统提示',
					   msg: '您确信要删除该数据库中所有的资源库表？',
					   buttons: Ext.Msg.YESNO,
					   icon: Ext.MessageBox.WARNING,
					   fn: function(bId) {
						   if(bId == 'yes') {
							   Ext.Msg.prompt('系统提示', '请输入管理员密码:', function(btn, text){
								    if (btn == 'ok'){
								    	
								    	Ext.Ajax.request({
											url: GetUrl('database/drop.do'),
											method: 'POST',
											params: {reposityInfo: Ext.encode(me.getValue()), password: text},
											success: function(response) {
												var ret = Ext.decode(response.responseText);
												Ext.Msg.alert(ret.title, ret.message);
											}
									   });
								    	
								    }
								});
						   }
					   }
				});
			}
		}, {
			text: '取消', handler: function() {
				me.close();
			}
		}];
		
		KettleDatabaseRepositoryDialog.superclass.initComponent.call(this);
		this.addEvents('create');
	},
	
	checkInit: function(connection) {
		Ext.Ajax.request({
			url: GetUrl('database/checkInit.do'),
			method: 'POST',
			params: {connection: connection},
			scope: this,
			success: function(response) {
				var resObj = Ext.decode(response.responseText);
				
				if(resObj.unSupportedDatabase === true) {
					Ext.Msg.show({
					   title:'系统提示',
					   msg: '您指定的数据库是Kettle不支持的类型，是否继续？',
					   buttons: Ext.Msg.YESNO,
					   scope: this,
					   fn: function(bId) {
						   if(bId == 'yes') {
							   this.createInitSQL(resObj.opertype);
						   }
					   },
					   icon: Ext.MessageBox.QUESTION
					});
				} else {
					this.createInitSQL(resObj.opertype);
				}
				
			},
			failure: failureResponse
		});
	},
	
	createInitSQL: function(opertype) {
		var msg = '您确定是否要在该数据库中创建Kettle的数据表？', icon = Ext.MessageBox.QUESTION;
		if(opertype == 'update') {
			icon = Ext.MessageBox.WARNING;
			msg = '该数据库已被初始化，是否更新？';
		}
		
		Ext.Msg.show({
		   title:'系统提示',
		   msg: msg,
		   buttons: Ext.Msg.YESNO,
		   icon: icon,
		   scope: this,
		   fn: function(bId) {
			   if(bId == 'yes') {
				   Ext.Ajax.request({
						url: GetUrl('database/initSQL.do'),
						method: 'POST',
						params: {reposityInfo: Ext.encode(this.getValue()), upgrade: opertype == 'update'},
						scope: this,
						success: function(response, opts) {
							var resObj = Ext.decode(response.responseText);
							this.initDatabase(resObj.message);
						},
						failure: failureResponse
				   });
			   }
		   }
		});
	},
	
	initDatabase: function(script) {
		
		var scriptDialog = new KettleEditorDialog({title: '即将执行的SQL语句', theme: 'text/x-sql', canceltext: '关闭', suretext: '执行'});
		scriptDialog.on('ok', function(data) {
			
			scriptDialog.getEl().mask("正在执行，请稍后...", 'x-mask-loading');
			Ext.Ajax.request({
				url: GetUrl('database/execute.do'),
				method: 'POST',
				timeout: 120000,
				params: {reposityInfo: Ext.encode(this.getValue()), script: encodeURIComponent(data)},
				scope: this,
				success: function(response) {
					try {
						var ret = Ext.decode(response.responseText);
						var dialog = new EnterTextDialog({title: '执行结果'});
						dialog.show(null, function() {
							dialog.setText(decodeURIComponent(ret.message));
						});
					} finally {
						scriptDialog.getEl().unmask();
					}
					
					scriptDialog.close();
				},
				failure: function(response) {
					try {
						failureResponse(response);
					} finally {
						scriptDialog.getEl().unmask();
					}
				}
			});	
			
		}, this);
		scriptDialog.show(null, function() {
			scriptDialog.initData(decodeURIComponent(script));
		});
		
	}
});

Ext.reg('KettleDatabaseRepository', KettleDatabaseRepositoryDialog);