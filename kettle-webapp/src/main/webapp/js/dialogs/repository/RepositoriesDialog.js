RepositoriesDialog = Ext.extend(Ext.Window, {
	width: 350,
	height: 500,
	modal: true,
	title: '资源库连接',
	layout: 'fit',
	plain: true,
	initComponent: function() {
		var me = this;
		
		var store = new Ext.data.JsonStore({
			fields: ['type', 'name', 'description', 'extraOptions'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('repository/list.do'),
				method: 'POST'
			})
		});
		
		var availableRepositories =  new ListView({
			valueField: 'name',
			store: store,
			columns: [{
				width: 1, dataIndex: 'name'
			}]
		});
		
		store.load();
		
		var username = new Ext.form.TextField({fieldLabel: '用户名', anchor: '-1', value: 'admin'});
		var userPassword = new Ext.form.TextField({fieldLabel: '密码', anchor: '-1'});
		var showAtStartup = new Ext.form.Checkbox({ boxLabel: '在启动时显示此对话框' });
		
		availableRepositories.on('selectionchange', function() {
			if(availableRepositories.getSelectedRecords().length > 0) {
				var rec = availableRepositories.getSelectedRecords()[0];
				if(rec.get('type') == 'KettleDatabaseRepository') {
					username.enable();
					userPassword.enable();
					
					userPassword.focus();
				} else if(rec.get('type') == 'KettleFileRepository') {
					username.disable();
					userPassword.disable();
				}
			}
		});
		
		var form = new Ext.form.FormPanel({
			region: 'south',
			height: 90,
			border: false,
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 50,
			items: [username, userPassword, showAtStartup]
		});
		
		this.items = [{
			layout: 'fit',
			border: false,
			defaults: {border: false},
			bodyStyle: 'padding: 5px',
			items: {
				layout: 'border',
				items: [{
					region: 'center',
					layout: 'fit',
					items: availableRepositories
				}, form]
			}
		}];
		
		this.tbar = [{
			text: '新增资源库', handler: function() {
				var selectionDialog = new EnterSelectionDialog({
					title: '选择仓库类型',
					width: 500, height: 130,
					valueField: 'type',
					dataUrl: GetUrl('repository/types.do')
				});
				selectionDialog.on('sure', function(ct) {
					var dialog = Ext.create({}, ct);
					dialog.on('create', function() {
						dialog.close();
						store.load();
					});
					dialog.show();
				});
				selectionDialog.show(null, function() {
					selectionDialog.load();
				});
			}
		}, {
			text: '修改资源库', handler: function() {
				if(!Ext.isEmpty(availableRepositories.getValue())) {
					store.each(function(rec) {
						if(rec.get('name') == availableRepositories.getValue()) {
							var dialog = new Ext.create({}, rec.get('type'));
							dialog.on('create', function() {
								dialog.close();
								store.load();
							});
							dialog.show(null, function() {
								dialog.initData(rec.json);
							});
						}
					})
				}
			}
		}, {
			text: '删除资源库', handler: function() {
				if(!Ext.isEmpty(availableRepositories.getValue())) {
					
					Ext.Ajax.request({
						url: GetUrl('repository/remove.do'),
						params: {repositoryName: availableRepositories.getValue()},
						method: 'POST',
						success: function(response) {
							var reply = Ext.decode(response.responseText);
							if(reply.success)
								store.load();
						}
					});
				}
			}
		}];
		
		this.bbar = ['->', {
			text: '确定', handler: me.login, scope: this
		}, {
			text: '取消', handler: function() {
				me.close();
			}
		}];
		
		RepositoriesDialog.superclass.initComponent.call(this);
		this.addEvents('loginSuccess');
		
		this.on('afterrender', function(c) {
			new Ext.KeyMap(c.getEl(), [{
	            key: [10,13],
	            fn: function(){ 
	            	me.login();
	            }
	        }]);
		});
		
		this.getValue = function() {
			var data = {};
			data.reposityId = availableRepositories.getValue();
			data.username = username.getValue();
			data.password = userPassword.getValue();
			data.atStartupShown = showAtStartup.getValue();
			
			return data;
		};
	},
	
	login: function() {
		var data = this.getValue();
		if(Ext.isEmpty(data.reposityId)) {
			alert('请选择您要登录的资源库！');
			return;
		}
		
		Ext.Ajax.request({
			url: GetUrl('repository/login.do'),
			method: 'POST',
			params: {loginInfo: Ext.encode(data)},
			scope: this,
			success: function(response) {
				var resObj = Ext.decode(response.responseText);
				if(resObj.success === true)
					this.fireEvent('loginSuccess');
			},
			failure: failureResponse
	   });
	}
	
});