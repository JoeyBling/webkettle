EnterValueDialog = Ext.extend(Ext.Window, {
	width: 350,
	height: 250,
	layout: 'fit',
	modal: true,
	title: 'E输入一个值',
	initComponent: function() {
		var me = this, value = this.initialConfig.value || {};
		
		var wValueType = new Ext.form.ComboBox({
			fieldLabel: '类型',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('valueMetaStore'),
			value: value.type
		});	//type
		var wInputString = new Ext.form.TextField({fieldLabel: '值', anchor: '-10', value: value.text});	//text
		var wFormat = new Ext.form.ComboBox({
			fieldLabel: '转换格式',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('valueFormatStore'), 
			value: value.mask
		});	//mask
		var wLength = new Ext.form.TextField({fieldLabel: '长度', anchor: '-10', value: value.length});	//length
		var wPrecision = new Ext.form.TextField({fieldLabel: '精度', anchor: '-10', value: value.precision});	//precision
		
		wValueType.on('change', function(cb, v) {
			var store = Ext.StoreMgr.get('valueFormatStore');
			store.baseParams.valueType = v;
			store.load();
		});
		
		this.items = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 70,
			items: [wValueType, wInputString, wFormat, wLength, wPrecision]
		});
		
		this.bbar = ['->', {
			text: '取消', scope: this, handler: function() {this.close()}
		}, {
			text: '确定', scope: this, handler: function() {
				this.fireEvent('ok', {
					name: 'constant',
					type: wValueType.getValue(),
					text: wInputString.getValue(),
					mask: wFormat.getValue(),
					length: wLength.getValue(),
					precision: wPrecision.getValue()
				});
				this.close();
			}
		}];
		
		EnterValueDialog.superclass.initComponent.call(this);
		this.addEvents('ok');
	}
});