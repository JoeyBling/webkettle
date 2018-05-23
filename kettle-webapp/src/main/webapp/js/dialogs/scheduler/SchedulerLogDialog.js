SchedulerLogDialog = Ext.extend(Ext.Window, {
	title: '历史日志',
	width: 900,
	height: 500,
	layout: 'fit',
	modal: true,
	initComponent: function() {
		
		var store = new Ext.data.JsonStore( {
			fields : [ 'fireId', 'jobName', 'startTime', 'endTime','execMethod', 'status', 'caozuo' ],
			url : GetUrl('executiontrace/pagelist.do'),
			totalProperty: 'totalCount',
			root: 'rows'
		});
		
		var renderCaozuo = function(v, m, record) {
			var str = '<a href="javascript:;">查看详细</a>&nbsp;&nbsp;';
			str += '|&nbsp;&nbsp;<a href="javascript:;">重新执行</a>';
			return str;
		};
		
		var grid = this.items = new Ext.grid.GridPanel({
			border: false,
			store : store,
			columns : [ 
			   {header : '', dataIndex : 'fireId', width : 140, hidden : true}, 
	           {header : '任务名', dataIndex : 'jobName', width : 200}, 
	           {header : '开始时间', dataIndex : 'startTime', width : 160}, 
	           {header : '完成时间', dataIndex : 'endTime', width : 160}, 
	           {header : '执行方式', dataIndex : 'execMethod', width : 80}, 
	           {header : '状态', dataIndex : 'status', width : 70},
	           {header : '', dataIndex : 'caozuo', width : 160, renderer : renderCaozuo}
	        ]
		});
		
		grid.on('cellclick', function(grid, rowIndex, columnIndex, e) {
			if (e.getTarget().innerHTML == '查看详细' ) { 
				var record = grid.getStore().getAt(rowIndex);
				this.showDetails(record.get('fireId'));
			} else if(e.getTarget().innerHTML == '重新执行') {
				alert('功能尚未开发，请关注群：565815856');
			}
		}, this);
		
		this.initData = function(jobName) {
			store.baseParams.jobName = jobName;
			store.load({params: {start: 0, limit: 15}});
		};
		
		this.bbar = new Ext.PagingToolbar({
			store: store,
			pageSize: 15,
			displayInfo: true,  
	        displayMsg: '显示第{0} -> {1}条记录，共{2}条',  
	        emptyMsg: '无记录可显示',
	        beforePageText:'页数',
	        afterPageText:'总共{0}页',
	        firstText:'第一页',
	        prevText:'上一页',
	        nextText:'下一页',
	        lastText:'最后一页',
	        refreshText:'刷新',
		})
			
		SchedulerLogDialog.superclass.initComponent.call(this);
	},
	
	showDetails: function(fireId) {
		Ext.Ajax.request({
			url: GetUrl('executiontrace/detail.do'),
			method: 'POST',
			params: {fireId: fireId},
			success: function(response) {
				var resObj = Ext.decode(response.responseText);
				var graphPanel = Ext.create({border: false, readOnly: true, showResult: true}, resObj.GraphType);
				var dialog = new LogDetailDialog({
					items: graphPanel
				});
				dialog.show(null, function() {
					var xmlDocument = mxUtils.parseXml(decodeURIComponent(resObj.graphXml));
					var decoder = new mxCodec(xmlDocument);
					var node = xmlDocument.documentElement;
					
					var graph = graphPanel.getGraph();
					decoder.decode(node, graph.getModel());
					graphPanel.setTitle(graph.getDefaultParent().getAttribute('name'));
					
					graphPanel.doResult(Ext.decode(resObj.executionLog));
				});
			}
		});
	}
});

LogDetailDialog = Ext.extend(Ext.Window, {
	title: '执行日志',
	width: 900,
	height: 600,
	layout: 'fit',
	modal: true
});