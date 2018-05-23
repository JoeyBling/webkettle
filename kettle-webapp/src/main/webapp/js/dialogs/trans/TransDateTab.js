TransDateTab = Ext.extend(Ext.form.FormPanel, {
	title: '日期',
	labelWidth: 130,
	bodyStyle: 'padding: 10px 15px',
	defaultType: 'textfield',
	initComponent: function() {
		this.items = [{
			fieldLabel: '最大日期数据库连接',
			anchor: '-10'
		},{
			fieldLabel: '最大日期表',
			anchor: '-10'
		},{
			fieldLabel: '最大日期字段',
			anchor: '-10'
		},{
			fieldLabel: '最大日期偏移(秒)',
			anchor: '-10'
		},{
			fieldLabel: '最大日期区别(秒)',
			anchor: '-10'
		}];
		
		TransDateTab.superclass.initComponent.call(this);
	}
	
});