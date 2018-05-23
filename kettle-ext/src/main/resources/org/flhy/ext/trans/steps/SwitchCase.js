SwitchCaseDialog = Ext.extend(KettleDialog, {
	
	title: 'Switch / Case',
	width: 600,
	height: 500,
	
	initComponent: function() {
		var store = new Ext.data.JsonStore({
			fields: ['value', 'target_step']
		});
		
		var wFieldName = new Ext.form.ComboBox({
			fieldLabel: 'Switch 字段',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label'))
		});
		var wContains = new Ext.form.Checkbox({fieldLabel: '使用字符串包含比较符'});
		var wDataType = new Ext.form.ComboBox({
			fieldLabel: 'Case值数据类型',
			anchor: '-10',
			displayField: 'name',
			valueField: 'id',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('valueMetaStore')
		});
		var wConversionMask = new Ext.form.TextField({fieldLabel: 'Case值转换掩码', anchor: '-10'});
		var wDecimalSymbol = new Ext.form.TextField({fieldLabel: 'Case值小数点符号', anchor: '-10'});
		var wGroupingSymbol = new Ext.form.TextField({fieldLabel: 'Case值分组标志', anchor: '-10'});
		
		var wDefaultTarget = new Ext.form.ComboBox({
			fieldLabel: '默认目标步骤',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().nextSteps(cell.getAttribute('label'))
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			SwitchCaseDialog.superclass.initData.apply(this, [cell]);
			
			wFieldName.setValue(cell.getAttribute('fieldname'));
			wContains.setValue(cell.getAttribute('use_contains') == 'Y');
			wDataType.setValue(cell.getAttribute('case_value_type'));
			wConversionMask.setValue(cell.getAttribute('case_value_format'));
			wDecimalSymbol.setValue(cell.getAttribute('case_value_decimal'));
			wGroupingSymbol.setValue(cell.getAttribute('case_value_group'));
			store.loadData(Ext.decode(cell.getAttribute('cases')));
			wDefaultTarget.setValue(cell.getAttribute('default_target_step'));
		};
		
		this.saveData = function(){
			var data = {};
			data.fieldname = wFieldName.getValue();
			data.use_contains = wContains.getValue() ? 'Y' : 'N';
			data.case_value_type = wDataType.getValue();
			data.case_value_format = wConversionMask.getValue();
			data.case_value_decimal = wDecimalSymbol.getValue();
			data.case_value_group = wGroupingSymbol.getValue();
			data.cases = Ext.encode(store.toJson());
			data.default_target_step = wDefaultTarget.getValue();
			
			return data;
		};
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 170,
					labelWidth: 130,
					xtype: 'KettleForm',
					items: [wFieldName, wContains, wDataType, wConversionMask, wDecimalSymbol, wGroupingSymbol]
				}, {
					region: 'center',
					xtype: 'KettleEditorGrid',
					title: 'Case值映射',
					columns: [new Ext.grid.RowNumberer(), {
						header: '值', dataIndex: 'value', width: 200, editor: new Ext.form.TextField()
						},{
						header: '目标步骤', dataIndex: 'target_step', width: 200, editor: new Ext.form.ComboBox({
							anchor: '-10',
							displayField: 'name',
							valueField: 'name',
							typeAhead: true,
					        forceSelection: true,
					        triggerAction: 'all',
					        selectOnFocus:true,
							store: getActiveGraph().nextSteps(cell.getAttribute('label'))
						})
					}],
					store: store
				}, {
					region: 'south',
					height: 35,
					border: false,
					xtype: 'KettleForm',
					items: [wDefaultTarget]
				}]
		};
		
		SwitchCaseDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SwitchCase', SwitchCaseDialog);