TransDialog = Ext.extend(Ext.Window, {
	title: '转换属性',
	width: 700,
	height: 500,
	closeAction: 'close',
	layout: 'fit',
	modal: true,
	bodyStyle: 'padding: 5px;',
	
	initComponent: function() {
		var me = this, graph = getActiveGraph().getGraph(), root = graph.getDefaultParent();
		
		var transForm = new TransTab();
		var transParam = new TransParamTab();
		var transLog = new TransLogTab();
		var transDate = new TransDateTab();
		var transDependencies = new TransDependenciesTab();
		var transMisc = new TransMiscTab();
		var transMonitoring = new TransMonitoringTab();
		
		var tabPanel = new Ext.TabPanel({
			activeTab: 0,
			plain: true,
			items: [transForm, transParam, transLog, transDate, transDependencies, transMisc, transMonitoring]
		});
		
		this.items = tabPanel;
		this.bbar = ['->', {text: '取消', handler: function() {
				me.close();
		}}, {text: '确定', handler: function() {
				graph.getModel().beginUpdate();
				try {
					var edit = new mxCellAttributeChange(cell, 'copies', textField.getValue());
					graph.getModel().execute(edit);
				} finally {
					graph.getModel().endUpdate();
				}
               
				me.close();
			}}
		];
		
		TransDialog.superclass.initComponent.call(this);
	}
});