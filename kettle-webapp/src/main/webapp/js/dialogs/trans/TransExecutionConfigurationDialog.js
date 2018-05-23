TransExecutionConfigurationDialog = Ext.extend(Ext.Window, {
	width: 600,
	height: 530,
	layout: 'fit',
	title: '执行转换',
	modal: true,
	bodyStyle: 'padding: 5px',
	iconCls: 'trans',
	btnText: '启动',
	runMode: 'normal',	//运行模式,normal - 正常模式,fix - 兼容模式
	
	initComponent: function() {
		var  me = this;
		
		var wExecLocal = new Ext.form.Radio({name: 'execMethod', fieldLabel: '本地执行'});
		var wExecRemote = new Ext.form.Radio({name: 'execMethod', fieldLabel: '远程执行'});
		var wExecCluster = new Ext.form.Radio({name: 'execMethod', fieldLabel: '集群方式执行'});
		var wRemoteHost = null;
		if(this.runMode == 'normal') {
			var proxy=new Ext.data.HttpProxy({url:"/slave/getSlaveSelect.do"});
			var hostName=Ext.data.Record.create([
				{name:"hostId",type:"String",mapping:"hostId"},
				{name:"hostName",type:"String",mapping:"hostName"},
			]);
			var reader=new Ext.data.JsonReader({},hostName);
			var store=new Ext.data.Store({
				proxy:proxy,
				reader:reader
			});
			wRemoteHost = new Ext.form.ComboBox({
				fieldLabel: '远程主机',
				anchor: '-20',
				displayField: 'hostId',
				valueField: 'hostName',
				typeAhead: true,
				mode: 'remote',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus:true,
				//store: getActiveGraph().getSlaveServerStore()
				store:store
			});
		} else {
			wRemoteHost = new Ext.form.TextField({fieldLabel: '远程主机', anchor: '-20', readOnly: true});
		}
		var wPassExport = new Ext.form.Checkbox({fieldLabel: '将导出的文件发送到远程服务器'});
		
		var wPrepareExecution = new Ext.form.Checkbox({boxLabel: '提交转换'});
		var wPostTransformation = new Ext.form.Checkbox({boxLabel: '准备执行'});
		var wStartExecution = new Ext.form.Checkbox({boxLabel: '开始执行'});
		var wShowTransformations = new Ext.form.Checkbox({boxLabel: '显示转换'});
		var wClusterChcGroup = new Ext.form.CheckboxGroup({
            columns: 1,
            width: 100,
            items: [wPrepareExecution, wPostTransformation, wStartExecution, wShowTransformations]
		});
		
		var wSafeMode = new Ext.form.Checkbox({fieldLabel: '使用安全模式'});
		var wGatherMetrics = new Ext.form.Checkbox({fieldLabel: 'Gather performance metrics'});
		var wLogLevel = new Ext.form.ComboBox({
			fieldLabel: '日志级别',
			displayField: 'desc',
			valueField: 'code',
			anchor: '-20',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('logLevelStore'),
		    hiddenName: 'logLevel',
		    value: 3
		});
		var wReplayDate = new Ext.form.TextField({fieldLabel: '重放日期(yyyy/MM/dd HH:mm:ss)', anchor: '-20'});
		
		var paramStore = new Ext.data.JsonStore({
			fields: ['name', 'value', 'default_value']
		});
		var varStore = new Ext.data.JsonStore({
			fields: ['name', 'value']
		});
		var argStore = new Ext.data.JsonStore({
			fields: ['name', 'value']
		});
		
		this.setValue = function(data) {
			wExecLocal.setValue(data.exec_local == 'Y');
			
			wExecRemote.setValue(data.exec_remote == 'Y');
			wRemoteHost.setValue(data.remote_server);
			wPassExport.setValue(data.pass_export == 'Y');
			
			wExecCluster.setValue(data.exec_cluster == 'Y');
			wPrepareExecution.setValue(data.cluster_prepare == 'Y');
			wPostTransformation.setValue(data.cluster_post == 'Y');
			wStartExecution.setValue(data.cluster_start == 'Y');
			wShowTransformations.setValue(data.cluster_show_trans == 'Y');
			
			wSafeMode.setValue(data.safe_mode == 'Y');
			wGatherMetrics.setValue(data.gather_metrics == 'Y');
			wLogLevel.setValue(data.log_level);
			wReplayDate.setValue(data.replay_date);
			
			paramStore.loadData(data.parameters);
			varStore.loadData(data.variables);
			argStore.loadData(data.arguments);
			
			this.data = data;
		};
		
		var startExec = function() {
			var data = this.data;
			data.exec_local = wExecLocal.getValue() ? "Y" : "N";
			
			data.exec_remote = wExecRemote.getValue() ? "Y" : "N";
			data.remote_server = wRemoteHost.getValue();
			data.pass_export = wPassExport.getValue() ? "Y" : "N";
			
			data.exec_cluster = wExecCluster.getValue() ? "Y" : "N";
			data.cluster_prepare = wPrepareExecution.getValue() ? "Y" : "N";
			data.cluster_post = wPostTransformation.getValue() ? "Y" : "N";
			data.cluster_start = wStartExecution.getValue() ? "Y" : "N";
			data.cluster_show_trans = wShowTransformations.getValue() ? "Y" : "N";
			
			data.safe_mode = wSafeMode.getValue() ? "Y" : "N";
			data.gather_metrics = wGatherMetrics.getValue() ? "Y" : "N";
			data.log_level = wLogLevel.getValue();
			data.replay_date = wReplayDate.getValue();
			data.parameters = paramStore.toJson();
			data.variables = varStore.toJson();
			data.arguments = argStore.toJson();
			
			if(me.fireEvent('beforestart', data) !== false) {
				me.setDisabled(true);
				Ext.Ajax.request({
					url: GetUrl('trans/run.do'),
					params: {graphXml: getActiveGraph().toXml(), executionConfiguration: Ext.encode(data)},
					method: 'POST',
					success: function(response) {
						me.setDisabled(false);
						decodeResponse(response, function(resObj) {
							me.close();
							setTimeout(function() {
//								getActiveGraph().fireEvent('doRun', resObj.message);
								getActiveGraph().toRun(resObj.message);
							}, 500);
						});
					},
					failure: failureResponse
				});
			}
		};
		
		wExecLocal.on('check', function(rb, checked) {
			if(checked) {
				wRemoteHost.disable();
				wPassExport.disable();
				wClusterChcGroup.disable();
			}
		});
		wExecRemote.on('check', function(rb, checked) {
			if(checked) {
				wRemoteHost.enable();
				wPassExport.enable();
				wClusterChcGroup.disable();
			} else {
				wRemoteHost.disable();
				wPassExport.disable();
			}
		});
		wExecCluster.on('check', function(rb, checked) {
			if(checked) {
				wClusterChcGroup.enable();
				wRemoteHost.disable();
				wPassExport.disable();
			} else {
				wClusterChcGroup.disable();
			}
		});
		
		var wParams = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			tbar: [{
				text: '新增参数', handler: function() {
	                var rec = new  paramStore.recordType({ name: '',  value: '',  default_value: '' });
	                wParams.stopEditing();
	                wParams.getStore().insert(0, rec);
	                wParams.startEditing(0, 0);
				}
			},{
				text: '删除参数'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '命名参数', dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
			},{
				header: '默认值', dataIndex: 'default_value', width: 100, editor: new Ext.form.TextField()
			}],
			store: paramStore
		});
		
		var wVariables = new Ext.grid.EditorGridPanel({
			title: '变量',
			tbar: [{
				text: '新增变量', handler: function() {
	                var rec = new varStore.recordType({ name: '', value: '' });
	                wVariables.stopEditing();
	                wVariables.getStore().insert(0, rec);
	                wVariables.startEditing(0, 0);
				}
			},{
				text: '删除变量'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '变量', dataIndex: 'name', width: 200, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'value', width: 250, editor: new Ext.form.TextField()
			}],
			store: varStore
		});
		
		var wArguments = new Ext.grid.EditorGridPanel({
			title: '位置参数',
			tbar: [{
				text: '新增参数', handler: function() {
	                var rec = new argStore.recordType({ value: '' });
	                wArguments.stopEditing();
	                wArguments.getStore().insert(0, rec);
	                wArguments.startEditing(0, 0);
				}
			},{
				text: '删除参数'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '位置参数', dataIndex: 'name', width: 250
			},{
				header: '值', dataIndex: 'value', width: 250, editor: new Ext.form.TextField()
			}],
			store: argStore
		});
		
		this.items = new Ext.TabPanel({
			activeTab: 0,
			plain: true,
			deferredRender: false,
		    items: [{
	    		xtype: 'form',
	    		title: '基本配置',
	    		labelWidth: 200,
	    		labelAlign: 'right',
	    		bodyStyle: 'padding: 10px',
	    		items: [{
	    			xtype: 'fieldset',
	    			title: '执行方式',
	    			items: [wExecLocal, wExecRemote, wRemoteHost, wPassExport, wExecCluster, wClusterChcGroup]
	    		},{
	    			xtype: 'fieldset',
	    			title: '细节',
	    			items: [wSafeMode, wGatherMetrics, wLogLevel, wReplayDate]
	    		}]
	    	}, wParams, wVariables, wArguments]
		});
		
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {this.close();}
		}, {
			text: this.btnText, scope: this, handler: startExec
		}];
		
		TransExecutionConfigurationDialog.superclass.initComponent.call(this);
		
		this.addEvents('beforestart');
		
		
	},
	
	initData: function(defaultExecutionConfig) {
		this.setValue(defaultExecutionConfig);
	},
	
	initLocalData: function(data) {
		this.setValue(data);
	}
});

Ext.reg('TransExecutionConfigurationDialog', TransExecutionConfigurationDialog);