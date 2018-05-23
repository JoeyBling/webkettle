JobExecutor = Ext.extend(Ext.util.Observable, {

	executionId: null,
	
	constructor: function() {
		this.addEvents('beforerun', 'run', 'result','stop');
		
		this.on('run', function(executionId) {
			this.executionId = executionId;
			this.loadResult();
		}, this);
        this.on('stop', function(result) {
            this.executionId = null;
            this.fireEvent('result', result);
            this.fireEvent('finish');
        }, this);
	},
	
	loadResult: function() {
		var me = this;
		Ext.Ajax.request({
			url: GetUrl('job/result.do'),
			params: {executionId: this.executionId},
			method: 'POST',
			success: function(response) {
				var result = Ext.decode(response.responseText);
				
				me.fireEvent('result', result);
				if(!result.finished) {
					setTimeout(function() { me.loadResult(); }, 100);
				} else {
					me.executionId = null;
				}
			},
			failure: failureResponse
		});
	},
    stop: function() {
        var me = this;
        if(this.executionId == null)
            return;
        Ext.Ajax.request({
            url: GetUrl('job/stop.do'),
            method: 'POST',
            params: {executionId: this.executionId},
            success: function(response) {
                if(response.responseText=="faile"){
                    Ext.MessageBox.alert("该作业为远程执行,请在任务监控模块进行停止!");
                }else{
                    var resObj = Ext.decode(response.responseText);
                    me.fireEvent('stop', resObj);
                }
            },
            failure: failureResponse
        });
    },
	isRunning: function() {
		return this.executionId != null;
	}

});

JobGraph = Ext.extend(BaseGraph, {
	iconCls: 'job',
	
	initComponent: function() {

		var resultPanel = new JobResult({hidden: !this.showResult});

        var jobExecutor = this.jobExecutor = new JobExecutor();
        jobExecutor.on('beforerun', function(executor,defaultExecutionConfig) {
            var dialog = new JobExecutionConfigurationDialog();
            dialog.show(null, function() {
                dialog.initData(defaultExecutionConfig);
            });
        });
        jobExecutor.on('result', this.doResult, this);
        if(this.readOnly === false && this.Executable===false ) {


			this.tbar = [{
				iconCls: 'save', scope: this, tooltip: '保存这个任务', handler: this.save
			}, '-', {
				iconCls: 'run', scope: this, tooltip: '运行这个任务', handler: this.run
			}, {
				iconCls: 'stop', scope: this, tooltip: '停止这个任务', handler: this.stop
			}, {
				iconCls: 'SQLbutton', scope: this, tooltip: '产生需要运行这个转换的SQL', handler: this.getSQL
			}/*, '-', {
				iconCls: 'SlaveServer', scope: this, handler: this.showSlaves
			}*/, '-', {
				iconCls: 'show-results', scope: this, handler: this.showResultPanel
			},{
				iconCls: 'databasesCls', scope: this, handler: this.databaseConn,tooltip: '数据库连接'
			}];
            var finish = function() {
                var tb = this.getTopToolbar();
                tb.find('iconCls', 'pause')[0].disable();
                tb.find('iconCls', 'stop')[0].disable();
            };
            jobExecutor.on('finish', finish, this);
		}else if(this.Executable===true&&this.readOnly === false){

			this.tbar = [{
				iconCls: 'run', scope: this, tooltip: '运行这个任务', handler: this.run
			}, {
				iconCls: 'stop', scope: this, tooltip: '停止这个任务', handler: this.stop
			}];
		}
		this.items = [resultPanel];
		
		
		JobGraph.superclass.initComponent.call(this);
		
		
		this.on('load', function() {
			var graph = this.getGraph();
			var root = graph.getDefaultParent();
			
			graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){  
				Ext.each(evt.getProperty('edit').changes, function(change) {
					if (change.constructor == mxCellAttributeChange && change.cell != null)    {
						var cell = change.cell;
						if(cell.isVertex() && cell.value.nodeName == 'JobEntry' && change.attribute == 'label') {
							
							graph.getModel().beginUpdate();
					        try
					        {

					        	Ext.each(graph.getOutgoingEdges(cell), function(edge) {
					        		var edit = new mxCellAttributeChange(edge, 'from', change.value);
						        	graph.getModel().execute(edit);
								});
					        	
					        	Ext.each(graph.getIncomingEdges(cell), function(edge) {
					        		var edit = new mxCellAttributeChange(edge, 'to', change.value);
						        	graph.getModel().execute(edit);
								});
					        } finally{
					            graph.getModel().endUpdate();
					        }
						}
					}
				});
			});
			
		}, this);
	},
	
	doResult: function(result) {
		var resultPanel = this.layout.south.panel;
		resultPanel.loadLocal(result);
	},
	
	toRun: function(executionId) {
		var resultPanel = this.layout.south.panel;
		if(!resultPanel.isVisible())
			this.showResultPanel();
		
		this.jobExecutor.fireEvent('run', executionId);
	},
	
	save: function() {
		Ext.getBody().mask('正在保存，请稍后...', 'x-mask-loading');
		Ext.Ajax.request({
			url: GetUrl('job/save.do'),
			params: {graphXml: encodeURIComponent(this.toXml())},
			method: 'POST',
			success: function(response) {
				try{
					decodeResponse(response, function(resObj) {
						Ext.Msg.show({
							title: '系统提示',
							msg: resObj.message,
							buttons: Ext.Msg.OK,
							icon: Ext.MessageBox.INFO
						});
					});
				}finally{
					Ext.getBody().unmask();
				}
			},
			failure: failureResponse
		});
	},
	
	run: function() {
		var jobExecutor = this.jobExecutor;
		if(jobExecutor.isRunning()) {
			Ext.Msg.alert('系统提示', '任务正在执行，请稍后...');
			return;
		}
		var graphXml=this.toXml();
		if(this.Executable || this.readOnly){
			Ext.Ajax.request({
				url: GetUrl('job/initRun.do'),
				method: 'POST',
				params: {graphXml: graphXml},
				success: function(response) {
					var resObj = Ext.decode(response.responseText);
					jobExecutor.fireEvent('beforerun', jobExecutor, resObj);
				},
				failure: failureResponse
			});
		}else{
			//执行前先保存该作业
			Ext.getBody().mask('正在保存，请稍后...', 'x-mask-loading');

			Ext.Ajax.request({
				url: GetUrl('job/save.do'),
				params: {graphXml: encodeURIComponent(graphXml)},
				method: 'POST',
				success: function(response) {
					var resp=response;
					try{
						// 获取执行参数
						Ext.Ajax.request({
							url: GetUrl('job/initRun.do'),
							method: 'POST',
							params: {graphXml: graphXml},
							success: function(response) {
								var resObj = Ext.decode(response.responseText);
								jobExecutor.fireEvent('beforerun', jobExecutor, resObj);
								decodeResponse(resp, function(resObj) {
									Ext.Msg.show({
										title: '系统提示',
										msg: resObj.message,
										buttons: Ext.Msg.OK,
										icon: Ext.MessageBox.INFO
									});
								});
							},
							failure: failureResponse
						});

					}finally{
						Ext.getBody().unmask();
					}
				},
				failure: failureResponse
			});
		}
	},
    stop: function() {
        this.jobExecutor.stop();
    },
	showResultPanel: function() {
		var resultPanel = this.layout.south.panel;
		
		resultPanel.setVisible( !resultPanel.isVisible() );
		this.doLayout();
	},
	databaseConn:function(){
		var grid=new DatabaseConnGrid();
		grid.getColumnModel().setHidden(1,true);
		var databaseConnW=new Ext.Window({
			title:"连接管理",
			width:750,
			modal:true,
			items:[grid]
		});
		databaseConnW.show();
	},
	
	initContextMenu: function(menu, cell, evt) {
		var graph = this.getGraph(), me = this;
		if(this.Executable==false && this.readOnly==false){
			if(cell == null) {
                menu.addItem('新建注释', null, function(evt) {
                    me.createNote(evt);
                }, null, null, true);
				menu.addItem('从剪贴板粘贴步骤', null, function(){alert(1);}, null, null, !mxClipboard.isEmpty());
				menu.addSeparator(null);
				menu.addItem('全选', null, function(){me.getGraph().selectVertices();}, null, null, true);
				menu.addItem('清除选择', null, function(){me.getGraph().clearSelection();}, null, null, !graph.isSelectionEmpty());
				menu.addSeparator(null);
				menu.addItem('查看图形文件', null, function(){
					var dialog = new TextAreaDialog();
					dialog.show(null, function() {
						dialog.initData(me.toXml());
					});
				}, null, null, true);
				menu.addItem('查看引擎文件', null, function(){
					Ext.Ajax.request({
						url: GetUrl('job/engineXml.do'),
						params: {graphXml: me.toXml()},
						method: 'POST',
						success: function(response) {
							var dialog = new TextAreaDialog();
							dialog.show(null, function() {
								dialog.initData(response.responseText);
							});
						}
					});
				}, null, null, true);
				menu.addSeparator(null);
				// menu.addItem('作业设置', null, function() {
				// 	var transDialog = new TransDialog();
				// 	transDialog.show();
				// }, null, null, true);
			} else if(cell.isVertex()) {
				menu.addItem('新节点', null, function(){alert(1);}, null, null, true);
				menu.addItem('编辑作业入口', null, function(){
					me.editCell(cell);
				}, null, null, true);
				menu.addItem('编辑作业入口描述信息', null, function(){alert(1);}, null, null, true);
				menu.addSeparator(null);
				menu.addItem('复制被选择的作业入口到剪贴板', null, function(){mxClipboard.copy(graph);}, null, null, true);
				menu.addItem('复制作业入口', null, function(){mxClipboard.copy(graph);mxClipboard.paste(graph);}, null, null, true);
				menu.addItem('删除所有该作业入口的副本', null, function(){graph.removeCells();}, null, null, true);
				menu.addItem('隐藏作业入口', null, function(){alert(1);}, null, null, true);
				menu.addItem('拆开节点', null, function(){alert(1);}, null, null, true);
				menu.addSeparator(null);

				var text = 'Run Next Entries in Parallel';
				if('Y' == cell.getAttribute('parallel'))
					text = "[√]Run Next Entries in Parallel";

				menu.addItem(text, null, function(){
					graph.getModel().beginUpdate();
					try
					{
						var edit = new mxCellAttributeChange(cell, 'parallel', 'Y' == cell.getAttribute('parallel') ? 'N' : "Y");
						graph.getModel().execute(edit);

						var edges = graph.getOutgoingEdges(cell);
						for(var i=0; i<edges.length; i++) {
							var edge = edges[i];

							var label = [];
							if(edge.getAttribute('unconditional') == 'Y')
								label.push(kettle.imageUnconditionalHop);
							else if(edge.getAttribute('evaluation') == 'Y')
								label.push(kettle.imageTrue);
							else
								label.push(kettle.imageFalse);

							if(cell.getAttribute('parallel') == 'Y')
								label.push(kettle.imageParallelHop);

							var edit = new mxCellAttributeChange(edge, 'label', Ext.encode(label));
							graph.getModel().execute(edit);
						}
					} finally
					{
						graph.getModel().endUpdate();
					}

				}, null, null, true);
			} else if(cell.isEdge()) {
				var submenu = menu.addItem('评价', null, null, null, null, true);

				var text = '无条件的', text1 = '当结果为真的时候继续下一步', text2 = '当结果为假的时候继续下一步';
				if('Y' == cell.getAttribute('unconditional'))
					text = "[√]无条件的";
				else if('Y' == cell.getAttribute('evaluation'))
					text1 = "[√]当结果为真的时候继续下一步";
				else
					text2 = "[√]当结果为假的时候继续下一步";

				menu.addItem(text, null, function() {
					if(cell.getAttribute('unconditional') == 'Y')
						return;

					graph.getModel().beginUpdate();
					try
					{
						var edit = new mxCellAttributeChange(cell, 'unconditional', 'Y');
						graph.getModel().execute(edit);

						var label = [kettle.imageUnconditionalHop];
						if(cell.source.getAttribute('parallel') == 'Y')
							label.push(kettle.imageParallelHop);

						var edit = new mxCellAttributeChange(cell, 'label', Ext.encode(label));
						graph.getModel().execute(edit);

						cell.setStyle(null);
					} finally
					{
						graph.getModel().endUpdate();
					}
				}, submenu, null, true);
				menu.addItem(text1, null, function() {
					if(cell.getAttribute('evaluation') == 'Y' && cell.getAttribute('unconditional') == 'N')
						return;

					graph.getModel().beginUpdate();
					try
					{
						var edit = new mxCellAttributeChange(cell, 'evaluation', 'Y');
						graph.getModel().execute(edit);

						var edit = new mxCellAttributeChange(cell, 'unconditional', 'N');
						graph.getModel().execute(edit);

						var label = [kettle.imageTrue];
						if(cell.source.getAttribute('parallel') == 'Y')
							label.push(kettle.imageParallelHop);

						var edit = new mxCellAttributeChange(cell, 'label', Ext.encode(label));
						graph.getModel().execute(edit);

						cell.setStyle(null);
					} finally
					{
						graph.getModel().endUpdate();
					}
				}, submenu, null, cell.source.getAttribute('start') != 'Y');
				menu.addItem(text2, null, function() {
					if(cell.getAttribute('unconditional') == 'N' && cell.getAttribute('evaluation') == 'N')
						return;

					if(name != null) {
						graph.getModel().beginUpdate();
						try
						{
							var edit = new mxCellAttributeChange(cell, 'unconditional', 'N');
							graph.getModel().execute(edit);

							var edit = new mxCellAttributeChange(cell, 'evaluation', 'N');
							graph.getModel().execute(edit);

							var label = [kettle.imageFalse];
							if(cell.source.getAttribute('parallel') == 'Y')
								label.push(kettle.imageParallelHop);

							var edit = new mxCellAttributeChange(cell, 'label', Ext.encode(label));
							graph.getModel().execute(edit);

							cell.setStyle('error');
						} finally
						{
							graph.getModel().endUpdate();
						}
					}
				}, submenu, null, cell.source.getAttribute('start') != 'Y');

				menu.addItem('使节点连接失效', null, function(){ }, null, null, true);
				menu.addItem('删除节点连接', null, function(){
					graph.removeCells();
				}, null, null, true);
				menu.addItem('指出方向', null, function(){}, null, null, true);
			}
		}
	},
	
	newStep: function(node, x, y, w, h) {
		var graph = this.getGraph();
		Ext.Ajax.request({
			url: GetUrl('job/newJobEntry.do'),
			params: {graphXml: this.toXml(), pluginId: node.attributes.pluginId, name: encodeURIComponent(node.text)},
			method: 'POST',
			success: function(response) {
				var doc = response.responseXML;
         		graph.getModel().beginUpdate();
				try
				{
					var cell = graph.insertVertex(graph.getDefaultParent(), null, doc.documentElement, x, y, w, h, "icon;image=" + node.attributes.dragIcon);
					graph.setSelectionCells([cell]);
				} finally
				{
					graph.getModel().endUpdate();
				}
			}
		});
	},
	
	newHop: function(cell) {
		var doc = mxUtils.createXmlDocument();
		var hop = doc.createElement('JobHop');
		
		hop.setAttribute('from', cell.source.getAttribute('label'));
		hop.setAttribute('to', cell.target.getAttribute('label'));
		hop.setAttribute('from_nr', cell.source.getAttribute('nr'));
		hop.setAttribute('to_nr', cell.target.getAttribute('nr'));
		cell.setValue(hop);
		
		var graph = this.getGraph();
		
		graph.getModel().beginUpdate();
        try
        {
        	var edit = new mxCellAttributeChange(cell, 'enabled', 'Y');
        	graph.getModel().execute(edit);
        	edit = new mxCellAttributeChange(cell, 'evaluation', 'Y');
        	graph.getModel().execute(edit);
        	if(cell.source.getAttribute('ctype') == 'SPECIAL' && cell.source.getAttribute('start') == 'Y') {
        		edit = new mxCellAttributeChange(cell, 'unconditional', 'Y');
            	graph.getModel().execute(edit);
        	} else {
        		edit = new mxCellAttributeChange(cell, 'unconditional', 'N');
            	graph.getModel().execute(edit);
        	}
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	getEntries: function(cb) {
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('job/entries.do'),
				method: 'POST'
			})
		});
		
		store.on('load', function() {
			if(Ext.isFunction(cb))
				cb(store);
		});
		
		store.baseParams.graphXml = this.toXml();
		store.load();
		
		return store;
	}
	
});
Ext.reg('JobGraph', JobGraph);

JobGraphScheduler = Ext.extend(BaseGraph, {
	iconCls: 'job',
	initComponent: function() {
		var resultPanel = new JobResult({hidden: !this.showResult});

		var jobExecutor = this.jobExecutor = new JobExecutor();
		jobExecutor.on('beforerun', function(executor,defaultExecutionConfig) {
			var dialog = new JobExecutionConfigurationScheduler();
			dialog.show(null, function() {
				dialog.initData(defaultExecutionConfig);
			});
		});
		jobExecutor.on('result', this.doResult, this);
		this.tbar = [{
			iconCls: 'run', scope: this, tooltip: '运行这个任务', handler: this.run
		}];

		this.items = [resultPanel];


		JobGraph.superclass.initComponent.call(this);


		this.on('load', function() {
			var graph = this.getGraph();
			var root = graph.getDefaultParent();

			graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){
				Ext.each(evt.getProperty('edit').changes, function(change) {
					if (change.constructor == mxCellAttributeChange && change.cell != null)    {
						var cell = change.cell;
						if(cell.isVertex() && cell.value.nodeName == 'JobEntry' && change.attribute == 'label') {

							graph.getModel().beginUpdate();
							try
							{
								Ext.each(graph.getOutgoingEdges(cell), function(edge) {
									var edit = new mxCellAttributeChange(edge, 'from', change.value);
									graph.getModel().execute(edit);
								});

								Ext.each(graph.getIncomingEdges(cell), function(edge) {
									var edit = new mxCellAttributeChange(edge, 'to', change.value);
									graph.getModel().execute(edit);
								});
							} finally{
								graph.getModel().endUpdate();
							}
						}
					}
				});
			});

		}, this);
	},

	doResult: function(result) {
		var resultPanel = this.layout.south.panel;
		resultPanel.loadLocal(result);
	},

	toRun: function(executionId) {
		var resultPanel = this.layout.south.panel;
		if(!resultPanel.isVisible())
			this.showResultPanel();

		this.jobExecutor.fireEvent('run', executionId);
	},

	save: function() {
		Ext.Ajax.request({
			url: GetUrl('job/save.do'),
			params: {graphXml: encodeURIComponent(this.toXml())},
			method: 'POST',
			success: function(response) {
				decodeResponse(response, function(resObj) {
					Ext.Msg.show({
						title: '系统提示',
						msg: resObj.message,
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.INFO
					});
				});
			},
			failure: failureResponse
		});
	},

	run: function() {
		var jobExecutor = this.jobExecutor;
		if(jobExecutor.isRunning()) {
			Ext.Msg.alert('系统提示', '任务正在执行，请稍后...');
			return;
		}

		// 获取执行参数
		Ext.Ajax.request({
			url: GetUrl('job/initRun.do'),
			method: 'POST',
			params: {graphXml: this.toXml()},
			success: function(response) {
				var resObj = Ext.decode(response.responseText);
				jobExecutor.fireEvent('beforerun', jobExecutor, resObj);
			},
			failure: failureResponse
		});

	},

	showResultPanel: function() {
		var resultPanel = this.layout.south.panel;

		resultPanel.setVisible( !resultPanel.isVisible() );
		this.doLayout();
	},

	initContextMenu: function(menu, cell, evt) {
		var graph = this.getGraph(), me = this;
	},

	getEntries: function(cb) {
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('job/entries.do'),
				method: 'POST'
			})
		});

		store.on('load', function() {
			if(Ext.isFunction(cb))
				cb(store);
		});

		store.baseParams.graphXml = this.toXml();
		store.load();

		return store;
	}

});
Ext.reg('JobGraphScheduler',JobGraphScheduler);



DatabaseConnGrid = Ext.extend(Ext.grid.GridPanel, {
	id:"DatabaseConnGrid",
	height:470,
	width:750,
	viewConfig : {
		forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
	},
	closable:true,

	initComponent: function() {
		var me = this;
		var cm=new Ext.grid.ColumnModel([
			new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
			{header:"ID",dataIndex:"databaseId",align:"center"},
			{header:"连接名",dataIndex:"name",align:"center"},
			{header:"主机名",dataIndex:"hostName",tooltip:"这是创建时间",format:"y-M-d H:m:s",align:"center"},
			{header:"端口",dataIndex:"port",align:"center",align:"center"},
			{header:"数据库名",dataIndex:"databaseName",format:"y-M-d H:m:s",align:"center"},
			{header:"数据库类型",dataIndex:"databaseType",align:"center"},
			{header:"操作",dataIndex:"",menuDisabled:true,align:"center",
				renderer:function(v){
					return "<img src='../../ui/images/i_delete.png' class='imgCls' onclick='deleteConn()' title='删除连接'/>&nbsp;&nbsp;"+
					"<img src='../../ui/images/i_editor.png' class='imgCls' onclick='editorConn()' title='修改连接'/>&nbsp;&nbsp;";
				}
			}
		]);
		var proxy=new Ext.data.HttpProxy({url:"/common/getDatabases.do"});
		var human=Ext.data.Record.create([
			{name:"databaseId",type:"string",mapping:"databaseId"},
			{name:"name",type:"string",mapping:"name"},
			{name:"hostName",type:"string",mapping:"hostName"},
			{name:"port",type:"string",mapping:"port"},
			{name:"databaseName",type:"string",mapping:"databaseName"},
			{name:"databaseType",type:"string",mapping:"databaseType"}
		])
		var reader=new Ext.data.JsonReader({},human);
		var store=new Ext.data.Store({
			proxy:proxy,
			reader:reader
		})
		store.load();
		this.store=store;
		this.colModel=cm;
		this.tbar=new Ext.Toolbar({
			buttons:[
				{
					iconCls:"addCls",
					tooltip: '新增连接',
					handler:function(){
						var databaseDialog = new DatabaseDialog({operation:'add'});
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initTransDatabase(null);
						});
					}
				},{
					iconCls:"refreshCls",
					tooltip: '刷新',
					handler:function(){
						me.store.reload();
					}
				}

			]
		});
		DatabaseConnGrid.superclass.initComponent.call(this);
	}

});
function deleteConn(){
	var grid=Ext.getCmp("DatabaseConnGrid");
	var databaseId=grid.getSelectionModel().getSelected().get("databaseId");
	Ext.Ajax.request({
		url:"/common/deleteDatabaseConn.do",
		success:function(response,config){
			Ext.MessageBox.alert("提示","删除连接成功!");
			grid.store.reload();
		},
		failure:failureResponse,
		params:{id:databaseId}
	});

}
function editorConn(){
	var grid=Ext.getCmp("DatabaseConnGrid");
	var databaseConnName=grid.getSelectionModel().getSelected().get("name");

	var databaseDialog = new DatabaseDialog({operation:'editor'});
	databaseDialog.on('create', onDatabaseCreate);
	databaseDialog.show(null, function() {
		databaseDialog.initTransDatabase(databaseConnName);
	});
}
function onDatabaseCreate(dialog) {
	getActiveGraph().onDatabaseMerge(dialog.getValue());
	dialog.close();
};
Ext.reg('DatabaseConnGrid',DatabaseConnGrid);

