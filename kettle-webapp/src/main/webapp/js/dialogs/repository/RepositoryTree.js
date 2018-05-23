RepositoryTree = Ext.extend(KettleTree, {
	
	loadElement: 3,
	
	initComponent: function() {
		var loader = new Ext.tree.TreeLoader({
			dataUrl: GetUrl('repository/explorer.do'),
			baseParams: {loadElement: this.loadElement}
		});
		
		var root = this.root = new Ext.tree.AsyncTreeNode({
			text: '/',
			iconCls: 'imageFolder',
			loader: loader
		});
		
		loader.on('beforeload', function(l, node) {
			if(node.id == root.id)
				l.baseParams.path = null;
			else
				l.baseParams.path = node.attributes.path;
		}, this);
		
		RepositoryTree.superclass.initComponent.call(this);
		
		root.expand();
	},
	
	isTrans: function(node) {
		return node.attributes.iconCls == 'trans';
	},
	
	isJob: function(node) {
		return node.attributes.iconCls == 'job';
	}
	
});

RepositoryManageTree = Ext.extend(RepositoryTree, {
	initComponent: function() {
		var menu = new Ext.menu.Menu({
			items: [{
				text: '打开', scope: this, handler: this.openGraph
			},'-',{
	            text: '新建目录', scope: this, handler: this.newDir
	        }, {
	            iconCls: 'trans', text: '新建转换', scope: this, handler: this.newTrans
	        }, {
	            iconCls: 'job', text: '新建任务', scope: this, handler: this.newJob
	        }, '-', {
	        	text: '添加到调度', scope: this, handler: this.schedule
	        },{
				text: '查看历史日志', scope: this, handler: this.jobLog
			}, '-', {
	        	text: '重命名'
	        }, {
	            iconCls: 'delete', text: '删除', scope: this, handler: this.remove
	        }]
		});
    
	    this.on('contextmenu', function(node, e) {
	    	menu.showAt(e.getXY());
	    	this.getSelectionModel().select(node);
	    }, this);
	    this.on('dblclick', this.openGraph, this);
	    
	    this.tbar = [{
			text: '新建',
			menu: {
				items: [{
					iconCls: 'trans', text: '新建转换', scope: this, handler: this.newTrans
				},{
					iconCls: 'job', text: '新建任务', scope: this, handler: this.newJob
				}, '-', {
					text: '新建目录', scope: this, handler: this.newDir
				}, '-', {
					text: '打开', scope: this, handler: this.openGraph
				}]
			}
		}, {
			text: '资源库管理', /*disabled: true,*/
			menu: {
				items: [{
					text: '连接资源库', scope: this, handler: this.connect
				}, {
					text: '管理资源库', scope: this, handler: this.manage
				}, {
					text: '断开资源库', scope: this, handler: this.disconnect
				}, '-', {
					text: '导出资源库', scope: this, handler: this.exp
				}, {
					text: '导入资源库', scope: this, handler: this.imp
				}]
			}
		}, {
			text: '调度管理',
			menu: [{
				text: '任务管理', scope: this, handler: this.jobManage
			}]
		}, {
			text: '关于', 
			menu: [{
				text: '语言切换', scope: this, handler: function() {
					var localeCombo = new Ext.form.ComboBox({
						fieldLabel: '语言列表',
						anchor: '-10',
						displayField: 'desc',
						valueField: 'code',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: Ext.StoreMgr.get('localeStore')
				    });
					
					var win = new Ext.Window({
						title: '语言设置',
						width: 400,
						height: 100,
						modal: true,
						layout: 'fit',
						items: {
							xtype: 'KettleForm',
							labelWidth: 70,
							border: false,
							items: localeCombo
						},
						
						bbar: ['->', {
							text: '取消', scope: this, handler: function() {win.close();}
						}, {
							text: '确定', handler: function() {
								if(!Ext.isEmpty(localeCombo.getValue())) {
									Ext.Ajax.request({
										url: GetUrl('ui/locale.do'),
										method: 'POST',
										params: {locale: localeCombo.getValue()},
										success: function(response) {
											var resObj = Ext.decode(response.responseText);
											if(resObj.success === true) {
												Ext.Msg.show({
													   title: '系统提示',
													   msg: '配置已保存，请重启系统后生效！',
													   buttons: Ext.Msg.OK,
													   icon: Ext.MessageBox.INFO
													});
												win.close();
											}
										}
									});
								}
							}
						}]
					});
					
					win.show();
				}
			}, {
				text: '关于', scope: this, handler: function() {
					Ext.Msg.show({
						title: '系统提示',
						msg: 'KettleWeb版1.0.0，基于Kettle6.0.1.0开发，QQ交流群：565815856',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.INFO
					});
				}
			}]
			
			
		}];
	    
	    RepositoryManageTree.superclass.initComponent.call(this);
	},
	
	connect: function() {
		var dialog = new RepositoriesDialog();
		dialog.on('loginSuccess', function() {
			dialog.close();
			this.getRootNode().removeAll(true);
			this.getRootNode().reload();
		}, this);
		dialog.show();
	},
	
	manage: function() {
		var dialog = new RepositoryManageDialog();
		dialog.show(null, function() {
			dialog.initData();
		});
	},
	
	disconnect: function() {
		Ext.Ajax.request({
			url: GetUrl('repository/logout.do'),
			method: 'POST',
			scope: this,
			success: function(response) {
				var reply = Ext.decode(response.responseText);
				if(reply.success) {
					this.getRootNode().removeAll(true);
					this.getRootNode().reload();
				}
			}
		});
	},
	
	newTrans: function() {
		var sm = this.getSelectionModel(), node = sm.getSelectedNode(), me = this;
		if(node && !node.isLeaf()) {
			Ext.Msg.prompt('系统提示', '请输入转换名称:', function(btn, text){
			    if (btn == 'ok' && text != '') {
			    	Ext.getBody().mask('正在创建转换，请稍后...');
			    	
			    	Ext.Ajax.request({
						url: GetUrl('repository/createTrans.do'),
						method: 'POST',
						params: {dir: node.attributes.path, transName: text},
						success: function(response) {
							try {
								var path = Ext.decode(response.responseText).message;
								node.reload(function() {
									var child = node.findChild('path', path);
									child && child.select();
									me.openGraph();
								});
							} finally {
								Ext.getBody().unmask();
							}
						},
						failure: failureResponse
				   });
			    	
			    }
			});
		} else {
			Ext.Msg.show({
			   title: '系统提示',
			   msg: '请选择资源库中的一个目录!',
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.WARNING
			});
		}
	},
	
	newJob: function() {
		var sm = this.getSelectionModel(), me = this;
		var node = sm.getSelectedNode();
		if(node && !node.isLeaf()) {
			Ext.Msg.prompt('系统提示', '请输入任务名称:', function(btn, text){
			    if (btn == 'ok' && text != ''){
			    	Ext.getBody().mask('正在创建任务，请稍后...');
			    	
			    	Ext.Ajax.request({
						url: GetUrl('repository/createJob.do'),
						method: 'POST',
						params: {dir: node.attributes.path, jobName: text},
						success: function(response) {
							try {
								var path = Ext.decode(response.responseText).message;
								node.reload(function() {
									var child = node.findChild('path', path);
									child && child.select();
									me.openGraph();
								});
							} finally {
								Ext.getBody().unmask();
							}
						},
						failure: failureResponse
				   });
			    	
			    }
			});
		} else {
			Ext.Msg.show({
			   title: '系统提示',
			   msg: '请选择资源库中的一个目录!',
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.WARNING
			});
		}
	},
	
	newDir: function() {
		var sm = this.getSelectionModel();
		var node = sm.getSelectedNode();
		if(node && !node.isLeaf()) {
			Ext.Msg.prompt('系统提示', '请输入目录名称:', function(btn, text){
			    if (btn == 'ok' && text != ''){
			    	Ext.getBody().mask('正在创建目录，请稍后...');
			    	
			    	Ext.Ajax.request({
						url: GetUrl('repository/createDir.do'),
						method: 'POST',
						params: {dir: node.attributes.path, name: text},
						success: function(response) {
							try {
								var path = Ext.decode(response.responseText).message;
								node.reload(function() {
									var child = node.findChild('path', path);
									child && child.select();
									child.expand();
								});
							} finally {
								Ext.getBody().unmask();
							}
						},
						failure: failureResponse
				   });
			    	
			    }
			});
		} else {
			Ext.Msg.show({
			   title: '系统提示',
			   msg: '请选择资源库中的一个目录!',
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.WARNING
			});
		}
	},
	
	remove: function() {
    	var sm = this.getSelectionModel(), node = sm.getSelectedNode();
		if(node) {
			Ext.Msg.show({
				   title:'系统提示',
				   msg: '您确定要删除该对象吗？',
				   buttons: Ext.Msg.YESNO,
				   icon: Ext.MessageBox.WARNING,
				   fn: function(bId) {
					   if(bId == 'yes') {
						   Ext.Ajax.request({
								url: GetUrl('repository/drop.do'),
								method: 'POST',
								params: {path: node.attributes.path, type: node.attributes.type},
								success: function(response) {
									decodeResponse(response, function(resObj) {
										node.parentNode.reload();
									});
								},
								failure: failureResponse
						   });
					   }
				   }
			});
		}
    },
    
    schedule: function() {
    	var sm = this.getSelectionModel(), node = sm.getSelectedNode();
		if(node) {
			if(this.isTrans(node) || this.isJob(node)) {
				var dialog = new Scheduler2Dialog();
				dialog.on('ok', function(data) {
					data.setAttribute('name', node.attributes.path);
					data.setAttribute('group', 'DEFAULT');
					
					Ext.Ajax.request({
						url: GetUrl('schedule/scheduleJob.do'),
						method: 'POST',
						params: {schedulerXml: mxUtils.getXml(data)},
						success: function(response) {
							decodeResponse(response, function(resObj) {
								Ext.Msg.show({
								   title: resObj.title,
								   msg: resObj.message,
								   buttons: Ext.Msg.OK,
								   icon: Ext.MessageBox.INFO
								});
							});
						},
						failure: failureResponse
				   });
				});
				dialog.show(null, function() {
					dialog.initData(node.attributes.path);
				});
			}
		}
    },
	
	openGraph: function() {
		var node = this.getSelectionModel().getSelectedNode(), me = this;
		if(node && node.isLeaf()) {
			Ext.getBody().mask('正在加载，请稍后...', 'x-mask-loading');
			
			var path = node.attributes.path;
			var type = node.attributes.type;
			Ext.Ajax.request({
				url: GetUrl('repository/open.do'),
				timeout: 120000,
				params: {path: path, type: type},
				method: 'POST',
				success: function(response, opts) {
					try {
						var xtype = (type == 'job') ? 'JobGraph' : 'TransGraph';
						var graphPanel = Ext.create({repositoryId: path}, xtype);
						var tabPanel = Ext.getCmp('TabPanel');
						tabPanel.add(graphPanel);
						tabPanel.setActiveTab(graphPanel.getId());
						
						var xmlDocument = mxUtils.parseXml(decodeURIComponent(response.responseText));
						var decoder = new mxCodec(xmlDocument);
						var node = xmlDocument.documentElement;
						
						var graph = graphPanel.getGraph();
						decoder.decode(node, graph.getModel());
						
						graphPanel.fireEvent('load')
					} finally {
						Ext.getBody().unmask();
					}
					
					if(Ext.util.Cookies.get('coreobjects') != 'notip') {
						var noText = Ext.MessageBox.buttonText.no;
						Ext.MessageBox.buttonText.no = '不再提示';
						Ext.MessageBox.show({
							title:'系统提示',
							msg: '左侧核心对象组件面板中，红色字体的组件未实现，不可拖拽，黑色字体的组件已经实现，完全可用，如有其它疑问请加群：565815856',
							buttons: Ext.Msg.YESNO,
							fn: function(bId) {
								 Ext.MessageBox.buttonText.no = noText;
								   if(bId == 'no') {
									   Ext.util.Cookies.set('coreobjects', 'notip');
								   }
							},
							icon: Ext.MessageBox.WARNING
						});
					}
				},
				failure: failureResponse
			});
		} else {
			Ext.Msg.show({
			   title: '系统提示',
			   msg: '请选择资源库中的一个对象!',
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.WARNING
			});
		}
	},
	
	jobManage: function() {
		var dialog = new SchedulerManageDialog();
		dialog.show();
	},
	
	jobLog: function() {
		var sm = this.getSelectionModel(), node = sm.getSelectedNode();
		if(node) {
			var dialog = new SchedulerLogDialog();
			dialog.show(null, function() {
				dialog.initData(node.attributes.path);
			});
		}
	},
	
	exp: function() {
		var dialog = new RepositoryExpWindow();
		dialog.show();
	},
	
	imp: function() {
		var form = new KettleForm({
			labelWidth: 1,
			border: false,
			fileUpload: true,
			items: new FileUploadField({name: 'file', anchor: '-10', buttonText: '浏览...'})
		});
		var me = this;
		var win = new Ext.Window({
			title: '请选择导出文件',
			width: 350,
			height: 105,
			modal: true,
			layout: 'fit',
			items: form,
			bbar: ['->', {
				text: '确定', handler: function() {
					form.getForm().submit({
	                    url: GetUrl('attachment/upload.do'),
	                    waitMsg: '正在上传导出文件，请稍后...',
	                    success: function(fp, action){
	                    	win.close();
	                    	var filePath = action.result.message;
        					var dialog = new RepositoryImpWindow({filePath: filePath});
        					dialog.on('ok', function() {
        						me.getRootNode().reload();
        					});
        					dialog.show();
	                    },
	                    failure: failureResponse
	                });
				}
			}]
		});
		win.show();
	}
});

RepositoryExplorerWindow = Ext.extend(Ext.Window, {
	width: 400,
	height: 500,
	layout: 'border',
	modal: true,
	title: '资源库浏览',
	loadElement: 1,
	
	initComponent: function() {
		var textfield = new Ext.form.TextField({ flex: 1 });
		var tree = new RepositoryTree({region: 'center', loadElement: this.loadElement});
		
		var ok = function() {
			if(!Ext.isEmpty(textfield.getValue())) {
				var path = textfield.getValue();
				var directory = path.substring(0, path.lastIndexOf('/') + 1);
				var name = path.substring(path.lastIndexOf('/') + 1);
				this.fireEvent('ok', directory, name);
			}
		};
		
		this.items = [tree, {
			region: 'south',
			height: 30,
			layout: 'hbox',
			bodyStyle: 'padding: 3px',
			items: [textfield, {
				width: 5, border: false
			},{
				xtype: 'button', text: '确定', scope: this, handler: ok
			}]
		}];
		
		RepositoryExplorerWindow.superclass.initComponent.call(this);
		this.addEvents('ok');
		
		tree.on('click', function(node) {
			if(tree.isTrans(node) || tree.isJob(node))
				textfield.setValue(node.attributes.path);
			else
				textfield.setValue('');
		});
	}
});