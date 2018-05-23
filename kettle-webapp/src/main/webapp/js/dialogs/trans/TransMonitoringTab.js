TransMonitoringTab = Ext.extend(Ext.form.FormPanel, {
	title: '监控',
	labelWidth: 140,
	bodyStyle: 'padding: 10px 15px',
	defaultType: 'textfield',
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), root = graph.getDefaultParent();
		
		this.items = [{
			fieldLabel: '开启步骤性能监控?',
			xtype: 'checkbox',
			checked: 'Y' == root.getAttribute('capture_step_performance'),
			anchor: '-10'
		},{
			fieldLabel: '步骤性能监测间隔(毫秒)',
			anchor: '-10',
			value: root.getAttribute('step_performance_capturing_delay')
		},{
			fieldLabel: '内存中最大的快照数量',
			anchor: '-10',
			value: root.getAttribute('step_performance_capturing_size_limit')
		}];
		
		TransMonitoringTab.superclass.initComponent.call(this);
	}
	
});