JobEntryEval = Ext.extend(Ext.Window, {
	title: '使用JavaScript脚本验证',
	width: 600,
	height: 400,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this,
		graph = getActiveGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			border: false,
			labelWidth: 100,
			region: 'north',
			height: 50,
			labelAlign: 'right',
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		this.items = [form, {
			xtype: 'form',
			region: 'center',
			border: false,
			bodyStyle: 'padding: 0 10px 10px 10px',
			labelWidth: 1,
			layout: 'fit',
			items: [{
				xtype: 'textarea',
				emptyText: '请输入JavaScript脚本',
				name: 'script',
				value: decodeURIComponent(cell.getAttribute('script'))
			}]
			
		}];
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				graph.getModel().beginUpdate();
                try
                {
                	
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		JobEntryEval.superclass.initComponent.call(this);
	}
});

Ext.reg('EVAL', JobEntryEval);
