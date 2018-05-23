TransResult = Ext.extend(Ext.TabPanel, {
	region: 'south',
	hidden: true,
	height: 250,
	activeTab: 2,
	initComponent: function() {
		var me = this;
		var measureStore = new Ext.data.ArrayStore({
			fields: ['name', 'num', 'r', 'x', 'i', 'o', 'u', 'f', 'e', 'a', 't', 's', 'pio']
		});
		var log = new Ext.form.TextArea({readOnly: true});
		
		this.items = [{
			title: '执行历史',
			iconCls: 'imageShowHistory',
			disabled: true,
		}, {
			xtype: 'form',
			title: '日志',
			iconCls: 'imageShowLog',
			layout: 'fit',
			items: log
		}, {
			xtype: 'grid',
			title: '步骤度量',
			iconCls: 'imageShowGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: '步骤名称', dataIndex: 'name', width: 150
			},{
				header: '复制的记录行数', dataIndex: 'num', width: 100
			},{
				header: '读', dataIndex: 'r', width: 70
			},{
				header: '写', dataIndex: 'x', width: 70
			},{
				header: '输入', dataIndex: 'i', width: 70
			},{
				header: '输出', dataIndex: 'o', width: 70
			},{
				header: '更新', dataIndex: 'u', width: 70
			},{
				header: '拒绝', dataIndex: 'f', width: 70
			},{
				header: '错误', dataIndex: 'e', width: 70
			},{
				header: '激活', dataIndex: 'a', width: 70
			},{
				header: '时间', dataIndex: 't', width: 60
			},{
				header: '速度(条记录/秒)', dataIndex: 's', width: 120
			},{
				header: 'Pri/in/out', dataIndex: 'pio', width: 100
			}],
			store: measureStore
		}, {
			title: '性能图',
			iconCls: 'imageShowPerf',
			disabled: true
		},{
			title: 'Metrics',
			iconCls: 'imageGantt',
			disabled: true
		}, {
			title: 'Preview Data',
			iconCls: 'imagePreview',
			disabled: true
		}];
		
//		this.loadResult = function(executionId) {
//			if(!executionId) return;
//			
//			Ext.Ajax.request({
//				url: GetUrl('trans/result.do'),
//				params: {executionId: executionId},
//				method: 'POST',
//				success: function(response) {
//					var result = Ext.decode(response.responseText);
//					measureStore.removeAll();
//					log.setValue('');
//					
//					measureStore.loadData(result.stepMeasure);
//					log.setValue(result.log);
//					
//					getActiveGraph().updateStatus(result.stepStatus);
//					
//					if(!result.finished) {
//						setTimeout(function() { me.loadResult(executionId); }, 500);
//					}
//				}
//			});
//		};
		
		this.loadLocal = function(result) {
			measureStore.loadData(result.stepMeasure);
			log.setValue(result.log);
//			ownerGraph.updateStatus(result.stepStatus);
		};
		
		TransResult.superclass.initComponent.call(this);
		
//		var previewGrid = new DynamicEditorGrid({
//		title: 'Preview Data',
//		rowNumberer: true,
//		tbar: [{
//			xtype: 'radio', name: 'preivew_method', boxLabel: '${TransPreview.FirstRows.Label}'
//		}, '-', {
//			xtype: 'radio', name: 'preivew_method', boxLabel: '${TransPreview.LastRows.Label}'
//		}]
//	});		
		
//		var me = this;
//        setTimeout(function() {
//        	var transGraph = getActiveGraph();
//        	if(!transGraph) return;
//        	var graph = transGraph.getGraph();
//            if(!graph) return; 
//        	 
//             graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt) {
//     			var cell = graph.getSelectionCell();
//     			if(cell != null && me.result) {
//     				var records = me.result.previewData[cell.getAttribute('label')];
//     				if(records) previewGrid.loadMetaAndValue(records);
//     			}
//     		});
//        }, 500);
	}
});