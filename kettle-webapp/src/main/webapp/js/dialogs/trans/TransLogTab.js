

TransLogTab = Ext.extend(Ext.Panel, {
	title: '日志',
	layout: 'border',
	initComponent: function() {
		
		var content = new Ext.Panel({
			region: 'center',
			defaults: {border: false},
			layout: 'card',
			activeItem: 0,
			deferredRender: false,
			items: [{
				xtype: 'TransLogTrans'
			},{
				xtype: 'TransLogStep'
			},{
				xtype: 'TransLogRunning'
			},{
				xtype: 'TransLogChannel'
			},{
				xtype: 'TransLogMetrics'
			}]
		});
		
		var listBox = new ListBox({
			region: 'west',
			width: 150,
			store: new Ext.data.JsonStore({
				fields: ['value','text'],
				data: [{value: 0, text: '转换'}, 
				       {value: 1, text: '步骤'}, 
				       {value: 2, text: '运行'},
				       {value: 3, text: '日志通道'},
				       {value: 4, text: 'Metrics'}]
			}),
			value: 0
		});
		
		this.items = [listBox, content];
		
		TransLogTab.superclass.initComponent.call(this);
		
		listBox.on('valueChange', function(v) {
			setTimeout(function() {
				content.getLayout().setActiveItem(parseInt(v));
			}, 50);
		});
	}
});